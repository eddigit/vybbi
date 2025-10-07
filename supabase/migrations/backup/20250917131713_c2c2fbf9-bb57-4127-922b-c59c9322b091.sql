-- ===========================
-- PHASE 1: SÉCURISATION IMMÉDIATE (CORRECTION)
-- ===========================

-- 1. CORRECTION DE LA FONCTION EXISTANTE
-- ======================================

-- Supprimer la fonction existante pour éviter le conflit de type
DROP FUNCTION IF EXISTS public.get_safe_profile_data(text);

-- Recréer la fonction avec le bon type de retour
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

-- 2. SÉCURISATION DES TABLES CRITIQUES
-- ====================================

-- Sécuriser prospects (données business sensibles)
CREATE POLICY "Only admins can view prospects"
ON public.prospects
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Sécuriser vybbi_agents (informations personnelles agents)
CREATE POLICY "Only admins can view agents"
ON public.vybbi_agents
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. SÉCURISATION DES DONNÉES ANALYTIQUES
-- =======================================

-- Remplacer les policies trop permissives
DROP POLICY IF EXISTS "Anyone can insert metrics" ON public.ad_metrics;
CREATE POLICY "Authenticated users can insert metrics"
ON public.ad_metrics
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Sécuriser les vues de profils
CREATE POLICY "Authenticated users can track views"
ON public.profile_views
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Sécuriser les lectures de musique
CREATE POLICY "Authenticated users can track music plays"  
ON public.music_plays
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 4. SÉCURISATION DES MÉTRIQUES BUSINESS
-- ======================================

-- Sécuriser affiliate_conversions
DROP POLICY IF EXISTS "System can insert conversions" ON public.affiliate_conversions;
CREATE POLICY "Authenticated system can insert conversions"
ON public.affiliate_conversions
FOR INSERT  
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 5. CORRECTION DES FONCTIONS (SEARCH_PATH)
-- =========================================

CREATE OR REPLACE FUNCTION public.sync_task_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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

-- 6. SÉCURISATION TEMPLATES ET CAMPAIGNS
-- ======================================

-- Restreindre l'accès aux email_templates
DROP POLICY IF EXISTS "Public can view active templates for sending" ON public.email_templates;
CREATE POLICY "Only admins can access templates"
ON public.email_templates
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Protéger les campaigns actives
CREATE POLICY "Only admins can modify active campaigns"
ON public.ad_campaigns
FOR UPDATE
TO authenticated  
USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. TABLE DE LOG SÉCURITÉ
-- ========================

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

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view security logs"
ON public.security_audit_log
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 8. VALIDATION RLS
-- =================

-- S'assurer que RLS est activé sur toutes les tables sensibles
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vybbi_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_plays ENABLE ROW LEVEL SECURITY;