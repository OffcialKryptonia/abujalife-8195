-- AbujaLife premium Game Money wallet.
-- Game Money is deliberately separate from playable Naira cash/bank balances.
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS game_money integer NOT NULL DEFAULT 0 CHECK (game_money >= 0);

-- Currency-aware ledger: existing rows remain NGN by default.
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'NGN' CHECK (currency IN ('NGN','USD','GAME_MONEY'));

CREATE INDEX IF NOT EXISTS payment_orders_user_status_idx ON public.payment_orders(user_id, status);
CREATE INDEX IF NOT EXISTS transactions_user_created_idx ON public.transactions(user_id, created_at DESC);
