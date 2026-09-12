ALTER TABLE public.corporate_members
ADD COLUMN owner_user_id uuid NULL REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX corporate_members_owner_user_id_unique
ON public.corporate_members(owner_user_id)
WHERE owner_user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.member_profile_detail(_member_id uuid)
RETURNS TABLE(
  id uuid,
  first_name text,
  last_name text,
  company text,
  title text,
  industry text,
  bio text,
  linkedin text,
  tags text[],
  is_lion boolean,
  is_messaging_active boolean,
  calendly_url text,
  quiet_hours_enabled boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.first_name,
    p.last_name,
    p.company,
    p.title,
    p.industry,
    p.bio,
    COALESCE(p.linkedin_url, p.linkedin) AS linkedin,
    p.tags,
    public.has_role(p.id, 'impact_lion'::public.app_role) AS is_lion,
    public.is_messaging_active(p.id) AS is_messaging_active,
    p.calendly_url,
    p.quiet_hours_enabled
  FROM public.profiles p
  WHERE p.id = _member_id
    AND public.is_approved_member(auth.uid())
    AND public.is_approved_member(p.id)
    AND NOT public.is_block_between(auth.uid(), p.id)
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.member_profile_detail(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.member_profile_detail(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.reveal_member_contact(_member_id uuid)
RETURNS TABLE(email text, phone text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.email, p.phone
  FROM public.profiles p
  WHERE p.id = _member_id
    AND public.is_approved_member(auth.uid())
    AND public.is_approved_member(p.id)
    AND NOT public.is_block_between(auth.uid(), p.id)
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.reveal_member_contact(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reveal_member_contact(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.set_corporate_member_owner(_company_id uuid, _owner_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  previous_owner uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin'::public.app_role) THEN
    RAISE EXCEPTION 'Only super admins can link company listings';
  END IF;

  IF _owner_user_id IS NOT NULL AND NOT public.is_approved_member(_owner_user_id) THEN
    RAISE EXCEPTION 'The selected owner must be an approved member';
  END IF;

  SELECT owner_user_id INTO previous_owner
  FROM public.corporate_members
  WHERE id = _company_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Company listing not found';
  END IF;

  UPDATE public.corporate_members
  SET owner_user_id = _owner_user_id,
      updated_at = now()
  WHERE id = _company_id;

  INSERT INTO public.admin_audit_log(actor_id, action, target_type, target_id, details)
  VALUES (
    auth.uid(),
    CASE WHEN _owner_user_id IS NULL THEN 'unlink_company_owner' ELSE 'link_company_owner' END,
    'corporate_member',
    _company_id,
    jsonb_build_object('previous_owner_user_id', previous_owner, 'owner_user_id', _owner_user_id)
  );
END
$$;

REVOKE ALL ON FUNCTION public.set_corporate_member_owner(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_corporate_member_owner(uuid, uuid) TO authenticated, service_role;