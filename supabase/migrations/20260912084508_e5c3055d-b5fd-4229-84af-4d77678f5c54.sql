DROP FUNCTION public.quiet_hours_member_ids();
DROP FUNCTION public.member_directory_list();

CREATE FUNCTION public.member_directory_list()
RETURNS TABLE(
  id uuid,
  first_name text,
  last_name text,
  company text,
  title text,
  industry text,
  bio text,
  linkedin text,
  tags text[],
  is_lion boolean,
  is_messaging_active boolean,
  enquiry_count integer,
  is_verified_connector boolean,
  is_top_ambassador boolean,
  calendly_url text,
  quiet_hours_enabled boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
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
    CASE WHEN p.calendly_url ~* '^https?://' THEN p.calendly_url ELSE NULL END,
    p.quiet_hours_enabled
  FROM public.profiles p
  WHERE EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = p.id
      AND ur.role IN ('ajbn_member','impact_lion','super_admin')
  )
  ORDER BY p.last_name ASC NULLS LAST, p.first_name ASC NULLS LAST;
END;
$function$;

REVOKE ALL ON FUNCTION public.member_directory_list() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.member_directory_list() TO authenticated, service_role;