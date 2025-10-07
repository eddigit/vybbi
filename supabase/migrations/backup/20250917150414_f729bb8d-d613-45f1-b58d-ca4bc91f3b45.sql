-- CORRECTION FINALE DES 3 ERREURS CRITIQUES DE SÉCURITÉ
-- Le problème : Les vues appartiennent à 'postgres' qui a le rôle pg_read_all_data
-- Solution : Utiliser SECURITY INVOKER pour respecter les permissions de l'utilisateur

-- 1. Recréation de safe_public_profiles avec SECURITY INVOKER
DROP VIEW IF EXISTS public.safe_public_profiles CASCADE;

CREATE VIEW public.safe_public_profiles 
WITH (security_invoker = true) AS 
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

-- 2. Recréation de safe_profiles avec SECURITY INVOKER
DROP VIEW IF EXISTS public.safe_profiles CASCADE;

CREATE VIEW public.safe_profiles 
WITH (security_invoker = true) AS 
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

-- 3. Recréation de security_summary avec SECURITY INVOKER (accès limité aux admins)
DROP VIEW IF EXISTS public.security_summary CASCADE;

CREATE VIEW public.security_summary 
WITH (security_invoker = true) AS 
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

-- Attribution des permissions appropriées
GRANT SELECT ON public.safe_public_profiles TO authenticated, anon;
GRANT SELECT ON public.safe_profiles TO authenticated, anon;
GRANT SELECT ON public.security_summary TO authenticated;

-- Création d'une politique RLS spécifique pour security_summary
-- uniquement accessible aux admins
CREATE POLICY "security_summary_admin_only" ON public.security_audit_log
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Les vues utilisent maintenant SECURITY INVOKER, donc elles respectent
-- les permissions et les politiques RLS de l'utilisateur qui les interroge