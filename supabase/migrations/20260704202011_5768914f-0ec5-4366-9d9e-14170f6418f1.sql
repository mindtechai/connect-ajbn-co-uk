
-- Preferences
CREATE TABLE public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  email_enabled boolean NOT NULL DEFAULT true,
  inapp_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, category)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO authenticated;
GRANT ALL ON public.notification_preferences TO service_role;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own prefs" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Super admins read all prefs" ON public.notification_preferences
  FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));

-- Unsubscribe tokens (one per user, opaque)
CREATE TABLE public.unsubscribe_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.unsubscribe_tokens TO authenticated;
GRANT ALL ON public.unsubscribe_tokens TO service_role;
ALTER TABLE public.unsubscribe_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own token" ON public.unsubscribe_tokens
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Super admins read tokens" ON public.unsubscribe_tokens
  FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER trg_notif_prefs_updated
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-issue unsubscribe token on user creation
CREATE OR REPLACE FUNCTION public.ensure_unsubscribe_token()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.unsubscribe_tokens (user_id)
  VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_ensure_unsubscribe_token
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.ensure_unsubscribe_token();

-- Backfill for existing users
INSERT INTO public.unsubscribe_tokens (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
