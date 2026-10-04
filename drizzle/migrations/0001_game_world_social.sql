ALTER TABLE public.players
  ADD COLUMN hygiene integer NOT NULL DEFAULT 80,
  ADD COLUMN social integer NOT NULL DEFAULT 60,
  ADD COLUMN furniture jsonb NOT NULL DEFAULT '[{"u":"s1","i":"mat_bed","x":0,"y":0,"r":0,"p":true},{"u":"s2","i":"plastic_chair","x":3,"y":2,"r":0,"p":true},{"u":"s3","i":"bucket_bath","x":4,"y":0,"r":0,"p":true},{"u":"s4","i":"stove_kerosene","x":0,"y":4,"r":0,"p":true}]'::jsonb,
  ADD COLUMN vehicles jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN visits integer NOT NULL DEFAULT 0,
  ADD COLUMN last_challenge_day integer NOT NULL DEFAULT 0,
  ADD COLUMN invest_amount integer NOT NULL DEFAULT 0,
  ADD COLUMN invest_start integer NOT NULL DEFAULT 0,
  ADD COLUMN has_nin boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.get_public_profiles()
RETURNS TABLE(user_id uuid, name text, skin text, outfit text, gender text, district text, xp integer, reputation integer, home_id text, visits integer, updated_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT user_id, name, skin, outfit, gender, district, xp, reputation, home_id, visits, updated_at FROM public.players ORDER BY updated_at DESC LIMIT 500
$$;
REVOKE EXECUTE ON FUNCTION public.get_public_profiles() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_public_profiles() TO authenticated;

CREATE OR REPLACE FUNCTION public.visit_home(_target uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;
  IF _target <> auth.uid() THEN UPDATE public.players SET visits = visits + 1 WHERE user_id = _target; END IF;
  SELECT jsonb_build_object('name', name, 'skin', skin, 'outfit', outfit, 'gender', gender, 'home_id', home_id, 'furniture', furniture, 'visits', visits)
    INTO r FROM public.players WHERE user_id = _target;
  RETURN r;
END $$;
REVOKE EXECUTE ON FUNCTION public.visit_home(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.visit_home(uuid) TO authenticated;

CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 280),
  shared_post_id uuid REFERENCES public.posts(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts read" ON public.posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "posts insert own" ON public.posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts delete own" ON public.posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.post_likes (
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.post_likes TO authenticated;
GRANT ALL ON public.post_likes TO service_role;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "likes read" ON public.post_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "likes insert own" ON public.post_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes delete own" ON public.post_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 200),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.post_comments TO authenticated;
GRANT ALL ON public.post_comments TO service_role;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments read" ON public.post_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "comments insert own" ON public.post_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments delete own" ON public.post_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.follows (
  follower_id uuid NOT NULL,
  followee_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, followee_id),
  CHECK (follower_id <> followee_id)
);
GRANT SELECT, INSERT, DELETE ON public.follows TO authenticated;
GRANT ALL ON public.follows TO service_role;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "follows read" ON public.follows FOR SELECT TO authenticated USING (true);
CREATE POLICY "follows insert own" ON public.follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows delete own" ON public.follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

CREATE TABLE public.blocks (
  blocker_id uuid NOT NULL,
  blocked_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id)
);
GRANT SELECT, INSERT, DELETE ON public.blocks TO authenticated;
GRANT ALL ON public.blocks TO service_role;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blocks read own" ON public.blocks FOR SELECT TO authenticated USING (auth.uid() = blocker_id);
CREATE POLICY "blocks insert own" ON public.blocks FOR INSERT TO authenticated WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "blocks delete own" ON public.blocks FOR DELETE TO authenticated USING (auth.uid() = blocker_id);

CREATE OR REPLACE FUNCTION public.is_blocked(_blocker uuid, _blocked uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.blocks WHERE blocker_id = _blocker AND blocked_id = _blocked)
$$;
REVOKE EXECUTE ON FUNCTION public.is_blocked(uuid, uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_blocked(uuid, uuid) TO authenticated;

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages read own" ON public.messages FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "messages send" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id AND sender_id <> recipient_id AND NOT public.is_blocked(recipient_id, sender_id));
CREATE INDEX messages_pair_idx ON public.messages (sender_id, recipient_id, created_at DESC);

CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  target_user uuid,
  post_id uuid,
  reason text NOT NULL CHECK (char_length(reason) BETWEEN 1 AND 200),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports insert own" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);