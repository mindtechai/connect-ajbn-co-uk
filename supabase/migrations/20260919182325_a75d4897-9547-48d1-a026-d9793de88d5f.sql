CREATE OR REPLACE FUNCTION public.grant_super_admin_on_verify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL
     AND lower(NEW.email) IN (
       'russell@ajbn.co.uk',
       'salil@ajbn.co.uk',
       'salil@proactiveconsultancy.co.uk',
       'russell@springadconsultancy.co.uk'
     ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_code text;
  v_referred_by uuid;
BEGIN
  v_code := public.generate_referral_code(
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );

  BEGIN
    v_referred_by := NULLIF(NEW.raw_user_meta_data ->> 'referred_by', '')::uuid;
  EXCEPTION WHEN OTHERS THEN
    v_referred_by := NULL;
  END;

  IF v_referred_by IS NOT NULL AND NOT public.is_approved_member(v_referred_by) THEN
    v_referred_by := NULL;
  END IF;

  INSERT INTO public.profiles (id, email, first_name, last_name, company, referred_by_code, referral_code, referred_by)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'company',
    NULLIF(NEW.raw_user_meta_data ->> 'referred_by_code', ''),
    v_code,
    v_referred_by
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'prospective_member')
  ON CONFLICT (user_id, role) DO NOTHING;

  IF NEW.email_confirmed_at IS NOT NULL
     AND lower(NEW.email) IN (
       'russell@ajbn.co.uk',
       'salil@ajbn.co.uk',
       'salil@proactiveconsultancy.co.uk',
       'russell@springadconsultancy.co.uk'
     ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;