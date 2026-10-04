ALTER TABLE public.players ADD COLUMN IF NOT EXISTS face text NOT NULL DEFAULT 'calm';
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS shoes text NOT NULL DEFAULT 'sneakers';