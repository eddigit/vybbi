-- Create message receipts table for read status tracking
CREATE TABLE IF NOT EXISTS public.message_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- Create conversation archives table
CREATE TABLE IF NOT EXISTS public.conversation_archives (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  archived_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, conversation_id)
);

-- Create conversation pins table  
CREATE TABLE IF NOT EXISTS public.conversation_pins (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  pinned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, conversation_id)
);

-- Enable RLS on new tables
ALTER TABLE public.message_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_pins ENABLE ROW LEVEL SECURITY;

-- RLS policies for message_receipts
CREATE POLICY "Users can manage their own receipts" ON public.message_receipts
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view receipts in their conversations" ON public.message_receipts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = message_receipts.conversation_id 
    AND cp.user_id = auth.uid()
  )
);

-- RLS policies for conversation_archives
CREATE POLICY "Users can manage their own archives" ON public.conversation_archives
FOR ALL USING (auth.uid() = user_id);

-- RLS policies for conversation_pins
CREATE POLICY "Users can manage their own pins" ON public.conversation_pins
FOR ALL USING (auth.uid() = user_id);

-- Enable realtime for new tables
ALTER TABLE public.message_receipts REPLICA IDENTITY FULL;
ALTER TABLE public.conversation_archives REPLICA IDENTITY FULL;
ALTER TABLE public.conversation_pins REPLICA IDENTITY FULL;

-- Update the get_conversations_with_peers function to include archive/pin status
CREATE OR REPLACE FUNCTION public.get_conversations_with_details()
RETURNS TABLE(
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
  is_blocked boolean,
  is_archived boolean,
  is_pinned boolean,
  unread_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    CASE WHEN bu.id IS NOT NULL THEN true ELSE false END as is_blocked,
    CASE WHEN ca.conversation_id IS NOT NULL THEN true ELSE false END as is_archived,
    CASE WHEN cp.conversation_id IS NOT NULL THEN true ELSE false END as is_pinned,
    COALESCE(unread.count, 0) as unread_count
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
  LEFT JOIN conversation_archives ca ON ca.user_id = auth.uid() AND ca.conversation_id = c.id
  LEFT JOIN conversation_pins cp ON cp.user_id = auth.uid() AND cp.conversation_id = c.id
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as count
    FROM messages m
    LEFT JOIN message_receipts mr ON mr.conversation_id = m.conversation_id AND mr.user_id = auth.uid()
    WHERE m.conversation_id = c.id 
    AND m.sender_id != auth.uid()
    AND (mr.last_read_at IS NULL OR m.created_at > mr.last_read_at)
  ) unread ON true
  ORDER BY 
    CASE WHEN cp.conversation_id IS NOT NULL THEN cp.pinned_at END DESC NULLS LAST,
    c.last_message_at DESC NULLS LAST, 
    c.created_at DESC;
END;
$function$;