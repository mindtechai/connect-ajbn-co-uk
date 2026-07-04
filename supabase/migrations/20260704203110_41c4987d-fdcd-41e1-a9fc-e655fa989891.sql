
CREATE OR REPLACE FUNCTION public.generate_referral_code(_first text, _last text)
RETURNS text LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  base text;
  candidate text;
  suffix text;
BEGIN
  base := upper(regexp_replace(coalesce(_first,'') || coalesce(_last,''), '[^A-Za-z0-9]', '', 'g'));
  IF length(base) < 3 THEN base := base || 'AJBN'; END IF;
  base := left(base, 8);
  LOOP
    suffix := lpad((floor(random() * 10000))::int::text, 4, '0');
    candidate := 'AJBN-' || base || suffix;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = candidate);
  END LOOP;
  RETURN candidate;
END; $$;
