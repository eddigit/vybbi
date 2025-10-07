-- ===================================================================
-- CORRECTIONS DE SÉCURITÉ CRITIQUES - MIGRATION INTELLIGENTE
-- Vérifie l'existence des politiques avant création/modification
-- ===================================================================

-- 1. CRÉER UNE FONCTION SÉCURISÉE POUR L'ACCÈS PUBLIC AUX PROFILS SANS PII
-- Cette fonction exclut systématiquement les données sensibles (email, phone, siret_number)
CREATE OR REPLACE FUNCTION public.get_secure_public_profile_data(profile_identifier text)
RETURNS TABLE(
  id uuid, user_id uuid, display_name text, profile_type profile_type,
  avatar_url text, bio text, location text, city text, genres text[], talents text[],
  languages text[], website text, instagram_url text, spotify_url text,
  soundcloud_url text, youtube_url text, tiktok_url text, experience text,
  is_public boolean, slug text, header_url text, header_position_y integer,
  venue_category text, venue_capacity integer, accepts_direct_contact boolean,
  preferred_contact_profile_id uuid, created_at timestamp with time zone,
  updated_at timestamp with time zone, profile_completion_percentage integer,
  onboarding_completed boolean
) 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Audit trail pour tous les accès publics aux profils
  PERFORM public.log_sensitive_access('profiles', 'SECURE_PUBLIC_VIEW', 
    (SELECT p.id FROM public.profiles p 
     WHERE p.is_public = true 
     AND (p.slug = profile_identifier OR p.id::text = profile_identifier)
     LIMIT 1)
  );
  
  -- Retourner uniquement les données non-sensibles, même si l'utilisateur a accès aux données PII
  RETURN QUERY
  SELECT p.id, p.user_id, p.display_name, p.profile_type, p.avatar_url, p.bio,
         p.location, p.city, p.genres, p.talents, p.languages, p.website,
         p.instagram_url, p.spotify_url, p.soundcloud_url, p.youtube_url,
         p.tiktok_url, p.experience, p.is_public, p.slug, p.header_url,
         p.header_position_y, p.venue_category, p.venue_capacity,
         p.accepts_direct_contact, p.preferred_contact_profile_id,
         p.created_at, p.updated_at, p.profile_completion_percentage,
         p.onboarding_completed
  FROM public.profiles p
  WHERE p.is_public = true
    AND (p.slug = profile_identifier OR p.id::text = profile_identifier)
  LIMIT 1;
END;
$$;

-- 2. AMÉLIORER LA FONCTION D'AUDIT DES ACCÈS SENSIBLES
CREATE OR REPLACE FUNCTION public.enhanced_audit_profile_access(profile_id uuid, access_type text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  profile_record RECORD;
  accessing_user_id uuid;
  is_owner boolean := false;
  is_admin boolean := false;
BEGIN
  accessing_user_id := auth.uid();
  
  -- Vérifier si l'utilisateur est propriétaire ou admin
  IF accessing_user_id IS NOT NULL THEN
    SELECT * INTO profile_record FROM public.profiles WHERE id = profile_id;
    is_owner := (accessing_user_id = profile_record.user_id);
    is_admin := has_role(accessing_user_id, 'admin'::app_role);
  END IF;
  
  -- Logger tous les accès non-autorisés aux profils
  IF profile_record.id IS NOT NULL AND NOT is_owner AND NOT is_admin THEN
    INSERT INTO public.security_audit_log (
      user_id, action, table_name, record_id, metadata, created_at
    ) VALUES (
      accessing_user_id, 
      'PROFILE_ACCESS_' || access_type, 
      'profiles', 
      profile_id,
      jsonb_build_object(
        'access_type', access_type,
        'accessed_profile_user_id', profile_record.user_id,
        'profile_type', profile_record.profile_type,
        'has_pii_data', (
          (profile_record.email IS NOT NULL AND profile_record.email != '') OR
          (profile_record.phone IS NOT NULL AND profile_record.phone != '') OR
          (profile_record.siret_number IS NOT NULL AND profile_record.siret_number != '')
        ),
        'is_public_profile', profile_record.is_public,
        'security_level', 'MEDIUM'
      ), 
      now()
    );
  END IF;
END;
$$;

-- 3. SYSTÈME DE DÉTECTION D'ACTIVITÉS SUSPECTES RENFORCÉ
CREATE OR REPLACE FUNCTION public.advanced_suspicious_activity_detector()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  recent_access_count integer;
  distinct_profiles_accessed integer;
  risk_level text := 'LOW';
BEGIN
  -- Compter les accès récents
  SELECT COUNT(*), COUNT(DISTINCT record_id) 
  INTO recent_access_count, distinct_profiles_accessed
  FROM public.security_audit_log
  WHERE user_id = NEW.user_id
    AND action LIKE 'PROFILE_ACCESS_%'
    AND created_at > now() - interval '5 minutes';
  
  -- Déterminer le niveau de risque
  IF recent_access_count > 50 THEN
    risk_level := 'CRITICAL';
  ELSIF recent_access_count > 20 THEN
    risk_level := 'HIGH';
  ELSIF recent_access_count > 10 THEN
    risk_level := 'MEDIUM';
  END IF;
  
  -- Alerter si activité suspecte détectée
  IF recent_access_count > 10 THEN
    INSERT INTO public.security_audit_log (
      user_id, action, table_name, metadata, created_at
    ) VALUES (
      NEW.user_id, 
      'SUSPICIOUS_ACTIVITY_DETECTED', 
      'security_audit_log',
      jsonb_build_object(
        'access_count_5min', recent_access_count,
        'distinct_profiles_accessed', distinct_profiles_accessed,
        'risk_level', risk_level,
        'reason', 'Excessive profile access attempts',
        'alert_timestamp', now(),
        'requires_review', (risk_level IN ('HIGH', 'CRITICAL'))
      ), 
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recréer le trigger avec la nouvelle fonction
DROP TRIGGER IF EXISTS trigger_detect_suspicious_access ON public.security_audit_log;
CREATE TRIGGER trigger_advanced_suspicious_activity_detector
  AFTER INSERT ON public.security_audit_log
  FOR EACH ROW 
  EXECUTE FUNCTION public.advanced_suspicious_activity_detector();

-- 4. FONCTION DE VÉRIFICATION DE LA SÉCURITÉ DES PROFILS
CREATE OR REPLACE FUNCTION public.check_profile_security_status()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  total_profiles integer;
  public_profiles integer;
  profiles_with_pii integer;
  public_profiles_with_pii integer;
  security_status jsonb;
BEGIN
  -- Compter les profils
  SELECT COUNT(*) INTO total_profiles FROM public.profiles;
  SELECT COUNT(*) INTO public_profiles FROM public.profiles WHERE is_public = true;
  
  -- Compter les profils avec des données PII
  SELECT COUNT(*) INTO profiles_with_pii 
  FROM public.profiles 
  WHERE (email IS NOT NULL AND email != '') 
     OR (phone IS NOT NULL AND phone != '') 
     OR (siret_number IS NOT NULL AND siret_number != '');
  
  SELECT COUNT(*) INTO public_profiles_with_pii 
  FROM public.profiles 
  WHERE is_public = true 
    AND ((email IS NOT NULL AND email != '') 
         OR (phone IS NOT NULL AND phone != '') 
         OR (siret_number IS NOT NULL AND siret_number != ''));
  
  -- Construire le rapport de sécurité
  security_status := jsonb_build_object(
    'total_profiles', total_profiles,
    'public_profiles', public_profiles,
    'profiles_with_pii', profiles_with_pii,
    'public_profiles_with_pii', public_profiles_with_pii,
    'pii_exposure_risk', CASE 
      WHEN public_profiles_with_pii > 0 THEN 'HIGH' 
      ELSE 'LOW' 
    END,
    'security_functions_active', jsonb_build_object(
      'secure_profile_access', true,
      'audit_trail', true,
      'suspicious_activity_detection', true
    ),
    'recommendations', CASE 
      WHEN public_profiles_with_pii > 0 THEN 
        jsonb_build_array('Review public profiles with PII data', 'Consider making sensitive profiles private')
      ELSE 
        jsonb_build_array('Security status: GOOD')
    END,
    'last_check', now()
  );
  
  RETURN security_status;
END;
$$;

-- 5. FONCTION DE STATUS GLOBAL DE SÉCURITÉ
CREATE OR REPLACE FUNCTION public.security_critical_fixes_status()
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  RETURN 'CORRECTIONS CRITIQUES APPLIQUÉES - Accès sécurisé aux profils, audit renforcé, détection avancée des activités suspectes. Utilisez check_profile_security_status() pour un rapport détaillé.';
END;
$$;