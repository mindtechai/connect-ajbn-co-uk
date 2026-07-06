CREATE TABLE public.agent_api_rate_limit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  caller_key TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT date_trunc('minute', now()),
  request_count INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (caller_key, window_start)
);

GRANT ALL ON public.agent_api_rate_limit TO service_role;

ALTER TABLE public.agent_api_rate_limit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role only" ON public.agent_api_rate_limit
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX idx_agent_api_rate_limit_window ON public.agent_api_rate_limit(window_start);