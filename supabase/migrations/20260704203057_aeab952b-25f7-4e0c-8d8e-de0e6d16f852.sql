
-- Extend profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by_code text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS industry text,
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS linkedin text,
  ADD COLUMN IF NOT EXISTS avatar_url text;

-- Referral code generator
CREATE OR REPLACE FUNCTION public.generate_referral_code(_first text, _last text)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  base text;
  candidate text;
  suffix text;
BEGIN
  base := upper(regexp_replace(coalesce(_first,'') || coalesce(_last,''), '[^A-Za-z0-9]', '', 'g'));
  IF length(base) < 3 THEN base := base || 'AJBN'; END IF;
  base := left(base, 8);
  LOOP
    suffix := lpad((floor(random() * 10000))::int::text, 4, '0');
    candidate := 'AJBN-' || base || suffix;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = candidate);
  END LOOP;
  RETURN candidate;
END; $$;

-- Backfill referral codes
UPDATE public.profiles
   SET referral_code = public.generate_referral_code(first_name, last_name)
 WHERE referral_code IS NULL;

-- Updated handle_new_user with referral capture + code generation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_code text;
BEGIN
  v_code := public.generate_referral_code(
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );

  INSERT INTO public.profiles (id, email, first_name, last_name, company, referred_by_code, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'company',
    NULLIF(NEW.raw_user_meta_data ->> 'referred_by_code', ''),
    v_code
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
END; $$;

-- Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  priority text NOT NULL DEFAULT 'info' CHECK (priority IN ('info','important','urgent')),
  segments text[] NOT NULL DEFAULT ARRAY['ajbn','lions','prospective']::text[],
  pinned boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  published_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signed-in users read active announcements" ON public.announcements
  FOR SELECT TO authenticated
  USING (published_at <= now() AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Super admins manage announcements" ON public.announcements
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') AND created_by = auth.uid());
