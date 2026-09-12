ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS calendly_url text;

CREATE TABLE public.one_to_ones (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  target_name text,
  clicked_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.one_to_ones TO authenticated;
GRANT ALL ON public.one_to_ones TO service_role;
ALTER TABLE public.one_to_ones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members log their own 1-2-1 clicks"
  ON public.one_to_ones FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Members read their own 1-2-1 clicks"
  ON public.one_to_ones FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR public.has_role(auth.uid(), 'super_admin'));
CREATE INDEX one_to_ones_requester_idx ON public.one_to_ones (requester_id, clicked_at DESC);

CREATE TABLE public.board_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('need','offer')),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('Property','Finance','Legal','Tax','Other')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.board_posts TO authenticated;
GRANT ALL ON public.board_posts TO service_role;
ALTER TABLE public.board_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved members read live board posts"
  ON public.board_posts FOR SELECT TO authenticated
  USING (
    (expires_at > now() OR auth.uid() = author_id)
    AND (
      public.has_role(auth.uid(), 'ajbn_member')
      OR public.has_role(auth.uid(), 'impact_lion')
      OR public.has_role(auth.uid(), 'super_admin')
    )
  );
CREATE POLICY "Approved members create their own board posts"
  ON public.board_posts FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND (
      public.has_role(auth.uid(), 'ajbn_member')
      OR public.has_role(auth.uid(), 'impact_lion')
      OR public.has_role(auth.uid(), 'super_admin')
    )
  );
CREATE POLICY "Authors update their own board posts"
  ON public.board_posts FOR UPDATE TO authenticated
  USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors delete their own board posts"
  ON public.board_posts FOR DELETE TO authenticated
  USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'super_admin'));
CREATE INDEX board_posts_kind_idx ON public.board_posts (kind, expires_at DESC);
CREATE TRIGGER update_board_posts_updated_at
  BEFORE UPDATE ON public.board_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP FUNCTION IF EXISTS public.member_directory_list();
CREATE OR REPLACE FUNCTION public.member_directory_list()
 RETURNS TABLE(id uuid, first_name text, last_name text, company text, title text, industry text, bio text, linkedin text, tags text[], is_lion boolean, is_messaging_active boolean, enquiry_count integer, is_verified_connector boolean, is_top_ambassador boolean, calendly_url text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_top uuid;
BEGIN
  IF NOT (
    public.has_role(auth.uid(), 'ajbn_member')
    OR public.has_role(auth.uid(), 'impact_lion')
    OR public.has_role(auth.uid(), 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Insufficient role';
  END IF;

  v_top := public.top_network_ambassador();

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
    COALESCE(p.tags, '{}'::text[]),
    EXISTS (SELECT 1 FROM public.user_roles ur2 WHERE ur2.user_id = p.id AND ur2.role = 'impact_lion'),
    EXISTS (SELECT 1 FROM public.messaging_profiles mp WHERE mp.user_id = p.id AND mp.is_active),
    COALESCE((SELECT COUNT(*)::int FROM public.service_enquiries se WHERE se.user_id = p.id), 0),
    COALESCE((SELECT COUNT(*) FROM public.service_enquiries se WHERE se.user_id = p.id), 0) >= 5,
    (v_top IS NOT NULL AND p.id = v_top),
    CASE WHEN p.calendly_url ~* '^https?://' THEN p.calendly_url ELSE NULL END
  FROM public.profiles p
  WHERE EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = p.id
      AND ur.role IN ('ajbn_member','impact_lion','super_admin')
  )
  ORDER BY p.last_name ASC NULLS LAST, p.first_name ASC NULLS LAST;
END;
$function$;