-- Add email and phone to profiles table
ALTER TABLE public.profiles 
ADD COLUMN email TEXT,
ADD COLUMN phone TEXT;

-- Create representation status enum
CREATE TYPE public.representation_status AS ENUM ('pending', 'accepted', 'rejected', 'revoked');

-- Add representation_status to agent_artists table
ALTER TABLE public.agent_artists 
ADD COLUMN representation_status public.representation_status DEFAULT 'pending',
ADD COLUMN requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN responded_at TIMESTAMP WITH TIME ZONE;

-- Add representation_status to manager_artists table  
ALTER TABLE public.manager_artists
ADD COLUMN representation_status public.representation_status DEFAULT 'pending',
ADD COLUMN requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN responded_at TIMESTAMP WITH TIME ZONE;

-- Update RLS policies for agent_artists to only show accepted relationships publicly
DROP POLICY IF EXISTS "Artists can view their agents" ON public.agent_artists;
CREATE POLICY "Artists can view their agent relationships" 
ON public.agent_artists 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles p
  WHERE p.id = agent_artists.artist_profile_id 
  AND p.user_id = auth.uid()
));

CREATE POLICY "Public can view accepted agent relationships"
ON public.agent_artists
FOR SELECT
USING (representation_status = 'accepted');

-- Update RLS policies for manager_artists to only show accepted relationships publicly
DROP POLICY IF EXISTS "Artists can view their managers" ON public.manager_artists;
CREATE POLICY "Artists can view their manager relationships"
ON public.manager_artists
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM profiles p
  WHERE p.id = manager_artists.artist_profile_id 
  AND p.user_id = auth.uid()
));

CREATE POLICY "Public can view accepted manager relationships"
ON public.manager_artists
FOR SELECT
USING (representation_status = 'accepted');

-- Artists can update representation status for their requests
CREATE POLICY "Artists can update representation status"
ON public.agent_artists
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM profiles p
  WHERE p.id = agent_artists.artist_profile_id 
  AND p.user_id = auth.uid()
));

CREATE POLICY "Artists can update manager representation status"
ON public.manager_artists
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM profiles p
  WHERE p.id = manager_artists.artist_profile_id 
  AND p.user_id = auth.uid()
));

-- Update messaging policy function to handle exclusive managers
CREATE OR REPLACE FUNCTION public.enforce_messaging_policy()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conversation_record RECORD;
  sender_profile RECORD;
  sender_message_count INTEGER;
  other_user_id UUID;
  other_user_profile RECORD;
  artist_has_exclusive_manager BOOLEAN := false;
  exclusive_manager_profile_id UUID;
BEGIN
  -- Get conversation details
  SELECT * INTO conversation_record
  FROM public.conversations
  WHERE id = NEW.conversation_id;
  
  -- Only apply policy to direct conversations
  IF conversation_record.type != 'direct'::conversation_type THEN
    RETURN NEW;
  END IF;

  -- Get sender profile
  SELECT * INTO sender_profile
  FROM public.profiles
  WHERE user_id = NEW.sender_id;

  -- Check if users are blocked
  IF EXISTS (
    SELECT 1 FROM public.blocked_users bu
    JOIN public.conversation_participants cp1 ON cp1.user_id = bu.blocker_user_id
    JOIN public.conversation_participants cp2 ON cp2.user_id = bu.blocked_user_id
    WHERE cp1.conversation_id = NEW.conversation_id
      AND cp2.conversation_id = NEW.conversation_id
      AND cp1.user_id != cp2.user_id
      AND (bu.blocker_user_id = NEW.sender_id OR bu.blocked_user_id = NEW.sender_id)
  ) THEN
    RAISE EXCEPTION 'Cannot send message to blocked user';
  END IF;
  
  -- Get the other user in the conversation
  SELECT user_id INTO other_user_id
  FROM public.conversation_participants
  WHERE conversation_id = NEW.conversation_id 
    AND user_id != NEW.sender_id
  LIMIT 1;

  -- Get other user profile
  SELECT * INTO other_user_profile
  FROM public.profiles
  WHERE user_id = other_user_id;
  
  -- Check if artist has exclusive manager (accepts_direct_contact = false and has preferred_contact)
  IF other_user_profile.profile_type = 'artist' 
     AND other_user_profile.accepts_direct_contact = false 
     AND other_user_profile.preferred_contact_profile_id IS NOT NULL THEN
    artist_has_exclusive_manager := true;
    exclusive_manager_profile_id := other_user_profile.preferred_contact_profile_id;
    
    -- If trying to contact artist with exclusive manager, block unless sender is the exclusive manager
    IF sender_profile.id != exclusive_manager_profile_id THEN
      RAISE EXCEPTION 'This artist can only be contacted through their exclusive manager';
    END IF;
  END IF;
  
  -- If reply has been received, allow unlimited messaging
  IF conversation_record.reply_received = true THEN
    -- Update last message timestamp
    UPDATE public.conversations
    SET last_message_at = now()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
  END IF;
  
  -- Count messages from sender
  SELECT COUNT(*) INTO sender_message_count
  FROM public.messages
  WHERE conversation_id = NEW.conversation_id 
    AND sender_id = NEW.sender_id;
  
  -- Apply messaging restrictions ONLY when:
  -- - Sender is agent/manager/lieu AND recipient is artist
  -- - Sender has already sent a message and no reply received
  IF sender_profile.profile_type IN ('agent', 'manager', 'lieu') 
     AND other_user_profile.profile_type = 'artist'
     AND sender_message_count >= 1 THEN
    RAISE EXCEPTION 'Cannot send more messages until recipient replies';
  END IF;
  
  -- Check if this is a reply (sender is not the conversation initiator)
  IF EXISTS (
    SELECT 1 FROM public.messages
    WHERE conversation_id = NEW.conversation_id 
      AND sender_id != NEW.sender_id
  ) THEN
    -- This is a reply, mark conversation as replied
    UPDATE public.conversations
    SET reply_received = true, last_message_at = now()
    WHERE id = NEW.conversation_id;
  ELSE 
    -- Update last message timestamp for new conversations
    UPDATE public.conversations
    SET last_message_at = now()
    WHERE id = NEW.conversation_id;
  END IF;
  
  RETURN NEW;
END;
$$;