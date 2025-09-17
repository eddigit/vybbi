-- ===========================
-- PHASE 1: CORRECTION DES AVERTISSEMENTS DE SÉCURITÉ RESTANTS
-- ===========================

-- 1. CORRECTION DES FONCTIONS SANS SEARCH_PATH SÉCURISÉ
-- =====================================================

-- Identifier et corriger toutes les fonctions manquantes
-- Voici les fonctions qui n'ont pas encore été corrigées :

CREATE OR REPLACE FUNCTION public.update_affiliate_clicks_on_visit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the clicks count for the link
  UPDATE public.influencer_links 
  SET clicks_count = COALESCE(clicks_count, 0) + 1,
      updated_at = now()
  WHERE id = NEW.link_id;
  
  RETURN NEW;
END;
$$;

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
$$;

-- Corriger toutes les autres fonctions importantes
CREATE OR REPLACE FUNCTION public.notify_new_message_enhanced()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipient_user_id UUID;
  sender_profile RECORD;
  recipient_profile RECORD;
  conversation_info RECORD;
BEGIN
  -- Récupérer l'ID de l'utilisateur destinataire (l'autre participant dans la conversation)
  SELECT user_id INTO recipient_user_id
  FROM conversation_participants
  WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id
  LIMIT 1;

  IF recipient_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Récupérer les informations du profil de l'expéditeur
  SELECT * INTO sender_profile
  FROM profiles
  WHERE user_id = NEW.sender_id;

  -- Récupérer les informations du profil du destinataire  
  SELECT * INTO recipient_profile
  FROM profiles
  WHERE user_id = recipient_user_id;

  -- Récupérer les informations de la conversation
  SELECT * INTO conversation_info
  FROM conversations
  WHERE id = NEW.conversation_id;

  -- Créer la notification avec données enrichies
  PERFORM public.create_notification_with_email(
    recipient_user_id,
    'new_message'::notification_type,
    'Nouveau message reçu',
    format('Vous avez reçu un nouveau message de %s', COALESCE(sender_profile.display_name, 'un utilisateur')),
    jsonb_build_object(
      'conversation_id', NEW.conversation_id,
      'sender_id', NEW.sender_id,
      'message_id', NEW.id,
      'senderName', COALESCE(sender_profile.display_name, 'Utilisateur'),
      'senderProfileType', sender_profile.profile_type,
      'senderAvatarUrl', sender_profile.avatar_url,
      'recipientName', COALESCE(recipient_profile.display_name, 'Utilisateur'),
      'recipientProfileType', recipient_profile.profile_type,
      'message', NEW.content,
      'messagePreview', CASE 
        WHEN length(NEW.content) > 100 THEN substring(NEW.content, 1, 100) || '...'
        ELSE NEW.content
      END,
      'conversationType', conversation_info.type,
      'timestamp', NEW.created_at
    ),
    NEW.id
  );

  RETURN NEW;
END;
$$;

-- 2. ACTIVATION DE LA PROTECTION MOT DE PASSE
-- ===========================================

-- Note: Cette configuration doit être activée via l'interface Supabase Auth
-- car elle nécessite des permissions d'administration du projet
-- L'utilisateur devra activer manuellement "Leaked Password Protection" 
-- dans Auth > Settings > Password Protection

-- 3. NETTOYAGE DES EXTENSIONS DANS LE SCHÉMA PUBLIC  
-- ================================================

-- Déplacer les extensions vers des schémas dédiés si possible
-- Note: Certaines extensions peuvent nécessiter d'être dans public pour des raisons de compatibilité
-- Créer des schémas dédiés pour les extensions
CREATE SCHEMA IF NOT EXISTS extensions;

-- Déplacer les extensions non critiques hors du schéma public
-- Note: Cette opération peut nécessiter une maintenance et doit être testée

-- 4. RENFORCEMENT SUPPLÉMENTAIRE DE LA SÉCURITÉ
-- =============================================

-- Fonction pour auditer les accès sensibles
CREATE OR REPLACE FUNCTION public.audit_sensitive_access(
  table_name text,
  action text,
  record_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log uniquement si l'utilisateur n'est pas admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    INSERT INTO public.security_audit_log (
      user_id,
      action,
      table_name,
      record_id,
      created_at
    ) VALUES (
      auth.uid(),
      action,
      table_name,
      record_id,
      now()
    );
  END IF;
END;
$$;

-- Trigger pour auditer les accès aux données sensibles
CREATE OR REPLACE FUNCTION public.trigger_audit_sensitive_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.audit_sensitive_access(TG_TABLE_NAME, TG_OP, NEW.id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Appliquer l'audit aux tables sensibles
DROP TRIGGER IF EXISTS audit_prospects_access ON public.prospects;
CREATE TRIGGER audit_prospects_access
  AFTER SELECT ON public.prospects
  FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_sensitive_access();

-- 5. VALIDATION FINALE DE LA SÉCURITÉ
-- ==================================

-- S'assurer que toutes les tables critiques ont des policies restrictives
-- Vérifier que les admin roles sont correctement configurés

-- Fonction pour vérifier l'intégrité de la sécurité
CREATE OR REPLACE FUNCTION public.check_security_integrity()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb := '{}';
  tables_without_rls integer;
  policies_count integer;
BEGIN
  -- Compter les tables sans RLS
  SELECT COUNT(*)::integer INTO tables_without_rls
  FROM information_schema.tables t
  LEFT JOIN pg_class c ON c.relname = t.table_name
  WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND NOT c.relrowsecurity;
    
  -- Compter les policies de sécurité
  SELECT COUNT(*)::integer INTO policies_count
  FROM pg_policies 
  WHERE schemaname = 'public';
  
  result := jsonb_build_object(
    'tables_without_rls', tables_without_rls,
    'total_policies', policies_count,
    'security_status', CASE 
      WHEN tables_without_rls = 0 THEN 'SECURE'
      WHEN tables_without_rls < 5 THEN 'WARNING'
      ELSE 'CRITICAL'
    END,
    'checked_at', now()
  );
  
  RETURN result;
END;
$$;