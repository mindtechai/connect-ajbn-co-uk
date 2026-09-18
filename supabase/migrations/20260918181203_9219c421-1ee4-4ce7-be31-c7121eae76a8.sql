CREATE TABLE public.ai_matcher_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_need text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ai_matcher_requests_user_time_idx ON public.ai_matcher_requests (user_id, created_at DESC);
GRANT SELECT ON public.ai_matcher_requests TO authenticated;
GRANT ALL ON public.ai_matcher_requests TO service_role;
ALTER TABLE public.ai_matcher_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read own matcher requests" ON public.ai_matcher_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read all matcher requests" ON public.ai_matcher_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE public.ai_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_need text,
  suggestion jsonb NOT NULL DEFAULT '{}'::jsonb,
  details text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.ai_reports TO authenticated;
GRANT ALL ON public.ai_reports TO service_role;
ALTER TABLE public.ai_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members create own AI reports" ON public.ai_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Members read own AI reports" ON public.ai_reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id);
CREATE POLICY "Admins read AI reports" ON public.ai_reports FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins update AI reports" ON public.ai_reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));