CREATE OR REPLACE FUNCTION public.normalize_company_name(_name text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $function$
  SELECT NULLIF(
    btrim(
      regexp_replace(
        regexp_replace(
          regexp_replace(lower(coalesce(_name, '')), '[^a-z0-9 ]', ' ', 'g'),
          '\s+', ' ', 'g'
        ),
        '( (ltd|limited|inc|llc|plc))+$', '', 'g'
      )
    ),
    ''
  );
$function$;

DROP POLICY IF EXISTS "Approved members can view corporate members" ON public.corporate_members;

CREATE POLICY "Approved members can view claimable corporate members"
ON public.corporate_members
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR (
    public.is_approved_member(auth.uid())
    AND (
      EXISTS (
        SELECT 1 FROM public.profiles op
        WHERE op.id = corporate_members.owner_user_id
          AND op.is_approved
          AND op.deleted_at IS NULL
      )
      OR NOT EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE public.normalize_company_name(p.company) IS NOT NULL
          AND public.normalize_company_name(p.company)
              = public.normalize_company_name(corporate_members.company_name)
          AND (p.is_approved IS NOT TRUE OR p.deleted_at IS NOT NULL)
      )
    )
  )
);