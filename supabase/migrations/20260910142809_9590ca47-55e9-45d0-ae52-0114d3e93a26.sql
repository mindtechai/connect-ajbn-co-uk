ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS pending_logo_url text,
  ADD COLUMN IF NOT EXISTS logo_status text NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS pending_company_name text,
  ADD COLUMN IF NOT EXISTS company_name_status text NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS pending_website text,
  ADD COLUMN IF NOT EXISTS website_status text NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS other_socials text;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_logo_status_check CHECK (logo_status IN ('approved','pending')),
  ADD CONSTRAINT profiles_company_name_status_check CHECK (company_name_status IN ('approved','pending')),
  ADD CONSTRAINT profiles_website_status_check CHECK (website_status IN ('approved','pending'));

UPDATE public.profiles SET linkedin_url = linkedin WHERE linkedin_url IS NULL AND linkedin IS NOT NULL;

CREATE INDEX IF NOT EXISTS profiles_pending_review_idx
  ON public.profiles (logo_status, company_name_status, website_status);

-- Only super admins may change the live (approved) company name, website or logo.
CREATE OR REPLACE FUNCTION public.protect_profile_approved_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_approved_fields_trg ON public.profiles;
CREATE TRIGGER protect_profile_approved_fields_trg
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_approved_fields();

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));