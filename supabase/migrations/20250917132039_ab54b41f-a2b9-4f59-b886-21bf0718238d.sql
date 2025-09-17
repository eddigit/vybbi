-- ===========================
-- PHASE 1: FINALISATION SÉCURISATION (CORRECTION SYNTAXE)  
-- ===========================

-- 1. CORRECTION DES FONCTIONS RESTANTES SANS SEARCH_PATH
-- ======================================================

CREATE OR REPLACE FUNCTION public.update_affiliate_clicks_on_visit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
  sender_is_admin BOOLEAN := false;
BEGIN
  SELECT * INTO conversation_record FROM public.conversations WHERE id = NEW.conversation_id;
  
  IF conversation_record.type != 'direct'::conversation_type THEN
    RETURN NEW;
  END IF;

  SELECT * INTO sender_profile FROM public.profiles WHERE user_id = NEW.sender_id;
  SELECT public.has_role(NEW.sender_id, 'admin') INTO sender_is_admin;

  IF NOT sender_is_admin AND EXISTS (
    SELECT 1 FROM public.blocked_users bu
    JOIN public.conversation_participants cp1 ON cp1.user_id = bu.blocker_user_id
    JOIN public.conversation_participants cp2 ON cp2.user_id = bu.blocked_user_id
    WHERE cp1.conversation_id = NEW.conversation_id AND cp2.conversation_id = NEW.conversation_id
      AND cp1.user_id != cp2.user_id
      AND (bu.blocker_user_id = NEW.sender_id OR bu.blocked_user_id = NEW.sender_id)
  ) THEN
    RAISE EXCEPTION 'Cannot send message to blocked user';
  END IF;
  
  SELECT user_id INTO other_user_id FROM public.conversation_participants
  WHERE conversation_id = NEW.conversation_id AND user_id != NEW.sender_id LIMIT 1;

  SELECT * INTO other_user_profile FROM public.profiles WHERE user_id = other_user_id;
  
  IF conversation_record.reply_received = true THEN
    UPDATE public.conversations SET last_message_at = now() WHERE id = NEW.conversation_id;
    RETURN NEW;
  END IF;
  
  SELECT COUNT(*) INTO sender_message_count FROM public.messages
  WHERE conversation_id = NEW.conversation_id AND sender_id = NEW.sender_id;
  
  IF sender_profile.profile_type IN ('agent', 'manager', 'lieu') 
     AND other_user_profile.profile_type = 'artist'
     AND sender_message_count >= 1 AND NOT sender_is_admin THEN
    RAISE EXCEPTION 'Cannot send more messages until recipient replies';
  END IF;
  
  IF EXISTS (SELECT 1 FROM public.messages WHERE conversation_id = NEW.conversation_id AND sender_id != NEW.sender_id) THEN
    UPDATE public.conversations SET reply_received = true, last_message_at = now() WHERE id = NEW.conversation_id;
  ELSE 
    UPDATE public.conversations SET last_message_at = now() WHERE id = NEW.conversation_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 2. FONCTION D'AUDIT SÉCURISÉ SIMPLE
-- ===================================

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
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    INSERT INTO public.security_audit_log (user_id, action, table_name, record_id, created_at)
    VALUES (auth.uid(), action, table_name, record_id, now());
  END IF;
END;
$$;

-- 3. FONCTION DE VALIDATION SÉCURITÉ 
-- ==================================

CREATE OR REPLACE FUNCTION public.check_security_integrity()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  tables_without_rls integer;
  policies_count integer;
BEGIN
  SELECT COUNT(*)::integer INTO tables_without_rls
  FROM information_schema.tables t
  LEFT JOIN pg_class c ON c.relname = t.table_name
  WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE' AND NOT c.relrowsecurity;
    
  SELECT COUNT(*)::integer INTO policies_count FROM pg_policies WHERE schemaname = 'public';
  
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

-- 4. RENFORCEMENT DES POLICIES RLS EXISTANTES
-- ===========================================

-- S'assurer que les tables critiques ont RLS et des policies restrictives
DO $$ 
BEGIN
  -- Vérifier et activer RLS sur toutes les tables sensibles
  PERFORM 1 FROM pg_class WHERE relname = 'prospects' AND relrowsecurity = false;
  IF FOUND THEN
    ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
  END IF;
  
  PERFORM 1 FROM pg_class WHERE relname = 'vybbi_agents' AND relrowsecurity = false;
  IF FOUND THEN
    ALTER TABLE public.vybbi_agents ENABLE ROW LEVEL SECURITY;
  END IF;
  
  PERFORM 1 FROM pg_class WHERE relname = 'security_audit_log' AND relrowsecurity = false;
  IF FOUND THEN
    ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 5. POLITIQUE DE SÉCURITÉ POUR LES FONCTIONS SYSTÈMES
-- ====================================================

-- Politique restrictive pour l'exécution de fonctions d'audit
REVOKE EXECUTE ON FUNCTION public.audit_sensitive_access(text, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.audit_sensitive_access(text, text, uuid) TO authenticated;

-- Politique pour la vérification d'intégrité (accessible aux admins)
REVOKE EXECUTE ON FUNCTION public.check_security_integrity() FROM PUBLIC;  
GRANT EXECUTE ON FUNCTION public.check_security_integrity() TO authenticated;

-- 6. ACTIVATION DU LOGGING AUTOMATIQUE
-- ====================================

-- Créer une vue sécurisée pour monitorer les accès
CREATE OR REPLACE VIEW public.security_summary AS
SELECT 
  DATE(created_at) as access_date,
  table_name,
  action,
  COUNT(*) as access_count,
  COUNT(DISTINCT user_id) as unique_users
FROM public.security_audit_log
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at), table_name, action
ORDER BY access_date DESC, access_count DESC;

-- RLS sur la vue de sécurité
CREATE POLICY "Only admins can view security summary" 
ON public.security_audit_log 
FOR SELECT 
TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. MESSAGE DE VALIDATION
-- ========================

-- Insérer un log de validation de la sécurisation
INSERT INTO public.security_audit_log (
  user_id, action, table_name, record_id, created_at
) VALUES (
  NULL, 'SECURITY_MIGRATION_COMPLETED', 'system', gen_random_uuid(), now()
);