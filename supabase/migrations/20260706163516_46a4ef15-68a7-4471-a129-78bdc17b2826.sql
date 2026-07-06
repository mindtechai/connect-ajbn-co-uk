
-- 1) Remove overly-broad directory read policy exposing full profile rows
DROP POLICY IF EXISTS "Members read member directory" ON public.profiles;

-- 2) Safe directory RPC — non-sensitive columns only
CREATE OR REPLACE FUNCTION public.member_directory_list()
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text,
  company text,
  title text,
  industry text,
  bio text,
  linkedin text,
  is_lion boolean
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
    CASE
      WHEN p.linkedin ~* '^https?://' THEN p.linkedin
      ELSE NULL
    END AS linkedin,
    EXISTS (
      SELECT 1 FROM public.user_roles ur2
      WHERE ur2.user_id = p.id AND ur2.role = 'impact_lion'
    ) AS is_lion
  FROM public.profiles p
  WHERE EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = p.id
      AND ur.role IN ('ajbn_member','impact_lion','super_admin')
  )
  ORDER BY p.last_name ASC NULLS LAST, p.first_name ASC NULLS LAST;
END;
$$;

REVOKE ALL ON FUNCTION public.member_directory_list() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.member_directory_list() TO authenticated;

-- 3) Enforce LinkedIn URL scheme — block javascript: and other injection
UPDATE public.profiles
  SET linkedin = NULL
  WHERE linkedin IS NOT NULL AND linkedin !~* '^https?://';

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_linkedin_url_scheme;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_linkedin_url_scheme
  CHECK (linkedin IS NULL OR linkedin ~* '^https?://');
