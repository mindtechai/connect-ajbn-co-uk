CREATE OR REPLACE FUNCTION public.profile_privileged_fields_unchanged(
  _id uuid,
  _is_approved boolean,
  _membership_tier text,
  _deleted_at timestamptz
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = _id
      AND p.is_approved IS NOT DISTINCT FROM _is_approved
      AND p.membership_tier IS NOT DISTINCT FROM _membership_tier
      AND p.deleted_at IS NOT DISTINCT FROM _deleted_at
  );
$$;

REVOKE ALL ON FUNCTION public.profile_privileged_fields_unchanged(uuid, boolean, text, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.profile_privileged_fields_unchanged(uuid, boolean, text, timestamptz) TO authenticated, service_role;

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;

CREATE POLICY "Users update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND (
    public.has_role(auth.uid(), 'super_admin')
    OR public.profile_privileged_fields_unchanged(id, is_approved, membership_tier, deleted_at)
  )
);