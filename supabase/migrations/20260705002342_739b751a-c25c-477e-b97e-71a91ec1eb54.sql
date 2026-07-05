
ALTER TABLE public.member_intro_requests
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS outcome_notes text;
