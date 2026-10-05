CREATE TABLE public.friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT friend_requests_not_self CHECK (requester_id <> recipient_id),
  CONSTRAINT friend_requests_pair_unique UNIQUE (requester_id, recipient_id)
);
GRANT SELECT, INSERT, UPDATE ON public.friend_requests TO authenticated;
GRANT ALL ON public.friend_requests TO service_role;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "friend requests visible to participants" ON public.friend_requests FOR SELECT TO authenticated USING (auth.uid() = requester_id OR auth.uid() = recipient_id);
CREATE POLICY "send own friend request" ON public.friend_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id AND status = 'pending');
CREATE POLICY "recipient responds to friend request" ON public.friend_requests FOR UPDATE TO authenticated USING (auth.uid() = recipient_id) WITH CHECK (auth.uid() = recipient_id);
REVOKE UPDATE ON public.friend_requests FROM authenticated;
GRANT UPDATE (status, updated_at) ON public.friend_requests TO authenticated;

CREATE TABLE public.group_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 60),
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.group_chats TO authenticated;
GRANT ALL ON public.group_chats TO service_role;
ALTER TABLE public.group_chats ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.group_chat_members (
  chat_id uuid NOT NULL REFERENCES public.group_chats(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (chat_id, user_id)
);
GRANT SELECT, INSERT ON public.group_chat_members TO authenticated;
GRANT ALL ON public.group_chat_members TO service_role;
ALTER TABLE public.group_chat_members ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.group_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES public.group_chats(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.group_chat_messages TO authenticated;
GRANT ALL ON public.group_chat_messages TO service_role;
ALTER TABLE public.group_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_group_chat_member(_chat_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.group_chat_members WHERE chat_id = _chat_id AND user_id = _user_id)
$$;
CREATE OR REPLACE FUNCTION public.is_group_chat_creator(_chat_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.group_chats WHERE id = _chat_id AND created_by = _user_id)
$$;
REVOKE EXECUTE ON FUNCTION public.is_group_chat_member(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_group_chat_creator(uuid, uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_group_chat_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_chat_creator(uuid, uuid) TO authenticated;
CREATE POLICY "group chats visible to members" ON public.group_chats FOR SELECT TO authenticated USING (public.is_group_chat_member(id, auth.uid()));
CREATE POLICY "create own group chat" ON public.group_chats FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "group members visible to members" ON public.group_chat_members FOR SELECT TO authenticated USING (public.is_group_chat_member(chat_id, auth.uid()));
CREATE POLICY "creator adds group members" ON public.group_chat_members FOR INSERT TO authenticated WITH CHECK (public.is_group_chat_creator(chat_id, auth.uid()));
CREATE POLICY "group messages visible to members" ON public.group_chat_messages FOR SELECT TO authenticated USING (public.is_group_chat_member(chat_id, auth.uid()));
CREATE POLICY "members send group messages as self" ON public.group_chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id AND public.is_group_chat_member(chat_id, auth.uid()));