-- Migration corrigée pour améliorer le système de notifications en temps réel

-- 1. Créer une fonction trigger pour les notifications automatiques de messages
CREATE OR REPLACE FUNCTION public.notify_new_message_enhanced()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Supprimer l'ancien trigger s'il existe et créer le nouveau
DROP TRIGGER IF EXISTS notify_new_message_trigger ON public.messages;

CREATE TRIGGER notify_new_message_enhanced_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_message_enhanced();

-- 3. Améliorer la table notifications pour supporter plus de métadonnées
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS action_url TEXT DEFAULT NULL;

-- 4. Créer un index pour améliorer les performances des requêtes de notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON public.notifications (user_id, read_at) 
WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_created_at 
ON public.notifications (created_at DESC);

-- 5. Activer les mises à jour en temps réel pour les tables importantes
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;

-- 6. Ajouter les tables aux publications realtime si ce n'est pas déjà fait
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- 7. Créer une fonction pour nettoyer les anciennes notifications
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.notifications 
  WHERE read_at IS NOT NULL 
    AND read_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  DELETE FROM public.notifications 
  WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;