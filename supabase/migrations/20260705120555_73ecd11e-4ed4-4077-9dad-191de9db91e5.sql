CREATE TABLE public.event_interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL,
  event_title TEXT,
  interested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_id)
);

GRANT SELECT, INSERT, DELETE ON public.event_interests TO authenticated;
GRANT ALL ON public.event_interests TO service_role;

ALTER TABLE public.event_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own event interests" ON public.event_interests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own event interests" ON public.event_interests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own event interests" ON public.event_interests FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all event interests" ON public.event_interests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));