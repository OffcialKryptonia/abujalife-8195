CREATE OR REPLACE FUNCTION public.are_friends(_a uuid, _b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.friend_requests fr
    WHERE fr.status = 'accepted'
      AND ((fr.requester_id = _a AND fr.recipient_id = _b) OR (fr.requester_id = _b AND fr.recipient_id = _a))
  )
$$;
REVOKE EXECUTE ON FUNCTION public.are_friends(uuid, uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.are_friends(uuid, uuid) TO authenticated;
DROP POLICY "recipient responds to friend request" ON public.friend_requests;
CREATE POLICY "recipient responds to pending request" ON public.friend_requests FOR UPDATE TO authenticated
USING (auth.uid() = recipient_id AND status = 'pending')
WITH CHECK (auth.uid() = recipient_id AND status IN ('accepted', 'declined'));
DROP POLICY "creator adds group members" ON public.group_chat_members;
CREATE POLICY "creator adds self or existing friends" ON public.group_chat_members FOR INSERT TO authenticated
WITH CHECK (public.is_group_chat_creator(chat_id, auth.uid()) AND (user_id = auth.uid() OR public.are_friends(auth.uid(), user_id)));