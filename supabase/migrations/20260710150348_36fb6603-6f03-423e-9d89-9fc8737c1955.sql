
-- 1. profiles: referred_by + tags
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}'::text[];

CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by);
CREATE INDEX IF NOT EXISTS idx_profiles_tags ON public.profiles USING gin(tags);

-- 2. deal_logs table
CREATE TABLE IF NOT EXISTS public.deal_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  counterparty_name text,
  deal_type text NOT NULL,
  amount_gbp numeric(14,2) NOT NULL CHECK (amount_gbp >= 0),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.deal_logs TO authenticated;
GRANT ALL ON public.deal_logs TO service_role;

ALTER TABLE public.deal_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deal_logs_owner_select" ON public.deal_logs;
CREATE POLICY "deal_logs_owner_select" ON public.deal_logs
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "deal_logs_owner_insert" ON public.deal_logs;
CREATE POLICY "deal_logs_owner_insert" ON public.deal_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.is_approved_member(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_deal_logs_user ON public.deal_logs(user_id);

-- 3. referrers_directory: safe list of approved members for sign-up dropdown
CREATE OR REPLACE FUNCTION public.referrers_directory()
RETURNS TABLE(id uuid, first_name text, last_name text, company text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT p.id, p.first_name, p.last_name, p.company
  FROM public.profiles p
  WHERE EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = p.id
      AND ur.role IN ('ajbn_member','impact_lion','super_admin')
  )
  ORDER BY p.first_name ASC NULLS LAST, p.last_name ASC NULLS LAST;
$$;

REVOKE ALL ON FUNCTION public.referrers_directory() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.referrers_directory() TO anon, authenticated;

-- 4. network_totals: aggregate deal value across the whole network
CREATE OR REPLACE FUNCTION public.network_totals()
RETURNS TABLE(total_deal_value_gbp numeric, deal_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(SUM(amount_gbp), 0)::numeric, COUNT(*)::bigint
  FROM public.deal_logs;
$$;

REVOKE ALL ON FUNCTION public.network_totals() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.network_totals() TO authenticated;

-- 5. top_network_ambassador
CREATE OR REPLACE FUNCTION public.top_network_ambassador()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT referred_by
  FROM public.profiles
  WHERE referred_by IS NOT NULL
  GROUP BY referred_by
  ORDER BY COUNT(*) DESC
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.top_network_ambassador() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.top_network_ambassador() TO authenticated;

-- 6. Extend member_directory_list with tags, enquiry_count, badge flags
DROP FUNCTION IF EXISTS public.member_directory_list();
CREATE OR REPLACE FUNCTION public.member_directory_list()
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
  enquiry_count integer,
  is_verified_connector boolean,
  is_top_ambassador boolean
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
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
    (v_top IS NOT NULL AND p.id = v_top)
  FROM public.profiles p
  WHERE EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = p.id
      AND ur.role IN ('ajbn_member','impact_lion','super_admin')
  )
  ORDER BY p.last_name ASC NULLS LAST, p.first_name ASC NULLS LAST;
END;
$$;

-- 7. handle_new_user: also store referred_by from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_code text;
  v_referred_by uuid;
BEGIN
  v_code := public.generate_referral_code(
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );

  BEGIN
    v_referred_by := NULLIF(NEW.raw_user_meta_data ->> 'referred_by', '')::uuid;
  EXCEPTION WHEN OTHERS THEN
    v_referred_by := NULL;
  END;

  -- Only accept referred_by if it resolves to an approved member
  IF v_referred_by IS NOT NULL AND NOT public.is_approved_member(v_referred_by) THEN
    v_referred_by := NULL;
  END IF;

  INSERT INTO public.profiles (id, email, first_name, last_name, company, referred_by_code, referral_code, referred_by)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'company',
    NULLIF(NEW.raw_user_meta_data ->> 'referred_by_code', ''),
    v_code,
    v_referred_by
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'prospective_member')
  ON CONFLICT (user_id, role) DO NOTHING;

  IF NEW.email_confirmed_at IS NOT NULL
     AND lower(NEW.email) IN ('russell@ajbn.co.uk', 'salil@ajbn.co.uk') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
