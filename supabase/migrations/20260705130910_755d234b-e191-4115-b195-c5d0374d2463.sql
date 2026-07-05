
-- 1. leaderboard_pii_bypass: require member/lion/admin
CREATE OR REPLACE FUNCTION public.referral_leaderboard(_limit integer DEFAULT 20)
 RETURNS TABLE(user_id uuid, first_name text, last_name text, company text, referral_count bigint, is_lion boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT (public.has_role(auth.uid(),'ajbn_member')
       OR public.has_role(auth.uid(),'impact_lion')
       OR public.has_role(auth.uid(),'super_admin')) THEN
    RAISE EXCEPTION 'Insufficient role';
  END IF;
  RETURN QUERY
  SELECT p.id, p.first_name, p.last_name, p.company,
    count(r.id)::bigint AS referral_count,
    EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'impact_lion') AS is_lion
  FROM public.profiles p
  JOIN public.profiles r ON r.referred_by_code = p.referral_code
  GROUP BY p.id, p.first_name, p.last_name, p.company
  ORDER BY referral_count DESC, p.first_name ASC
  LIMIT _limit;
END;
$function$;

-- 2. events_announcements_segments: enforce segments in RLS
DROP POLICY IF EXISTS "Signed-in members read events" ON public.events;
CREATE POLICY "Members read events by segment"
  ON public.events FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'super_admin')
    OR (public.has_role(auth.uid(),'ajbn_member') AND 'ajbn' = ANY(segments))
    OR (public.has_role(auth.uid(),'impact_lion') AND 'lions' = ANY(segments))
    OR (public.has_role(auth.uid(),'prospective_member') AND 'prospective' = ANY(segments))
  );

DROP POLICY IF EXISTS "Signed-in users read active announcements" ON public.announcements;
CREATE POLICY "Members read announcements by segment"
  ON public.announcements FOR SELECT TO authenticated
  USING (
    (published_at <= now()) AND ((expires_at IS NULL) OR (expires_at > now()))
    AND (
      public.has_role(auth.uid(),'super_admin')
      OR (public.has_role(auth.uid(),'ajbn_member') AND 'ajbn' = ANY(segments))
      OR (public.has_role(auth.uid(),'impact_lion') AND 'lions' = ANY(segments))
      OR (public.has_role(auth.uid(),'prospective_member') AND 'prospective' = ANY(segments))
    )
  );

-- 3. intro_request_admin_fields: trigger protects admin-only columns
CREATE OR REPLACE FUNCTION public.protect_intro_request_admin_fields()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'super_admin') THEN
    NEW.status := OLD.status;
    NEW.admin_notes := OLD.admin_notes;
    NEW.outcome_notes := OLD.outcome_notes;
    NEW.completed_at := OLD.completed_at;
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_protect_intro_admin_fields ON public.member_intro_requests;
CREATE TRIGGER trg_protect_intro_admin_fields
  BEFORE UPDATE ON public.member_intro_requests
  FOR EACH ROW EXECUTE FUNCTION public.protect_intro_request_admin_fields();

-- 4. rsvp_self_checkin: trigger protects check-in columns
CREATE OR REPLACE FUNCTION public.protect_rsvp_checkin()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'super_admin') THEN
    NEW.checked_in_at := OLD.checked_in_at;
    NEW.checked_in_by := OLD.checked_in_by;
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_protect_rsvp_checkin ON public.event_rsvps;
CREATE TRIGGER trg_protect_rsvp_checkin
  BEFORE UPDATE ON public.event_rsvps
  FOR EACH ROW EXECUTE FUNCTION public.protect_rsvp_checkin();
