DROP TRIGGER IF EXISTS trg_protect_rsvp_checkin ON public.event_rsvps;
CREATE TRIGGER trg_protect_rsvp_checkin
BEFORE UPDATE ON public.event_rsvps
FOR EACH ROW EXECUTE FUNCTION public.protect_rsvp_checkin();

DROP TRIGGER IF EXISTS trg_protect_intro_request_admin_fields ON public.member_intro_requests;
CREATE TRIGGER trg_protect_intro_request_admin_fields
BEFORE UPDATE ON public.member_intro_requests
FOR EACH ROW EXECUTE FUNCTION public.protect_intro_request_admin_fields();