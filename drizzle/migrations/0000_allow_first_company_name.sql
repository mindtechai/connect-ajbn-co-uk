CREATE OR REPLACE FUNCTION public.protect_profile_approved_fields()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF public.has_role(auth.uid(), 'super_admin') OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  -- Members may set their business name the first time (when it is empty); later changes need approval.
  IF NEW.company IS DISTINCT FROM OLD.company AND COALESCE(btrim(OLD.company), '') <> '' THEN
    NEW.company := OLD.company;
  END IF;
  IF NEW.website IS DISTINCT FROM OLD.website THEN NEW.website := OLD.website; END IF;
  IF NEW.logo_url IS DISTINCT FROM OLD.logo_url THEN NEW.logo_url := OLD.logo_url; END IF;
  IF NEW.is_approved IS DISTINCT FROM OLD.is_approved THEN NEW.is_approved := OLD.is_approved; END IF;
  IF NEW.membership_tier IS DISTINCT FROM OLD.membership_tier THEN NEW.membership_tier := OLD.membership_tier; END IF;
  IF NEW.deleted_at IS DISTINCT FROM OLD.deleted_at THEN NEW.deleted_at := OLD.deleted_at; END IF;
  IF NEW.referral_code IS DISTINCT FROM OLD.referral_code THEN NEW.referral_code := OLD.referral_code; END IF;
  IF NEW.referred_by_code IS DISTINCT FROM OLD.referred_by_code THEN NEW.referred_by_code := OLD.referred_by_code; END IF;
  IF NEW.referred_by IS DISTINCT FROM OLD.referred_by THEN NEW.referred_by := OLD.referred_by; END IF;
  RETURN NEW;
END;
$function$;