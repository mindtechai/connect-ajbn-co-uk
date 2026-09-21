CREATE TABLE public.service_taxonomy (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 100,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.service_taxonomy TO authenticated;
GRANT SELECT ON public.service_taxonomy TO anon;
GRANT ALL ON public.service_taxonomy TO service_role;

ALTER TABLE public.service_taxonomy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active services"
ON public.service_taxonomy FOR SELECT
USING (is_active OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins manage services"
ON public.service_taxonomy FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER update_service_taxonomy_updated_at
BEFORE UPDATE ON public.service_taxonomy
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.corporate_members
  ADD COLUMN IF NOT EXISTS primary_sector text,
  ADD COLUMN IF NOT EXISTS services_list text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS primary_sector text,
  ADD COLUMN IF NOT EXISTS services_list text[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS corporate_members_services_list_idx ON public.corporate_members USING gin (services_list);
CREATE INDEX IF NOT EXISTS profiles_services_list_idx ON public.profiles USING gin (services_list);