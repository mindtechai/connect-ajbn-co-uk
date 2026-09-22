ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.corporate_members(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS profiles_company_id_idx ON public.profiles (company_id);

UPDATE public.profiles p
SET company_id = c.id
FROM public.corporate_members c
WHERE p.company_id IS NULL
  AND public.normalize_company_name(p.company) IS NOT NULL
  AND public.normalize_company_name(p.company) = public.normalize_company_name(c.company_name);

CREATE OR REPLACE FUNCTION public.enforce_company_rep_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE v_count int;
BEGIN
  IF NEW.company_id IS NULL THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.company_id IS NOT DISTINCT FROM NEW.company_id THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM public.profiles p
  WHERE p.company_id = NEW.company_id
    AND p.deleted_at IS NULL
    AND p.id <> NEW.id;

  IF v_count >= 3 THEN
    RAISE EXCEPTION 'company_rep_limit_reached';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.enforce_company_rep_limit() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS enforce_company_rep_limit_trg ON public.profiles;
CREATE TRIGGER enforce_company_rep_limit_trg
  BEFORE INSERT OR UPDATE OF company_id ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_company_rep_limit();

DROP FUNCTION IF EXISTS public.member_directory_list();

CREATE FUNCTION public.member_directory_list()
 RETURNS TABLE(id uuid, first_name text, last_name text, company text, title text, industry text, bio text, linkedin text, tags text[], is_lion boolean, is_messaging_active boolean, enquiry_count integer, is_verified_connector boolean, is_top_ambassador boolean, calendly_url text, quiet_hours_enabled boolean, primary_sector text, services_list text[], company_id uuid)
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
    p.quiet_hours_enabled,
    p.primary_sector,
    COALESCE(p.services_list, '{}'::text[]),
    p.company_id
  FROM public.profiles p
  WHERE p.deleted_at IS NULL
    AND p.is_approved
    AND EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = p.id
        AND ur.role IN ('ajbn_member','impact_lion','super_admin')
    )
  ORDER BY p.last_name ASC NULLS LAST, p.first_name ASC NULLS LAST;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.member_directory_list() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.member_directory_list() TO authenticated, service_role;