ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS quiet_hours_enabled boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.quiet_hours_member_ids()
RETURNS TABLE(user_id uuid)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT (
    public.has_role(auth.uid(), 'ajbn_member')
    OR public.has_role(auth.uid(), 'impact_lion')
    OR public.has_role(auth.uid(), 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Insufficient role';
  END IF;

  RETURN QUERY
  SELECT p.id
  FROM public.profiles p
  WHERE p.quiet_hours_enabled
    AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = p.id
      AND ur.role IN ('ajbn_member','impact_lion','super_admin')
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.quiet_hours_member_ids() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.quiet_hours_member_ids() TO authenticated, service_role;