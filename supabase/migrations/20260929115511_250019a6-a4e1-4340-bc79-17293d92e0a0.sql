DROP FUNCTION public.public_flagship_exhibitors();

CREATE FUNCTION public.public_flagship_exhibitors()
RETURNS TABLE (
  sort_order integer,
  id uuid,
  company_name text,
  primary_sector text,
  city text,
  website text,
  logo_filename text,
  short_bio text,
  services_list text[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT fe.sort_order,
         cm.id,
         cm.company_name,
         cm.primary_sector,
         cm.city,
         cm.website,
         cm.logo_filename,
         cm.short_bio,
         cm.services_list
  FROM public.flagship_exhibitors fe
  JOIN public.corporate_members cm ON cm.id = fe.company_id
  WHERE cm.verified
  ORDER BY fe.sort_order ASC;
$$;

GRANT EXECUTE ON FUNCTION public.public_flagship_exhibitors() TO anon, authenticated;
REVOKE ALL ON FUNCTION public.public_flagship_exhibitors() FROM public;