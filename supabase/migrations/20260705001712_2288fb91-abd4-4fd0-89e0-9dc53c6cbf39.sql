
CREATE TABLE public.member_intro_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL DEFAULT auth.uid(),
  target_name text NOT NULL,
  target_company text,
  target_email text,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_review','accepted','declined','completed','cancelled')),
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.member_intro_requests TO authenticated;
GRANT ALL ON public.member_intro_requests TO service_role;

ALTER TABLE public.member_intro_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Requesters can view their own intro requests"
  ON public.member_intro_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = requester_id);

CREATE POLICY "Requesters can create their own intro requests"
  ON public.member_intro_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Requesters can cancel/update their own intro requests"
  ON public.member_intro_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = requester_id)
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Super admins can view all intro requests"
  ON public.member_intro_requests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update any intro request"
  ON public.member_intro_requests FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER update_member_intro_requests_updated_at
  BEFORE UPDATE ON public.member_intro_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_member_intro_requests_requester ON public.member_intro_requests(requester_id, created_at DESC);
