
DROP FUNCTION IF EXISTS public.member_directory_list();

CREATE TABLE public.messaging_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active boolean NOT NULL DEFAULT true,
  activated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messaging_profiles TO authenticated;
GRANT ALL ON public.messaging_profiles TO service_role;
ALTER TABLE public.messaging_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own messaging profile"
  ON public.messaging_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_messaging_profiles_updated_at
  BEFORE UPDATE ON public.messaging_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at timestamptz,
  last_read_a timestamptz,
  last_read_b timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT conversations_user_order CHECK (user_a < user_b),
  CONSTRAINT conversations_unique_pair UNIQUE (user_a, user_b)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can read conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = user_a OR auth.uid() = user_b);

CREATE POLICY "Participants can update conversation read state"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = user_a OR auth.uid() = user_b)
  WITH CHECK (auth.uid() = user_a OR auth.uid() = user_b);

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX messages_conversation_created_idx
  ON public.messages (conversation_id, created_at DESC);
GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can read messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (c.user_a = auth.uid() OR c.user_b = auth.uid())
    )
  );

CREATE POLICY "Participants can send messages when both active"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.user_a = auth.uid() OR c.user_b = auth.uid())
        AND EXISTS (SELECT 1 FROM public.messaging_profiles mp1 WHERE mp1.user_id = c.user_a AND mp1.is_active)
        AND EXISTS (SELECT 1 FROM public.messaging_profiles mp2 WHERE mp2.user_id = c.user_b AND mp2.is_active)
    )
  );

CREATE OR REPLACE FUNCTION public.bump_conversation_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations
    SET last_message_at = NEW.created_at,
        updated_at = now()
    WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER messages_bump_conversation
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.bump_conversation_last_message();

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;

CREATE OR REPLACE FUNCTION public.is_approved_member(_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_uid,'ajbn_member')
      OR public.has_role(_uid,'impact_lion')
      OR public.has_role(_uid,'super_admin');
$$;

CREATE OR REPLACE FUNCTION public.activate_messaging()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT public.is_approved_member(auth.uid()) THEN
    RAISE EXCEPTION 'Only approved members can activate messaging';
  END IF;
  INSERT INTO public.messaging_profiles (user_id, is_active)
    VALUES (auth.uid(), true)
  ON CONFLICT (user_id) DO UPDATE SET is_active = true, updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.is_messaging_active(_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.messaging_profiles
    WHERE user_id = _uid AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.start_or_get_conversation(_other uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_me uuid := auth.uid();
  v_a uuid;
  v_b uuid;
  v_id uuid;
BEGIN
  IF v_me IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _other IS NULL OR _other = v_me THEN RAISE EXCEPTION 'Invalid recipient'; END IF;
  IF NOT public.is_approved_member(v_me) OR NOT public.is_approved_member(_other) THEN
    RAISE EXCEPTION 'Both users must be approved members';
  END IF;
  IF NOT public.is_messaging_active(v_me) THEN
    RAISE EXCEPTION 'Activate your chat inbox first';
  END IF;
  IF NOT public.is_messaging_active(_other) THEN
    RAISE EXCEPTION 'Recipient has not enabled messaging';
  END IF;

  IF v_me < _other THEN v_a := v_me; v_b := _other; ELSE v_a := _other; v_b := v_me; END IF;

  SELECT id INTO v_id FROM public.conversations WHERE user_a = v_a AND user_b = v_b;
  IF v_id IS NULL THEN
    INSERT INTO public.conversations (user_a, user_b) VALUES (v_a, v_b) RETURNING id INTO v_id;
  END IF;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.messaging_inbox()
RETURNS TABLE (
  conversation_id uuid,
  other_user_id uuid,
  other_first_name text,
  other_last_name text,
  other_company text,
  last_message_at timestamptz,
  last_message_body text,
  unread_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_me uuid := auth.uid();
BEGIN
  IF v_me IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  RETURN QUERY
  SELECT
    c.id,
    CASE WHEN c.user_a = v_me THEN c.user_b ELSE c.user_a END,
    p.first_name,
    p.last_name,
    p.company,
    c.last_message_at,
    (SELECT m.body FROM public.messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1),
    (SELECT count(*) FROM public.messages m
      WHERE m.conversation_id = c.id
        AND m.sender_id <> v_me
        AND (
          (c.user_a = v_me AND (c.last_read_a IS NULL OR m.created_at > c.last_read_a))
          OR
          (c.user_b = v_me AND (c.last_read_b IS NULL OR m.created_at > c.last_read_b))
        )
    )
  FROM public.conversations c
  JOIN public.profiles p ON p.id = (CASE WHEN c.user_a = v_me THEN c.user_b ELSE c.user_a END)
  WHERE c.user_a = v_me OR c.user_b = v_me
  ORDER BY c.last_message_at DESC NULLS LAST;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_conversation_read(_conversation uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_me uuid := auth.uid();
BEGIN
  IF v_me IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  UPDATE public.conversations
    SET last_read_a = CASE WHEN user_a = v_me THEN now() ELSE last_read_a END,
        last_read_b = CASE WHEN user_b = v_me THEN now() ELSE last_read_b END
    WHERE id = _conversation AND (user_a = v_me OR user_b = v_me);
END;
$$;

CREATE OR REPLACE FUNCTION public.member_directory_list()
RETURNS TABLE(
  id uuid,
  first_name text,
  last_name text,
  company text,
  title text,
  industry text,
  bio text,
  linkedin text,
  is_lion boolean,
  is_messaging_active boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (
    public.has_role(auth.uid(), 'ajbn_member')
    OR public.has_role(auth.uid(), 'impact_lion')
    OR public.has_role(auth.uid(), 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Insufficient role';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.first_name,
    p.last_name,
    p.company,
    p.title,
    p.industry,
    p.bio,
    CASE WHEN p.linkedin ~* '^https?://' THEN p.linkedin ELSE NULL END,
    EXISTS (SELECT 1 FROM public.user_roles ur2 WHERE ur2.user_id = p.id AND ur2.role = 'impact_lion'),
    EXISTS (SELECT 1 FROM public.messaging_profiles mp WHERE mp.user_id = p.id AND mp.is_active)
  FROM public.profiles p
  WHERE EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = p.id
      AND ur.role IN ('ajbn_member','impact_lion','super_admin')
  )
  ORDER BY p.last_name ASC NULLS LAST, p.first_name ASC NULLS LAST;
END;
$$;

REVOKE ALL ON FUNCTION public.activate_messaging() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.activate_messaging() TO authenticated;
REVOKE ALL ON FUNCTION public.is_messaging_active(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_messaging_active(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.start_or_get_conversation(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_or_get_conversation(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.messaging_inbox() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.messaging_inbox() TO authenticated;
REVOKE ALL ON FUNCTION public.mark_conversation_read(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_conversation_read(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.is_approved_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_approved_member(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.member_directory_list() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.member_directory_list() TO authenticated;
