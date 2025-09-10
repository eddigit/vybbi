-- Complete Admin Backend Implementation (handling existing policies)

-- 1. Update messaging policy to bypass blocked users for admins (already updated)

-- 2. Drop and recreate admin policies for events
DROP POLICY IF EXISTS "Admins can manage all events" ON public.events;
CREATE POLICY "Admins can manage all events"
ON public.events
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Admin RLS Policies for Annonces  
DROP POLICY IF EXISTS "Admins can view all annonces" ON public.annonces;
CREATE POLICY "Admins can view all annonces"
ON public.annonces
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update all annonces" ON public.annonces;  
CREATE POLICY "Admins can update all annonces"
ON public.annonces
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete all annonces" ON public.annonces;
CREATE POLICY "Admins can delete all annonces"
ON public.annonces
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Admin RLS Policies for Messages
DROP POLICY IF EXISTS "Admins can view all messages" ON public.messages;
CREATE POLICY "Admins can view all messages"
ON public.messages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete all messages" ON public.messages;
CREATE POLICY "Admins can delete all messages"
ON public.messages
FOR DELETE  
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 5. Admin RLS Policies for Conversations
DROP POLICY IF EXISTS "Admins can view all conversations" ON public.conversations;
CREATE POLICY "Admins can view all conversations"
ON public.conversations
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update conversations" ON public.conversations;
CREATE POLICY "Admins can update conversations"
ON public.conversations
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 6. Admin RLS Policies for Conversation Participants
DROP POLICY IF EXISTS "Admins can view all conversation participants" ON public.conversation_participants;
CREATE POLICY "Admins can view all conversation participants"
ON public.conversation_participants
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 7. Admin RLS Policies for Message Attachments
DROP POLICY IF EXISTS "Admins can view all message attachments" ON public.message_attachments;
CREATE POLICY "Admins can view all message attachments"
ON public.message_attachments
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete message attachments" ON public.message_attachments;
CREATE POLICY "Admins can delete message attachments"
ON public.message_attachments
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 8. Admin RLS Policies for Message Receipts
DROP POLICY IF EXISTS "Admins can view all message receipts" ON public.message_receipts;
CREATE POLICY "Admins can view all message receipts"
ON public.message_receipts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete message receipts" ON public.message_receipts;
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