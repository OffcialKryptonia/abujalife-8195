ALTER TABLE public.players ADD COLUMN IF NOT EXISTS hair text NOT NULL DEFAULT 'fade';
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS accessory text NOT NULL DEFAULT 'none';