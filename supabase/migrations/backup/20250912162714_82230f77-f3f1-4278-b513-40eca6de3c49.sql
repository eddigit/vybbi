-- Fix search_path for functions that don't have it set

-- Update enforce_messaging_policy function
CREATE OR REPLACE FUNCTION public.enforce_messaging_policy()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  conversation_record RECORD;
  sender_profile RECORD;
  sender_message_count INTEGER;
  other_user_id UUID;
  other_user_profile RECORD;
  artist_has_exclusive_manager BOOLEAN := false;
  exclusive_manager_profile_id UUID;
  sender_is_admin BOOLEAN := false;
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

  -- Check if sender is admin
  SELECT public.has_role(NEW.sender_id, 'admin') INTO sender_is_admin;

  -- Check if users are blocked (BYPASS FOR ADMINS)
  IF NOT sender_is_admin AND EXISTS (
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
    
    -- If trying to contact artist with exclusive manager, block unless sender is the exclusive manager OR sender is admin
    IF sender_profile.id != exclusive_manager_profile_id AND NOT sender_is_admin THEN
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
  -- - Sender is NOT admin (admins can send unlimited messages)
  IF sender_profile.profile_type IN ('agent', 'manager', 'lieu') 
     AND other_user_profile.profile_type = 'artist'
     AND sender_message_count >= 1 
     AND NOT sender_is_admin THEN
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
$function$;

-- Update update_updated_at_column function  
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;