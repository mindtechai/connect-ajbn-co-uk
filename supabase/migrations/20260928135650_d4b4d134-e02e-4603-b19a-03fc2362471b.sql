CREATE TABLE public.flagship_exhibitors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.corporate_members(id) ON DELETE CASCADE UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT ON public.flagship_exhibitors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flagship_exhibitors TO authenticated;
GRANT ALL ON public.flagship_exhibitors TO service_role;
ALTER TABLE public.flagship_exhibitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view flagship exhibitors" ON public.flagship_exhibitors FOR SELECT USING (true);
CREATE POLICY "Super admins manage flagship exhibitors" ON public.flagship_exhibitors FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE TRIGGER update_flagship_exhibitors_updated_at BEFORE UPDATE ON public.flagship_exhibitors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();