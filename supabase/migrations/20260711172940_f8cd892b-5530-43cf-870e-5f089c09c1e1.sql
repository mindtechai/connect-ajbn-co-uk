
-- Presentation demo mode: any authenticated user counts as approved.
CREATE OR REPLACE FUNCTION public.is_approved_member(_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT _uid IS NOT NULL;
$$;

-- Directory: allow any authenticated user to browse.
CREATE OR REPLACE FUNCTION public.member_directory_list()
 RETURNS TABLE(id uuid, first_name text, last_name text, company text, title text, industry text, bio text, linkedin text, tags text[], is_lion boolean, is_messaging_active boolean, enquiry_count integer, is_verified_connector boolean, is_top_ambassador boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_top uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
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
    (v_top IS NOT NULL AND p.id = v_top)
  FROM public.profiles p
  ORDER BY p.last_name ASC NULLS LAST, p.first_name ASC NULLS LAST;
END;
$function$;

-- Leaderboard: unlock for any authenticated user.
CREATE OR REPLACE FUNCTION public.referral_leaderboard(_limit integer DEFAULT 20)
 RETURNS TABLE(user_id uuid, first_name text, last_name text, company text, referral_count bigint, is_lion boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  RETURN QUERY
  SELECT p.id, p.first_name, p.last_name, p.company,
    count(r.id)::bigint AS referral_count,
    EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'impact_lion') AS is_lion
  FROM public.profiles p
  JOIN public.profiles r ON r.referred_by_code = p.referral_code
  GROUP BY p.id, p.first_name, p.last_name, p.company
  ORDER BY referral_count DESC, p.first_name ASC
  LIMIT _limit;
END;
$function$;
