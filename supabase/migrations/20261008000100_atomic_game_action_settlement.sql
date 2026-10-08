CREATE OR REPLACE FUNCTION public.settle_game_action(
  _user uuid,
  _expected_updated_at timestamptz,
  _delta integer,
  _reference text,
  _message text,
  _action text,
  _next jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p public.players;
  w jsonb;
BEGIN
  IF _user IS NULL OR _expected_updated_at IS NULL OR _reference IS NULL OR _next IS NULL THEN
    RAISE EXCEPTION 'invalid game action settlement';
  END IF;

  SELECT * INTO p FROM public.players WHERE user_id = _user FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'player not found'; END IF;
  IF p.updated_at IS DISTINCT FROM _expected_updated_at THEN
    RAISE EXCEPTION 'player state conflict' USING ERRCODE = '40001';
  END IF;

  w := public._apply_game_money(
    _user, _delta, 'game_action', _reference, _message,
    jsonb_build_object('action', _action)
  );

  UPDATE public.players SET
    district = COALESCE(_next->>'district', p.district),
    cash = 0, bank = 0,
    hunger = COALESCE((_next->>'hunger')::integer, p.hunger),
    energy = COALESCE((_next->>'energy')::integer, p.energy),
    happiness = COALESCE((_next->>'happiness')::integer, p.happiness),
    xp = COALESCE((_next->>'xp')::integer, p.xp),
    reputation = COALESCE((_next->>'reputation')::integer, p.reputation),
    job_id = CASE WHEN _next ? 'job_id' THEN (_next->>'job_id') ELSE p.job_id END,
    career_xp = COALESCE((_next->>'career_xp')::integer, p.career_xp),
    shifts = COALESCE((_next->>'shifts')::integer, p.shifts),
    home_id = COALESCE(_next->>'home_id', p.home_id),
    game_minutes = COALESCE((_next->>'game_minutes')::integer, p.game_minutes),
    hygiene = COALESCE((_next->>'hygiene')::integer, p.hygiene),
    social = COALESCE((_next->>'social')::integer, p.social),
    outfit = COALESCE(_next->>'outfit', p.outfit),
    furniture = COALESCE(_next->'furniture', p.furniture),
    vehicles = COALESCE(_next->'vehicles', p.vehicles),
    last_challenge_day = COALESCE((_next->>'last_challenge_day')::integer, p.last_challenge_day),
    invest_amount = COALESCE((_next->>'invest_amount')::integer, p.invest_amount),
    invest_start = COALESCE((_next->>'invest_start')::integer, p.invest_start),
    has_nin = COALESCE((_next->>'has_nin')::boolean, p.has_nin),
    updated_at = now()
  WHERE user_id = _user;

  RETURN jsonb_build_object('ok', true, 'balance', (w->>'balance')::integer, 'reference', _reference);
END;
$$;

REVOKE ALL ON FUNCTION public.settle_game_action(uuid,timestamptz,integer,text,text,text,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.settle_game_action(uuid,timestamptz,integer,text,text,text,jsonb) TO service_role;
