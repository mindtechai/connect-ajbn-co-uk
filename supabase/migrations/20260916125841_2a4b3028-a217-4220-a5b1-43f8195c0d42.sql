DROP POLICY IF EXISTS "Members create own deposits" ON public.reward_deposits;
REVOKE INSERT ON public.reward_deposits FROM authenticated;
GRANT ALL ON public.reward_deposits TO service_role;

CREATE OR REPLACE FUNCTION public.claim_referral_reward()
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _code text;
  _count integer := 0;
  _credit numeric := 0;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT referral_code INTO _code FROM public.profiles WHERE id = _uid;

  IF _code IS NOT NULL THEN
    SELECT count(*) INTO _count
    FROM public.profiles
    WHERE referred_by_code = _code AND id <> _uid AND deleted_at IS NULL;
    _credit := LEAST(_count * 50, 250);
  END IF;

  INSERT INTO public.reward_deposits (user_id, amount, source, notes)
  VALUES (_uid, _credit, 'lions_referral',
          'Impact Lions referral credit claim (GBP ' || _credit::text || ')');

  RETURN _credit;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_referral_reward() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_referral_reward() TO authenticated;