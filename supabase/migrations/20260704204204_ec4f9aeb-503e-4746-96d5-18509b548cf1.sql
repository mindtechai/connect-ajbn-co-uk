
-- Profiles: expand read/update for admins & member directory
CREATE POLICY "Super admins read all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Members read member directory" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    (public.has_role(auth.uid(), 'ajbn_member') OR public.has_role(auth.uid(), 'impact_lion'))
    AND EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = public.profiles.id
        AND ur.role IN ('ajbn_member','impact_lion','super_admin')
    )
  );

CREATE POLICY "Super admins update profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- User roles: super admins can manage
CREATE POLICY "Super admins read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins insert roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins delete roles" ON public.user_roles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Events
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  location text,
  kind text NOT NULL DEFAULT 'networking' CHECK (kind IN ('networking','fundraising','flagship','roundtable','other')),
  segments text[] NOT NULL DEFAULT ARRAY['ajbn','lions']::text[],
  capacity integer,
  fundraising_target numeric,
  fundraising_raised numeric NOT NULL DEFAULT 0,
  cover_image_url text,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in members read events" ON public.events
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admins manage events" ON public.events
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') AND created_by = auth.uid());
CREATE TRIGGER trg_events_updated
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Event RSVPs
CREATE TABLE public.event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'going' CHECK (status IN ('going','waitlist','declined')),
  guests int NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_rsvps TO authenticated;
GRANT ALL ON public.event_rsvps TO service_role;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own rsvps" ON public.event_rsvps
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Super admins read all rsvps" ON public.event_rsvps
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE TRIGGER trg_rsvps_updated
  BEFORE UPDATE ON public.event_rsvps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ESG contributions
CREATE TABLE public.esg_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  kind text NOT NULL CHECK (kind IN ('donation','sponsorship','volunteer_hours','event_attendance','other')),
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'GBP',
  hours numeric,
  notes text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  recorded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.esg_contributions TO authenticated;
GRANT ALL ON public.esg_contributions TO service_role;
ALTER TABLE public.esg_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own esg" ON public.esg_contributions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Super admins manage esg" ON public.esg_contributions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Referral leaderboard RPC (SECURITY DEFINER — read-only aggregate)
CREATE OR REPLACE FUNCTION public.referral_leaderboard(_limit int DEFAULT 20)
RETURNS TABLE(user_id uuid, first_name text, last_name text, company text, referral_count bigint, is_lion boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    p.id,
    p.first_name,
    p.last_name,
    p.company,
    count(r.id)::bigint AS referral_count,
    EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'impact_lion') AS is_lion
  FROM public.profiles p
  JOIN public.profiles r ON r.referred_by_code = p.referral_code
  GROUP BY p.id, p.first_name, p.last_name, p.company
  ORDER BY referral_count DESC, p.first_name ASC
  LIMIT _limit;
$$;
REVOKE ALL ON FUNCTION public.referral_leaderboard(int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.referral_leaderboard(int) TO authenticated;
