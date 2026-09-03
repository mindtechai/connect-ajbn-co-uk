-- Member blocks
CREATE TABLE public.member_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

GRANT SELECT, INSERT, DELETE ON public.member_blocks TO authenticated;
GRANT ALL ON public.member_blocks TO service_role;

ALTER TABLE public.member_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members manage their own blocks"
  ON public.member_blocks FOR SELECT TO authenticated
  USING (blocker_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Members can block others"
  ON public.member_blocks FOR INSERT TO authenticated
  WITH CHECK (blocker_id = auth.uid());

CREATE POLICY "Members can unblock"
  ON public.member_blocks FOR DELETE TO authenticated
  USING (blocker_id = auth.uid());

-- Member reports
CREATE TABLE public.member_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_name TEXT,
  reason TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  context TEXT NOT NULL DEFAULT 'profile',
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.member_reports TO authenticated;
GRANT UPDATE ON public.member_reports TO authenticated;
GRANT ALL ON public.member_reports TO service_role;

ALTER TABLE public.member_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reporters and admins can view reports"
  ON public.member_reports FOR SELECT TO authenticated
  USING (reporter_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Members can submit reports"
  ON public.member_reports FOR INSERT TO authenticated
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Admins can update report status"
  ON public.member_reports FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER trg_member_reports_updated
  BEFORE UPDATE ON public.member_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Block helper
CREATE OR REPLACE FUNCTION public.is_block_between(_a uuid, _b uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.member_blocks
    WHERE (blocker_id = _a AND blocked_id = _b)
       OR (blocker_id = _b AND blocked_id = _a)
  );
$$;

-- Enforce blocks when starting a conversation
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
  IF public.is_block_between(v_me, _other) THEN
    RAISE EXCEPTION 'This conversation is blocked';
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

-- Enforce blocks on every message insert
CREATE OR REPLACE FUNCTION public.enforce_message_block()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_a uuid; v_b uuid; v_other uuid;
BEGIN
  SELECT user_a, user_b INTO v_a, v_b FROM public.conversations WHERE id = NEW.conversation_id;
  IF v_a IS NULL THEN RAISE EXCEPTION 'Conversation not found'; END IF;
  v_other := CASE WHEN v_a = NEW.sender_id THEN v_b ELSE v_a END;
  IF public.is_block_between(NEW.sender_id, v_other) THEN
    RAISE EXCEPTION 'This member cannot be messaged';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_message_block
  BEFORE INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.enforce_message_block();