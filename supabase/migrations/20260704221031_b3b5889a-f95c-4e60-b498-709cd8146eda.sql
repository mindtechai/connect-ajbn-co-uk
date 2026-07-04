
CREATE OR REPLACE FUNCTION public.public_member_directory()
RETURNS TABLE(company text, industry text, member_count bigint, has_lion boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.company,
    COALESCE(NULLIF(p.industry, ''), 'Other') AS industry,
    count(*)::bigint AS member_count,
    bool_or(ur.role = 'impact_lion') AS has_lion
  FROM public.profiles p
  JOIN public.user_roles ur ON ur.user_id = p.id
  WHERE p.company IS NOT NULL
    AND btrim(p.company) <> ''
    AND ur.role IN ('ajbn_member', 'impact_lion')
  GROUP BY p.company, COALESCE(NULLIF(p.industry, ''), 'Other')
  ORDER BY p.company ASC;
$$;

REVOKE ALL ON FUNCTION public.public_member_directory() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_member_directory() TO anon, authenticated;
