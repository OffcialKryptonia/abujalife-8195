-- AbujaLife dual-currency economy: Nigerian Naira + US Dollar.
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS usd_cash integer NOT NULL DEFAULT 0;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS usd_bank integer NOT NULL DEFAULT 0;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'NGN' CHECK (currency IN ('NGN','USD','GAME_MONEY'));
CREATE TABLE IF NOT EXISTS public.currency_settings (
  id text PRIMARY KEY,
  ngn_per_usd integer NOT NULL DEFAULT 1500 CHECK (ngn_per_usd > 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.currency_settings (id, ngn_per_usd) VALUES ('default', 1500) ON CONFLICT (id) DO NOTHING;
ALTER TABLE public.currency_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated can read currency settings" ON public.currency_settings FOR SELECT TO authenticated USING (true);
