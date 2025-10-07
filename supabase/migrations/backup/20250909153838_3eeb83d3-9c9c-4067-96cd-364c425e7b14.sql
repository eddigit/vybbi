-- Fix function to resolve column ambiguity
CREATE OR REPLACE FUNCTION public.get_conversations_with_peers()
RETURNS TABLE (
  conversation_id uuid,
  conversation_type conversation_type,
  conversation_title text,
  last_message_at timestamp with time zone,
  reply_received boolean,
  peer_user_id uuid,
  peer_display_name text,
  peer_avatar_url text,
  peer_profile_type profile_type,
  last_message_content text,
  last_message_created_at timestamp with time zone,
  is_blocked boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as conversation_id,
    c.type as conversation_type,
    c.title as conversation_title,
    c.last_message_at,
    c.reply_received,
    peer_p.user_id as peer_user_id,
    peer_p.display_name as peer_display_name,
    peer_p.avatar_url as peer_avatar_url,
    peer_p.profile_type as peer_profile_type,
    last_msg.content as last_message_content,
    last_msg.created_at as last_message_created_at,
    CASE WHEN bu.id IS NOT NULL THEN true ELSE false END as is_blocked
  FROM conversations c
  JOIN conversation_participants cp_current ON cp_current.conversation_id = c.id AND cp_current.user_id = auth.uid()
  LEFT JOIN conversation_participants cp_peer ON cp_peer.conversation_id = c.id AND cp_peer.user_id != auth.uid()
  LEFT JOIN profiles peer_p ON peer_p.user_id = cp_peer.user_id
  LEFT JOIN LATERAL (
    SELECT m.content, m.created_at
    FROM messages m 
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) last_msg ON true
  LEFT JOIN blocked_users bu ON (
    (bu.blocker_user_id = auth.uid() AND bu.blocked_user_id = peer_p.user_id) OR
    (bu.blocker_user_id = peer_p.user_id AND bu.blocked_user_id = auth.uid())
  )
  ORDER BY c.last_message_at DESC NULLS LAST, c.created_at DESC;
END;
$$;