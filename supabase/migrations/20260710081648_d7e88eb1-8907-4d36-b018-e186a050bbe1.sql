
CREATE TABLE public.service_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  service_type text NOT NULL,
  message text
);

GRANT INSERT ON public.service_enquiries TO anon, authenticated;
GRANT SELECT ON public.service_enquiries TO authenticated;
GRANT ALL ON public.service_enquiries TO service_role;

ALTER TABLE public.service_enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an enquiry"
  ON public.service_enquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    user_id IS NULL OR user_id = auth.uid()
  );

CREATE POLICY "Super admins can read enquiries"
  ON public.service_enquiries
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));
