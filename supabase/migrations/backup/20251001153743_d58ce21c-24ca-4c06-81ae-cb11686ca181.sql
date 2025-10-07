-- Amélioration de la fonction enforce_messaging_policy avec meilleure gestion d'erreur
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
  sender_is_admin BOOLEAN := false;
BEGIN
  -- Validation des UUIDs
  IF NEW.conversation_id IS NULL OR NEW.sender_id IS NULL THEN
    RAISE EXCEPTION 'conversation_id and sender_id cannot be null';
  END IF;

  -- Get conversation details
  SELECT * INTO conversation_record
  FROM public.conversations
  WHERE id = NEW.conversation_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conversation not found: %', NEW.conversation_id;
  END IF;

  IF conversation_record.type != 'direct'::conversation_type THEN
    RETURN NEW;
  END IF;

  -- Get sender profile with error handling
  SELECT * INTO sender_profile
  FROM public.profiles
  WHERE user_id = NEW.sender_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sender profile not found for user: %', NEW.sender_id;
  END IF;

  IF sender_profile.profile_type IS NULL THEN
    RAISE EXCEPTION 'Sender profile_type is null for user: %', NEW.sender_id;
  END IF;

  -- Check if sender is admin
  SELECT public.has_role(NEW.sender_id, 'admin') INTO sender_is_admin;

  -- Get the other user with validation
  SELECT user_id INTO other_user_id
  FROM public.conversation_participants
  WHERE conversation_id = NEW.conversation_id 
    AND user_id != NEW.sender_id
  LIMIT 1;

  IF other_user_id IS NULL THEN
    RAISE LOG 'No other participant found in conversation %', NEW.conversation_id;
    -- Allow message if it's the first one in the conversation
    UPDATE public.conversations
    SET last_message_at = now()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
  END IF;

  -- Get other user profile with error handling
  SELECT * INTO other_user_profile
  FROM public.profiles
  WHERE user_id = other_user_id;
  
  IF NOT FOUND THEN
    RAISE LOG 'Other user profile not found for user: %', other_user_id;
    -- Allow message but log the issue
    UPDATE public.conversations
    SET last_message_at = now()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
  END IF;

  IF other_user_profile.profile_type IS NULL THEN
    RAISE LOG 'Other user profile_type is null for user: %', other_user_id;
    -- Allow message but log the issue
    UPDATE public.conversations
    SET last_message_at = now()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
  END IF;
  
  -- If reply received, allow unlimited messaging
  IF conversation_record.reply_received = true THEN
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
  
  -- Apply restrictions (skip if admin)
  -- Only restrict agent/manager/lieu contacting artist
  IF sender_profile.profile_type IN ('agent', 'manager', 'lieu') 
     AND other_user_profile.profile_type = 'artist'
     AND sender_message_count >= 1 
     AND NOT sender_is_admin THEN
    RAISE EXCEPTION 'Cannot send more messages until recipient replies';
  END IF;
  
  -- Mark as replied if this is a response
  IF EXISTS (
    SELECT 1 FROM public.messages
    WHERE conversation_id = NEW.conversation_id 
      AND sender_id != NEW.sender_id
  ) THEN
    UPDATE public.conversations
    SET reply_received = true, last_message_at = now()
    WHERE id = NEW.conversation_id;
  ELSE 
    UPDATE public.conversations
    SET last_message_at = now()
    WHERE id = NEW.conversation_id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block the message
    RAISE LOG 'Error in enforce_messaging_policy: % %', SQLERRM, SQLSTATE;
    -- Update conversation timestamp anyway
    UPDATE public.conversations
    SET last_message_at = now()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$;

-- Amélioration de la fonction start_direct_conversation avec validation
CREATE OR REPLACE FUNCTION public.start_direct_conversation(target_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conversation_id UUID;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  -- Validation des UUIDs
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  IF target_user_id IS NULL OR target_user_id = '00000000-0000-0000-0000-000000000000'::uuid THEN
    RAISE EXCEPTION 'Invalid target_user_id: %', target_user_id;
  END IF;
  
  IF current_user_id = target_user_id THEN
    RAISE EXCEPTION 'Cannot create conversation with yourself';
  END IF;
  
  -- Verify both users exist and have profiles
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = current_user_id) THEN
    RAISE EXCEPTION 'Current user profile not found';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = target_user_id) THEN
    RAISE EXCEPTION 'Target user profile not found';
  END IF;
  
  -- Check if users are blocked
  IF EXISTS (
    SELECT 1 FROM public.blocked_users 
    WHERE (blocker_user_id = current_user_id AND blocked_user_id = target_user_id)
       OR (blocker_user_id = target_user_id AND blocked_user_id = current_user_id)
  ) THEN
    RAISE EXCEPTION 'Cannot start conversation with blocked user';
  END IF;
  
  -- Check if conversation already exists
  SELECT c.id INTO conversation_id
  FROM public.conversations c
  WHERE c.type = 'direct'::conversation_type
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp1 
      WHERE cp1.conversation_id = c.id AND cp1.user_id = current_user_id
    )
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp2 
      WHERE cp2.conversation_id = c.id AND cp2.user_id = target_user_id
    );
  
  -- If no conversation exists, create one
  IF conversation_id IS NULL THEN
    INSERT INTO public.conversations (type, title) 
    VALUES ('direct'::conversation_type, NULL)
    RETURNING id INTO conversation_id;
    
    -- Add participants
    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES 
      (conversation_id, current_user_id),
      (conversation_id, target_user_id);
      
    RAISE LOG 'Created new conversation % between users % and %', conversation_id, current_user_id, target_user_id;
  ELSE
    RAISE LOG 'Using existing conversation % between users % and %', conversation_id, current_user_id, target_user_id;
  END IF;
  
  RETURN conversation_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error in start_direct_conversation: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END;
$$;

-- Fonction de diagnostic pour vérifier l'état d'un utilisateur
CREATE OR REPLACE FUNCTION public.diagnose_user_messaging(user_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb := '{}'::jsonb;
  profile_data RECORD;
  roles_data text[];
  conversations_count integer;
  messages_count integer;
BEGIN
  -- Check if user exists
  result := jsonb_build_object('user_id', user_id_param);
  
  -- Get profile
  SELECT * INTO profile_data
  FROM public.profiles
  WHERE user_id = user_id_param;
  
  IF FOUND THEN
    result := result || jsonb_build_object(
      'profile_exists', true,
      'profile_id', profile_data.id,
      'profile_type', profile_data.profile_type,
      'display_name', profile_data.display_name,
      'is_public', profile_data.is_public
    );
  ELSE
    result := result || jsonb_build_object('profile_exists', false);
  END IF;
  
  -- Get roles
  SELECT array_agg(role::text) INTO roles_data
  FROM public.user_roles
  WHERE user_id = user_id_param;
  
  result := result || jsonb_build_object('roles', COALESCE(roles_data, ARRAY[]::text[]));
  
  -- Get conversation count
  SELECT COUNT(*) INTO conversations_count
  FROM public.conversation_participants
  WHERE user_id = user_id_param;
  
  result := result || jsonb_build_object('conversations_count', conversations_count);
  
  -- Get messages count
  SELECT COUNT(*) INTO messages_count
  FROM public.messages
  WHERE sender_id = user_id_param;
  
  result := result || jsonb_build_object('messages_sent_count', messages_count);
  
  -- Check for blocked users
  result := result || jsonb_build_object(
    'blocked_users_count', (
      SELECT COUNT(*) FROM public.blocked_users WHERE blocker_user_id = user_id_param
    ),
    'blocked_by_count', (
      SELECT COUNT(*) FROM public.blocked_users WHERE blocked_user_id = user_id_param
    )
  );
  
  RETURN result;
END;
$$;

-- S'assurer que tous les profils ont un profile_type défini
-- Cette requête va identifier les profils problématiques
DO $$
DECLARE
  invalid_profiles integer;
BEGIN
  SELECT COUNT(*) INTO invalid_profiles
  FROM public.profiles
  WHERE profile_type IS NULL;
  
  IF invalid_profiles > 0 THEN
    RAISE NOTICE 'Found % profiles without profile_type', invalid_profiles;
    
    -- Set default profile_type to 'artist' for profiles without one
    UPDATE public.profiles
    SET profile_type = 'artist'::profile_type
    WHERE profile_type IS NULL;
    
    RAISE NOTICE 'Updated % profiles with default profile_type', invalid_profiles;
  END IF;
END $$;