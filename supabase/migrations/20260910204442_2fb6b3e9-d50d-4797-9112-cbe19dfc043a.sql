ALTER TABLE public.lion_applications
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS referral_experience text,
  ADD COLUMN IF NOT EXISTS payment_ack boolean NOT NULL DEFAULT false;