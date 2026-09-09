CREATE TABLE public.corporate_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name text NOT NULL,
  industry text,
  city text,
  membership_tier text,
  job_title text,
  short_bio text,
  website text,
  linkedin_url text,
  logo_filename text,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.corporate_members TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.corporate_members TO authenticated;
GRANT ALL ON public.corporate_members TO service_role;

ALTER TABLE public.corporate_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved members can view corporate members"
ON public.corporate_members FOR SELECT TO authenticated
USING (public.is_approved_member(auth.uid()));

CREATE POLICY "Super admins can insert corporate members"
ON public.corporate_members FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update corporate members"
ON public.corporate_members FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete corporate members"
ON public.corporate_members FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER trg_corporate_members_updated
BEFORE UPDATE ON public.corporate_members
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_corporate_members_industry ON public.corporate_members (industry);
CREATE UNIQUE INDEX idx_corporate_members_company ON public.corporate_members (lower(company_name));