CREATE TABLE IF NOT EXISTS public.reward_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'lions_referral',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.reward_deposits TO authenticated;
GRANT ALL ON public.reward_deposits TO service_role;

ALTER TABLE public.reward_deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view own deposits"
  ON public.reward_deposits FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Members create own deposits"
  ON public.reward_deposits FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_reward_deposits_updated_at
  BEFORE UPDATE ON public.reward_deposits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS reward_deposits_user_id_idx ON public.reward_deposits(user_id);