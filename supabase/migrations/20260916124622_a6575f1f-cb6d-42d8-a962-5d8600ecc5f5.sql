ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS membership_tier text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_membership_tier_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_membership_tier_check
      CHECK (membership_tier IN ('free','corporate','fully_paid'));
  END IF;
END $$;

UPDATE public.profiles p
SET is_approved = true
WHERE is_approved = false
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = p.id
      AND ur.role IN ('ajbn_member','impact_lion','super_admin')
  );

CREATE OR REPLACE FUNCTION public.protect_profile_approved_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF public.has_role(auth.uid(), 'super_admin') OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.company IS DISTINCT FROM OLD.company THEN
    NEW.company := OLD.company;
  END IF;
  IF NEW.website IS DISTINCT FROM OLD.website THEN
    NEW.website := OLD.website;
  END IF;
  IF NEW.logo_url IS DISTINCT FROM OLD.logo_url THEN
    NEW.logo_url := OLD.logo_url;
  END IF;
  IF NEW.is_approved IS DISTINCT FROM OLD.is_approved THEN
    NEW.is_approved := OLD.is_approved;
  END IF;
  IF NEW.membership_tier IS DISTINCT FROM OLD.membership_tier THEN
    NEW.membership_tier := OLD.membership_tier;
  END IF;
  IF NEW.deleted_at IS DISTINCT FROM OLD.deleted_at THEN
    NEW.deleted_at := OLD.deleted_at;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.member_directory_list()
RETURNS TABLE(id uuid, first_name text, last_name text, company text, title text, industry text, bio text, linkedin text, tags text[], is_lion boolean, is_messaging_active boolean, enquiry_count integer, is_verified_connector boolean, is_top_ambassador boolean, calendly_url text, quiet_hours_enabled boolean)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE v_top uuid;
BEGIN
  IF NOT (
    public.has_role(auth.uid(), 'ajbn_member')
    OR public.has_role(auth.uid(), 'impact_lion')
    OR public.has_role(auth.uid(), 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Insufficient role';
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
    (v_top IS NOT NULL AND p.id = v_top),
    CASE WHEN p.calendly_url ~* '^https?://' THEN p.calendly_url ELSE NULL END,
    p.quiet_hours_enabled
  FROM public.profiles p
  WHERE p.deleted_at IS NULL
    AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = p.id
      AND ur.role IN ('ajbn_member','impact_lion','super_admin')
  )
  ORDER BY p.last_name ASC NULLS LAST, p.first_name ASC NULLS LAST;
END;
$function$;

CREATE OR REPLACE FUNCTION public.member_profile_detail(_member_id uuid)
RETURNS TABLE(id uuid, first_name text, last_name text, company text, title text, industry text, bio text, linkedin text, tags text[], is_lion boolean, is_messaging_active boolean, calendly_url text, quiet_hours_enabled boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    AND p.deleted_at IS NULL
    AND public.is_approved_member(auth.uid())
    AND public.is_approved_member(p.id)
    AND NOT public.is_block_between(auth.uid(), p.id)
  LIMIT 1
$function$;