-- Complete Admin Backend Implementation

-- 1. Update messaging policy to bypass blocked users for admins
CREATE OR REPLACE FUNCTION public.enforce_messaging_policy()
RETURNS TRIGGER
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

-- 2. Admin RLS Policies for Events
CREATE POLICY "Admins can manage all events"
ON public.events
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Admin RLS Policies for Annonces  
CREATE POLICY "Admins can view all annonces"
ON public.annonces
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all annonces"
ON public.annonces
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all annonces"
ON public.annonces
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Admin RLS Policies for Messages
CREATE POLICY "Admins can view all messages"
ON public.messages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all messages"
ON public.messages
FOR DELETE  
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 5. Admin RLS Policies for Conversations
CREATE POLICY "Admins can view all conversations"
ON public.conversations
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update conversations"
ON public.conversations
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 6. Admin RLS Policies for Conversation Participants
CREATE POLICY "Admins can view all conversation participants"
ON public.conversation_participants
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 7. Admin RLS Policies for Message Attachments
CREATE POLICY "Admins can view all message attachments"
ON public.message_attachments
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete message attachments"
ON public.message_attachments
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 8. Admin RLS Policies for Message Receipts
CREATE POLICY "Admins can view all message receipts"
ON public.message_receipts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete message receipts"
ON public.message_receipts
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 9. Admin messaging function for individual messages
CREATE OR REPLACE FUNCTION public.send_admin_message(target_user_id uuid, content text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  conversation_id UUID;
  current_user_id UUID;
  message_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  -- Verify caller is admin
  IF NOT public.has_role(current_user_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;
  
  -- Get or create conversation with target user
  SELECT public.start_direct_conversation(target_user_id) INTO conversation_id;
  
  -- Insert admin message with special prefix
  INSERT INTO public.messages (conversation_id, sender_id, content)
  VALUES (
    conversation_id,
    current_user_id,
    '🔴 [MESSAGE ADMINISTRATEUR] 🔴' || chr(10) || chr(10) || content
  )
  RETURNING id INTO message_id;
  
  RETURN message_id;
END;
$function$;

-- 10. Admin broadcast messaging function
CREATE OR REPLACE FUNCTION public.send_admin_broadcast(
  profile_types profile_type[] DEFAULT NULL,
  only_public boolean DEFAULT false,
  content text DEFAULT ''
)
RETURNS TABLE(sent_count integer, error_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  current_user_id UUID;
  target_user RECORD;
  sent_messages INTEGER := 0;
  failed_messages INTEGER := 0;
BEGIN
  current_user_id := auth.uid();
  
  -- Verify caller is admin
  IF NOT public.has_role(current_user_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;
  
  -- Get target users based on filters
  FOR target_user IN
    SELECT DISTINCT p.user_id
    FROM public.profiles p
    WHERE 
      (profile_types IS NULL OR p.profile_type = ANY(profile_types))
      AND (NOT only_public OR p.is_public = true)
      AND p.user_id != current_user_id  -- Don't message self
  LOOP
    BEGIN
      -- Send message to each target user
      PERFORM public.send_admin_message(target_user.user_id, content);
      sent_messages := sent_messages + 1;
    EXCEPTION WHEN OTHERS THEN
      failed_messages := failed_messages + 1;
      -- Log error but continue processing other users
      CONTINUE;
    END;
  END LOOP;
  
  RETURN QUERY SELECT sent_messages, failed_messages;
END;
$function$;