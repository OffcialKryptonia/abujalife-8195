CREATE TABLE public.players (
  user_id uuid PRIMARY KEY,
  name text NOT NULL,
  gender text NOT NULL DEFAULT 'male',
  skin text NOT NULL DEFAULT 'brown',
  outfit text NOT NULL DEFAULT 'agbada',
  background text NOT NULL,
  district text NOT NULL DEFAULT 'kubwa',
  cash integer NOT NULL DEFAULT 0,
  bank integer NOT NULL DEFAULT 0,
  hunger integer NOT NULL DEFAULT 80,
  energy integer NOT NULL DEFAULT 90,
  happiness integer NOT NULL DEFAULT 70,
  xp integer NOT NULL DEFAULT 0,
  reputation integer NOT NULL DEFAULT 0,
  job_id text,
  career_xp integer NOT NULL DEFAULT 0,
  shifts integer NOT NULL DEFAULT 0,
  home_id text NOT NULL DEFAULT 'kubwa_room',
  game_minutes integer NOT NULL DEFAULT 480,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.players TO authenticated;
GRANT ALL ON public.players TO service_role;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players read own" ON public.players FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  label text NOT NULL,
  kind text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX transactions_user_idx ON public.transactions(user_id, created_at DESC);
GRANT SELECT ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Transactions read own" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);