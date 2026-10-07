-- Game Money is the single canonical in-game currency. players.cash/bank/usd_* are TRANSITIONAL legacy fields.
CREATE TABLE IF NOT EXISTS public.game_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance numeric(30,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.game_money_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(30,2) NOT NULL CHECK (amount <> 0),
  balance_before numeric(30,2) NOT NULL,
  balance_after numeric(30,2) NOT NULL CHECK (balance_after >= 0),
  type text NOT NULL,
  reference text,
  description text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (balance_after = balance_before + amount)
);
CREATE UNIQUE INDEX IF NOT EXISTS game_money_ledger_user_ref_uq ON public.game_money_ledger(user_id, reference) WHERE reference IS NOT NULL;
CREATE INDEX IF NOT EXISTS game_money_ledger_user_created_idx ON public.game_money_ledger(user_id, created_at DESC);
CREATE TABLE IF NOT EXISTS public.game_money_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id),
  recipient_id uuid NOT NULL REFERENCES auth.users(id),
  amount numeric(30,2) NOT NULL CHECK (amount > 0),
  reference text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('completed','failed','reversed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (sender_id <> recipient_id)
);
CREATE INDEX IF NOT EXISTS game_money_transfers_sender_idx ON public.game_money_transfers(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS game_money_transfers_recipient_idx ON public.game_money_transfers(recipient_id, created_at DESC);

GRANT SELECT ON public.game_wallets, public.game_money_ledger, public.game_money_transfers TO authenticated;
GRANT ALL ON public.game_wallets, public.game_money_ledger, public.game_money_transfers TO service_role;
ALTER TABLE public.game_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_money_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_money_transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wallet read own" ON public.game_wallets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "ledger read own" ON public.game_money_ledger FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "transfers read participant" ON public.game_money_transfers FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Internal helper: locks wallet row and applies a signed amount with idempotent reference.
CREATE OR REPLACE FUNCTION public._apply_game_money(_user uuid, _amount numeric, _type text, _reference text, _description text, _metadata jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE w public.game_wallets; e public.game_money_ledger;
BEGIN
  IF _amount IS NULL OR _amount = 0 THEN RAISE EXCEPTION 'amount must be non-zero'; END IF;
  IF _type IS NULL OR length(_type) = 0 THEN RAISE EXCEPTION 'type required'; END IF;
  INSERT INTO public.game_wallets(user_id) VALUES (_user) ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO w FROM public.game_wallets WHERE user_id = _user FOR UPDATE;
  IF _reference IS NOT NULL THEN
    SELECT * INTO e FROM public.game_money_ledger WHERE user_id = _user AND reference = _reference;
    IF FOUND THEN RETURN jsonb_build_object('ok', true, 'duplicate', true, 'balance', w.balance, 'ledger_id', e.id); END IF;
  END IF;
  IF w.balance + _amount < 0 THEN RAISE EXCEPTION 'insufficient game money' USING ERRCODE = 'P0001'; END IF;
  INSERT INTO public.game_money_ledger(user_id, amount, balance_before, balance_after, type, reference, description, metadata)
    VALUES (_user, _amount, w.balance, w.balance + _amount, _type, _reference, _description, COALESCE(_metadata, '{}'::jsonb)) RETURNING * INTO e;
  UPDATE public.game_wallets SET balance = e.balance_after, updated_at = now() WHERE id = w.id;
  RETURN jsonb_build_object('ok', true, 'duplicate', false, 'balance', e.balance_after, 'ledger_id', e.id);
END $$;

CREATE OR REPLACE FUNCTION public.get_or_create_game_wallet(_user uuid DEFAULT NULL)
RETURNS public.game_wallets LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE u uuid := COALESCE(_user, auth.uid()); w public.game_wallets;
BEGIN
  IF u IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;
  IF auth.role() IS DISTINCT FROM 'service_role' AND u IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'not allowed'; END IF;
  INSERT INTO public.game_wallets(user_id) VALUES (u) ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO w FROM public.game_wallets WHERE user_id = u;
  RETURN w;
END $$;

CREATE OR REPLACE FUNCTION public.credit_game_money(_user uuid, _amount numeric, _type text, _reference text DEFAULT NULL, _description text DEFAULT NULL, _metadata jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _amount IS NULL OR _amount <= 0 THEN RAISE EXCEPTION 'credit amount must be positive'; END IF;
  RETURN public._apply_game_money(_user, _amount, _type, _reference, _description, _metadata);
END $$;

CREATE OR REPLACE FUNCTION public.debit_game_money(_user uuid, _amount numeric, _type text, _reference text DEFAULT NULL, _description text DEFAULT NULL, _metadata jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _amount IS NULL OR _amount <= 0 THEN RAISE EXCEPTION 'debit amount must be positive'; END IF;
  RETURN public._apply_game_money(_user, -_amount, _type, _reference, _description, _metadata);
END $$;

-- Player-to-player transfer: Game Money only. Sender is always the caller (or explicit when service_role).
CREATE OR REPLACE FUNCTION public.transfer_game_money(_recipient uuid, _amount numeric, _reference text DEFAULT NULL, _sender uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s uuid; ref text := COALESCE(_reference, gen_random_uuid()::text); t public.game_money_transfers; r jsonb;
BEGIN
  IF auth.role() = 'service_role' THEN s := _sender; ELSE s := auth.uid(); IF _sender IS NOT NULL AND _sender <> s THEN RAISE EXCEPTION 'not allowed'; END IF; END IF;
  IF s IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;
  IF _recipient IS NULL OR _recipient = s THEN RAISE EXCEPTION 'invalid recipient'; END IF;
  IF _amount IS NULL OR _amount <= 0 THEN RAISE EXCEPTION 'amount must be positive'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.players WHERE user_id = _recipient) THEN RAISE EXCEPTION 'recipient not found'; END IF;
  SELECT * INTO t FROM public.game_money_transfers WHERE reference = ref;
  IF FOUND THEN
    IF t.sender_id <> s THEN RAISE EXCEPTION 'reference already used'; END IF;
    RETURN jsonb_build_object('ok', true, 'duplicate', true, 'transfer_id', t.id);
  END IF;
  -- lock both wallets in a stable order to avoid deadlocks
  INSERT INTO public.game_wallets(user_id) VALUES (s), (_recipient) ON CONFLICT (user_id) DO NOTHING;
  PERFORM 1 FROM public.game_wallets WHERE user_id IN (s, _recipient) ORDER BY user_id FOR UPDATE;
  r := public._apply_game_money(s, -_amount, 'transfer_out', 'transfer:' || ref, 'Transfer sent', jsonb_build_object('recipient_id', _recipient));
  PERFORM public._apply_game_money(_recipient, _amount, 'transfer_in', 'transfer:' || ref, 'Transfer received', jsonb_build_object('sender_id', s));
  INSERT INTO public.game_money_transfers(sender_id, recipient_id, amount, reference) VALUES (s, _recipient, _amount, ref) RETURNING * INTO t;
  RETURN jsonb_build_object('ok', true, 'duplicate', false, 'transfer_id', t.id, 'balance', r->'balance');
END $$;

REVOKE ALL ON FUNCTION public._apply_game_money(uuid, numeric, text, text, text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.credit_game_money(uuid, numeric, text, text, text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.debit_game_money(uuid, numeric, text, text, text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_or_create_game_wallet(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.transfer_game_money(uuid, numeric, text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public._apply_game_money(uuid, numeric, text, text, text, jsonb), public.credit_game_money(uuid, numeric, text, text, text, jsonb), public.debit_game_money(uuid, numeric, text, text, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_or_create_game_wallet(uuid), public.transfer_game_money(uuid, numeric, text, uuid) TO authenticated, service_role;

-- Backfill: one zero-balance wallet per existing player; legacy balances untouched.
INSERT INTO public.game_wallets(user_id) SELECT p.user_id FROM public.players p JOIN auth.users u ON u.id = p.user_id ON CONFLICT (user_id) DO NOTHING;

COMMENT ON TABLE public.game_wallets IS 'Canonical Game Money balance. Mutate only via credit/debit/transfer RPCs.';
COMMENT ON COLUMN public.players.cash IS 'TRANSITIONAL legacy balance; Game Money (game_wallets) is canonical.';
COMMENT ON COLUMN public.players.bank IS 'TRANSITIONAL legacy balance; Game Money (game_wallets) is canonical.';