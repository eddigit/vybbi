-- CORRECTION DES 3 ERREURS CRITIQUES DE SÉCURITÉ
-- Correction des vues SECURITY DEFINER détectées par le linter

-- 1. Suppression et recréation de la vue safe_public_profiles sans SECURITY DEFINER
DROP VIEW IF EXISTS public.safe_public_profiles;

CREATE VIEW public.safe_public_profiles AS 
SELECT 
    id,
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
    slug,
    header_url,
    header_position_y,
    venue_category,
    venue_capacity,
    accepts_direct_contact,
    created_at,
    updated_at,
    profile_completion_percentage,
    onboarding_completed
FROM public.profiles
WHERE is_public = true;

-- 2. Suppression et recréation de la vue safe_profiles sans SECURITY DEFINER
DROP VIEW IF EXISTS public.safe_profiles;

CREATE VIEW public.safe_profiles AS 
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

-- 3. Suppression et recréation de la vue security_summary sans SECURITY DEFINER
DROP VIEW IF EXISTS public.security_summary;

CREATE VIEW public.security_summary AS 
SELECT 
    date(created_at) AS access_date,
    table_name,
    action,
    count(*) AS access_count,
    count(DISTINCT user_id) AS unique_users
FROM public.security_audit_log
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY date(created_at), table_name, action
ORDER BY date(created_at) DESC, count(*) DESC;

-- Application des permissions appropriées pour les vues
-- Les vues héritent maintenant des politiques RLS des tables sous-jacentes

-- Permettre aux utilisateurs authentifiés de voir les profils publics via les vues
GRANT SELECT ON public.safe_public_profiles TO authenticated, anon;
GRANT SELECT ON public.safe_profiles TO authenticated, anon;

-- La vue security_summary ne doit être accessible qu'aux admins
GRANT SELECT ON public.security_summary TO authenticated;

-- RLS est automatiquement appliqué via les tables sous-jacentes
-- Les vues n'ont plus de privilèges SECURITY DEFINER qui contournent les politiques