CREATE OR REPLACE FUNCTION public.company_has_unapproved_member(_company_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE public.normalize_company_name(p.company) IS NOT NULL
      AND public.normalize_company_name(p.company) = public.normalize_company_name(_company_name)
      AND (p.is_approved IS NOT TRUE OR p.deleted_at IS NOT NULL)
  )
$$;

REVOKE ALL ON FUNCTION public.company_has_unapproved_member(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.company_has_unapproved_member(text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.company_owner_is_approved(_owner uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = _owner AND p.is_approved AND p.deleted_at IS NULL
  )
$$;

REVOKE ALL ON FUNCTION public.company_owner_is_approved(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.company_owner_is_approved(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "Approved members can view claimable corporate members" ON public.corporate_members;

CREATE POLICY "Approved members can view claimable corporate members"
ON public.corporate_members
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin')
  OR (
    public.is_approved_member(auth.uid())
    AND (
      public.company_owner_is_approved(corporate_members.owner_user_id)
      OR NOT public.company_has_unapproved_member(corporate_members.company_name)
    )
  )
);