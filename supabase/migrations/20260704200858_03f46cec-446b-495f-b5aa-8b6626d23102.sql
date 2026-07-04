
CREATE TYPE public.delivery_channel AS ENUM ('email', 'in_app');
CREATE TYPE public.delivery_status AS ENUM ('queued', 'sent', 'failed', 'skipped');

-- bulk_messages
CREATE TABLE public.bulk_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  segments TEXT[] NOT NULL DEFAULT '{}',
  channels TEXT[] NOT NULL DEFAULT '{}',
  recipient_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.bulk_messages TO authenticated;
GRANT ALL ON public.bulk_messages TO service_role;
ALTER TABLE public.bulk_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins read bulk messages" ON public.bulk_messages
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins insert bulk messages" ON public.bulk_messages
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'super_admin') AND created_by = auth.uid());

-- notifications (in-app)
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bulk_message_id UUID REFERENCES public.bulk_messages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Super admins read all notifications" ON public.notifications
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

CREATE INDEX idx_notifications_user ON public.notifications(user_id, created_at DESC);

-- message_deliveries (per-recipient tracking)
CREATE TABLE public.message_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bulk_message_id UUID NOT NULL REFERENCES public.bulk_messages(id) ON DELETE CASCADE,
  recipient_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  channel delivery_channel NOT NULL,
  status delivery_status NOT NULL DEFAULT 'queued',
  error TEXT,
  provider_id TEXT,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.message_deliveries TO authenticated;
GRANT ALL ON public.message_deliveries TO service_role;
ALTER TABLE public.message_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins read deliveries" ON public.message_deliveries
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Users read own deliveries" ON public.message_deliveries
  FOR SELECT TO authenticated USING (auth.uid() = recipient_user_id);

CREATE INDEX idx_deliveries_message ON public.message_deliveries(bulk_message_id);
