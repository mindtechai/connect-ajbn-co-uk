CREATE OR REPLACE FUNCTION public.is_approved_member(_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_uid,'ajbn_member')
      OR public.has_role(_uid,'impact_lion')
      OR public.has_role(_uid,'super_admin')
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = _uid AND p.is_approved AND p.deleted_at IS NULL
      );
$$;