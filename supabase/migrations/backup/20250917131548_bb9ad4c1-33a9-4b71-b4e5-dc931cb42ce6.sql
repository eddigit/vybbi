-- ===========================
-- PHASE 1: SÉCURISATION IMMÉDIATE
-- ===========================

-- 1. SÉCURISATION DES TABLES CRITIQUES (Erreurs)
-- ================================================

-- Sécuriser la table prospects (Business Prospect Information)
DROP POLICY IF EXISTS "Public can view prospects" ON public.prospects;
CREATE POLICY "Only admins can view prospects"
ON public.prospects
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Sécuriser la table vybbi_agents (Sales Agent Information)  
DROP POLICY IF EXISTS "Public can view agents" ON public.vybbi_agents;
CREATE POLICY "Only admins can view agents"
ON public.vybbi_agents
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Sécuriser les données de contact dans profiles
-- Créer une vue publique sans données sensibles
CREATE OR REPLACE VIEW public.safe_profiles AS
SELECT 
  id,
  user_id,
  display_name,
  profile_type,
  avatar_url,
  bio,
  location,
  city,
  genres,
  talents,
  languages,
  website,
  instagram_url,
  spotify_url,
  soundcloud_url,
  youtube_url,
  tiktok_url,
  experience,
  is_public,
  slug,
  header_url,
  header_position_y,
  venue_category,
  venue_capacity,
  accepts_direct_contact,
  preferred_contact_profile_id,
  created_at,
  updated_at,
  profile_completion_percentage,
  onboarding_completed
FROM public.profiles
WHERE is_public = true;

-- Fonction sécurisée pour récupérer les données de profil
CREATE OR REPLACE FUNCTION public.get_safe_profile_data(profile_identifier text)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  display_name text,
  profile_type profile_type,
  avatar_url text,
  bio text,
  location text,
  city text,
  genres text[],
  talents text[],
  languages text[],
  website text,
  instagram_url text,
  spotify_url text,
  soundcloud_url text,
  youtube_url text,
  tiktok_url text,
  experience text,
  is_public boolean,
  slug text,
  header_url text,
  header_position_y integer,
  venue_category text,
  venue_capacity integer,
  accepts_direct_contact boolean,
  preferred_contact_profile_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  profile_completion_percentage integer,
  onboarding_completed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.display_name,
    p.profile_type,
    p.avatar_url,
    p.bio,
    p.location,
    p.city,
    p.genres,
    p.talents,
    p.languages,
    p.website,
    p.instagram_url,
    p.spotify_url,
    p.soundcloud_url,
    p.youtube_url,
    p.tiktok_url,
    p.experience,
    p.is_public,
    p.slug,
    p.header_url,
    p.header_position_y,
    p.venue_category,
    p.venue_capacity,
    p.accepts_direct_contact,
    p.preferred_contact_profile_id,
    p.created_at,
    p.updated_at,
    p.profile_completion_percentage,
    p.onboarding_completed
  FROM public.profiles p
  WHERE p.is_public = true
    AND (p.slug = profile_identifier OR p.id::text = profile_identifier)
  LIMIT 1;
END;
$$;

-- 2. SÉCURISATION DES DONNÉES ANALYTIQUES
-- =======================================

-- Sécuriser ad_metrics (tracking data)
DROP POLICY IF EXISTS "Anyone can insert metrics" ON public.ad_metrics;
CREATE POLICY "Authenticated users can insert metrics"
ON public.ad_metrics
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Sécuriser profile_views 
DROP POLICY IF EXISTS "Anyone can insert profile views" ON public.profile_views;
CREATE POLICY "Authenticated users can track views"
ON public.profile_views
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Sécuriser music_plays
DROP POLICY IF EXISTS "Anyone can track music plays" ON public.music_plays;
CREATE POLICY "Authenticated users can track music plays"  
ON public.music_plays
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Sécuriser affiliate_visits
DROP POLICY IF EXISTS "Anyone can insert visits for tracking" ON public.affiliate_visits;
CREATE POLICY "System can insert visits for tracking"
ON public.affiliate_visits  
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. SÉCURISATION DES MÉTRIQUES BUSINESS
-- =====================================

-- Sécuriser affiliate_conversions
ALTER POLICY "System can insert conversions" ON public.affiliate_conversions 
RENAME TO "Authenticated system can insert conversions";

DROP POLICY "Authenticated system can insert conversions" ON public.affiliate_conversions;
CREATE POLICY "Authenticated system can insert conversions"
ON public.affiliate_conversions
FOR INSERT  
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 4. CORRECTION DES FONCTIONS SANS SEARCH_PATH SÉCURISÉ
-- =====================================================

-- Corriger les fonctions détectées par le linter
CREATE OR REPLACE FUNCTION public.sync_task_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Quand le status change, ajuster processing_status si nécessaire
  IF NEW.status != OLD.status THEN
    CASE NEW.status
      WHEN 'pending' THEN
        NEW.processing_status := 'waiting';
      WHEN 'completed', 'skipped', 'failed' THEN
        NEW.processing_status := NEW.status;
        NEW.locked_at := NULL;
        NEW.processing_by := NULL;
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Corriger update_profile_completion
CREATE OR REPLACE FUNCTION public.update_profile_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER  
SET search_path = public
AS $$
BEGIN
  NEW.profile_completion_percentage := public.calculate_profile_completion(NEW);
  NEW.onboarding_completed := NEW.profile_completion_percentage >= 70;
  RETURN NEW;
END;
$$;

-- 5. AUDIT ET NETTOYAGE DES POLICIES
-- ==================================

-- Supprimer les policies trop permissives sur les email_templates
DROP POLICY IF EXISTS "Public can view active templates for sending" ON public.email_templates;
CREATE POLICY "Only system functions can access templates"
ON public.email_templates
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Sécuriser les ad_campaigns contre l'accès concurrent
CREATE POLICY "Only admins can modify campaigns during active periods"
ON public.ad_campaigns
FOR UPDATE
TO authenticated  
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND (start_date > CURRENT_DATE OR end_date < CURRENT_DATE OR NOT is_active)
);

-- 6. PROTECTION SUPPLÉMENTAIRE DES DONNÉES SENSIBLES
-- ==================================================

-- Créer une fonction pour vérifier l'accès aux données sensibles
CREATE OR REPLACE FUNCTION public.authorize_sensitive_data_access()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Seuls les admins et les utilisateurs authentifiés peuvent accéder aux données sensibles
  RETURN auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'moderator'::app_role)
  );
END;
$$;

-- Appliquer la protection sur les tables de commission
CREATE POLICY "Only authorized users can view commissions"
ON public.recurring_commissions
FOR SELECT
TO authenticated
USING (authorize_sensitive_data_access());

-- 7. LOGGING DE SÉCURITÉ
-- ======================

-- Créer une table pour logger les accès sensibles
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Activer RLS sur la table de log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view security logs"
ON public.security_audit_log
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 8. VALIDATION FINALE
-- ====================

-- S'assurer que toutes les tables sensibles ont RLS activé
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vybbi_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_plays ENABLE ROW LEVEL SECURITY;