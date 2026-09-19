CREATE OR REPLACE FUNCTION public.member_directory_list()
RETURNS TABLE(id uuid, first_name text, last_name text, company text, title text, industry text, bio text, linkedin text, tags text[], is_lion boolean, is_messaging_active boolean, enquiry_count integer, is_verified_connector boolean, is_top_ambassador boolean, calendly_url text, quiet_hours_enabled boolean)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
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
  WHERE p.deleted_at IS NULL
    AND p.is_approved
    AND EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = p.id
        AND ur.role IN ('ajbn_member','impact_lion','super_admin')
    )
  ORDER BY p.last_name ASC NULLS LAST, p.first_name ASC NULLS LAST;
END;
$function$;

CREATE OR REPLACE FUNCTION public.referrers_directory()
RETURNS TABLE(id uuid, first_name text, last_name text, company text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT p.id, p.first_name, p.last_name, p.company
  FROM public.profiles p
  WHERE p.deleted_at IS NULL
    AND p.is_approved
    AND EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = p.id
        AND ur.role IN ('ajbn_member','impact_lion','super_admin')
    )
  ORDER BY p.first_name ASC NULLS LAST, p.last_name ASC NULLS LAST;
$function$;

CREATE OR REPLACE FUNCTION public.public_member_directory()
RETURNS TABLE(company text, industry text, member_count bigint, has_lion boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT
    p.company,
    COALESCE(NULLIF(p.industry, ''), 'Other') AS industry,
    count(*)::bigint AS member_count,
    bool_or(ur.role = 'impact_lion') AS has_lion
  FROM public.profiles p
  JOIN public.user_roles ur ON ur.user_id = p.id
  WHERE p.company IS NOT NULL
    AND btrim(p.company) <> ''
    AND p.deleted_at IS NULL
    AND p.is_approved
    AND ur.role IN ('ajbn_member', 'impact_lion')
  GROUP BY p.company, COALESCE(NULLIF(p.industry, ''), 'Other')
  ORDER BY p.company ASC;
$function$;