
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins can read audit log" ON public.admin_audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Super admins can write audit log" ON public.admin_audit_log FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'super_admin') AND actor_id = auth.uid());
CREATE INDEX idx_audit_log_created ON public.admin_audit_log(created_at DESC);

CREATE TABLE public.lion_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  motivation TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.lion_applications TO authenticated;
GRANT ALL ON public.lion_applications TO service_role;
ALTER TABLE public.lion_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own application" ON public.lion_applications FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Users create own application" ON public.lion_applications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins update applications" ON public.lion_applications FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER lion_apps_updated BEFORE UPDATE ON public.lion_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.event_rsvps
  ADD COLUMN IF NOT EXISTS checkin_token UUID NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS checked_in_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_rsvp_checkin_token ON public.event_rsvps(checkin_token);

CREATE OR REPLACE FUNCTION public.checkin_rsvp(_token UUID)
RETURNS TABLE(rsvp_id UUID, event_title TEXT, member_name TEXT, already_checked BOOLEAN)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id UUID; v_checked TIMESTAMPTZ; v_title TEXT; v_fn TEXT; v_ln TEXT; v_already BOOLEAN;
BEGIN
  IF NOT public.has_role(auth.uid(),'super_admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
  SELECT r.id, r.checked_in_at, e.title, p.first_name, p.last_name
    INTO v_id, v_checked, v_title, v_fn, v_ln
    FROM public.event_rsvps r
    JOIN public.events e ON e.id = r.event_id
    JOIN public.profiles p ON p.id = r.user_id
    WHERE r.checkin_token = _token;
  IF v_id IS NULL THEN RAISE EXCEPTION 'Invalid check-in token'; END IF;
  v_already := v_checked IS NOT NULL;
  IF NOT v_already THEN
    UPDATE public.event_rsvps SET checked_in_at = now(), checked_in_by = auth.uid() WHERE id = v_id;
  END IF;
  RETURN QUERY SELECT v_id, v_title, coalesce(v_fn,'')||' '||coalesce(v_ln,''), v_already;
END; $$;

CREATE OR REPLACE FUNCTION public.referral_code_exists(_code TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = _code);
$$;
GRANT EXECUTE ON FUNCTION public.referral_code_exists(TEXT) TO anon, authenticated;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
