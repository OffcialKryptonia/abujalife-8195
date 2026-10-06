-- AbujaLife expansion: institutions, politics, elections and real-money game-currency ledger.
CREATE TABLE IF NOT EXISTS public.game_institutions (
  id text PRIMARY KEY,
  name text NOT NULL,
  short_name text NOT NULL,
  type text NOT NULL CHECK (type IN ('university','polytechnic','college','specialized')),
  ownership text NOT NULL CHECK (ownership IN ('public','private')),
  city text NOT NULL DEFAULT 'abuja',
  district text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.elections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  city text NOT NULL DEFAULT 'abuja',
  office_id text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','registration','campaign','voting','counting','completed','cancelled')),
  registration_opens_at timestamptz,
  registration_closes_at timestamptz,
  voting_opens_at timestamptz,
  voting_closes_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.election_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id uuid NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  party text NOT NULL,
  manifesto text NOT NULL DEFAULT '',
  campaign_fund bigint NOT NULL DEFAULT 0,
  votes integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'approved' CHECK (status IN ('pending','approved','withdrawn','disqualified')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (election_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.election_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id uuid NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  voter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES public.election_candidates(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (election_id, voter_id)
);

CREATE TABLE IF NOT EXISTS public.political_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  party text,
  political_reputation integer NOT NULL DEFAULT 0,
  office_id text,
  manifesto text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.game_currency_products (
  id text PRIMARY KEY,
  name text NOT NULL,
  price_ngn integer NOT NULL CHECK (price_ngn > 0),
  game_money integer NOT NULL CHECK (game_money > 0),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payment_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('korapay','pocketfi')),
  product_id text NOT NULL REFERENCES public.game_currency_products(id),
  reference text NOT NULL UNIQUE,
  amount_ngn integer NOT NULL,
  game_money integer NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','paid','failed','refunded')),
  provider_reference text,
  provider_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);

INSERT INTO public.game_currency_products (id, name, price_ngn, game_money) VALUES
('gm_1000','Starter Pack',1000,10000),
('gm_5000','Hustler Pack',5000,55000),
('gm_10000','Executive Pack',10000,120000),
('gm_25000','Tycoon Pack',25000,325000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.game_institutions (id,name,short_name,type,ownership,city,district,metadata) VALUES
('uniabuja','University of Abuja','UNIABUJA','university','public','abuja','gwarinpa','{"campus":"Large federal university campus"}'),
('abuja-metropolitan-university','Abuja Metropolitan University','AMU','university','private','abuja','guzape','{"campus":"Private urban campus"}'),
('abuja-polytechnic','Abuja Polytechnic','ABUPOLY','polytechnic','public','abuja','kubwa','{"campus":"Applied-technology campus"}'),
('fce-zuba','Federal College of Education, Zuba','FCE Zuba','college','public','abuja','karmo','{"campus":"Teacher-training campus"}'),
('capital-business-school','Capital Business School','CBS','specialized','private','abuja','wuse2','{"campus":"Professional education centre"}')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.political_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_currency_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated can read elections" ON public.elections FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated can read candidates" ON public.election_candidates FOR SELECT TO authenticated USING (true);
CREATE POLICY "users can read own political profile" ON public.political_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "authenticated can read active products" ON public.game_currency_products FOR SELECT TO authenticated USING (active = true);
CREATE POLICY "users can read own payment orders" ON public.payment_orders FOR SELECT TO authenticated USING (auth.uid() = user_id);

