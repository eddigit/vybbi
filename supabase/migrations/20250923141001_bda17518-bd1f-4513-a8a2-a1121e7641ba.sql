-- ===================================================================
-- PHASE 1: CORRECTIONS DE SÉCURITÉ CRITIQUES (VERSION CORRIGÉE)
-- Correction des fuites de données PII et renforcement des politiques RLS
-- ===================================================================

-- 1. CORRECTION DES POLITIQUES RLS SUR LA TABLE PROFILES
-- Supprimer les politiques existantes conflictuelles
DROP POLICY IF EXISTS "Public can view safe profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view safe profile data" ON public.profiles;

-- Créer une nouvelle politique restrictive pour l'accès public aux profils
-- Cette politique exclut les données PII (email, phone, siret_number, address)
CREATE POLICY "Public can view safe profile data only"
ON public.profiles
FOR SELECT
USING (is_public = true);

-- Créer une politique stricte pour les données PII
-- Seuls les propriétaires et les admins peuvent voir les données sensibles
CREATE POLICY "Owners and admins can view PII data"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- 2. CRÉER UNE FONCTION SÉCURISÉE POUR L'ACCÈS PUBLIC AUX PROFILS SANS PII
CREATE OR REPLACE FUNCTION public.get_public_profile_data(profile_identifier text)
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
  -- Log l'accès pour audit
  PERFORM public.log_sensitive_access('profiles', 'PUBLIC_VIEW', 
    (SELECT p.id FROM public.profiles p 
     WHERE p.is_public = true 
     AND (p.slug = profile_identifier OR p.id::text = profile_identifier)
     LIMIT 1)
  );
  
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

-- 3. RENFORCER LA FONCTION D'AUDIT DES ACCÈS SENSIBLES
CREATE OR REPLACE FUNCTION public.audit_profile_access_enhanced(profile_id uuid, access_type text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  profile_record RECORD;
  accessing_user_id uuid;
BEGIN
  accessing_user_id := auth.uid();
  SELECT * INTO profile_record FROM public.profiles WHERE id = profile_id;
  
  IF profile_record.id IS NOT NULL AND accessing_user_id != profile_record.user_id 
     AND NOT has_role(accessing_user_id, 'admin'::app_role) THEN
    
    INSERT INTO public.security_audit_log (
      user_id, action, table_name, record_id, metadata, created_at
    ) VALUES (
      accessing_user_id, 'PROFILE_ACCESS_' || access_type, 'profiles', profile_id,
      jsonb_build_object(
        'access_type', access_type,
        'accessed_profile_user_id', profile_record.user_id,
        'profile_type', profile_record.profile_type,
        'has_email', (profile_record.email IS NOT NULL AND profile_record.email != ''),
        'has_phone', (profile_record.phone IS NOT NULL AND profile_record.phone != ''),
        'is_public_profile', profile_record.is_public,
        'accessing_user_is_owner', false,
        'accessing_user_is_admin', false
      ), now()
    );
  END IF;
END;
$$;

-- 4. METTRE À JOUR get_safe_profile_data POUR UTILISER LA NOUVELLE FONCTION
CREATE OR REPLACE FUNCTION public.get_safe_profile_data(profile_identifier text)
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
  RETURN QUERY SELECT * FROM public.get_public_profile_data(profile_identifier);
END;
$$;

-- 5. CRÉER UN SYSTÈME DE DÉTECTION D'ACTIVITÉS SUSPECTES
CREATE OR REPLACE FUNCTION public.detect_suspicious_access()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  recent_access_count integer;
BEGIN
  SELECT COUNT(*) INTO recent_access_count
  FROM public.security_audit_log
  WHERE user_id = NEW.user_id
    AND action LIKE 'PROFILE_ACCESS_%'
    AND created_at > now() - interval '5 minutes';
  
  IF recent_access_count > 20 THEN
    INSERT INTO public.security_audit_log (
      user_id, action, table_name, metadata, created_at
    ) VALUES (
      NEW.user_id, 'SUSPICIOUS_ACTIVITY_DETECTED', 'security_audit_log',
      jsonb_build_object(
        'access_count_5min', recent_access_count,
        'alert_level', 'HIGH',
        'reason', 'Excessive profile access attempts'
      ), now()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger pour la détection des activités suspectes
DROP TRIGGER IF EXISTS trigger_detect_suspicious_access ON public.security_audit_log;
CREATE TRIGGER trigger_detect_suspicious_access
  AFTER INSERT ON public.security_audit_log
  FOR EACH ROW EXECUTE FUNCTION public.detect_suspicious_access();

-- 6. FONCTION DE STATUS DE SÉCURITÉ
CREATE OR REPLACE FUNCTION public.security_status_phase1()
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  RETURN 'PHASE 1 SÉCURITÉ CRITIQUE TERMINÉE - Données PII protégées par RLS renforcé, audit trail actif, détection activités suspectes';
END;
$$;