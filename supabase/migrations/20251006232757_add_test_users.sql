-- Migration pour ajouter des utilisateurs de test dans l'environnement staging
-- Date: 2025-10-07
-- Objectif: Créer des comptes de test pour le développement

-- ===========================
-- INSERTION UTILISATEURS DE TEST
-- ===========================

-- Note: Dans Supabase, les utilisateurs sont gérés par auth.users
-- Nous devons créer les profils correspondants dans public.profiles

-- Créer des profils de test (les utilisateurs auth seront créés via l'interface)
INSERT INTO public.profiles (
    id,
    user_id, 
    display_name,
    profile_type,
    bio,
    is_public,
    created_at,
    updated_at
) VALUES 
-- Admin de test
(
    gen_random_uuid(),
    gen_random_uuid(), -- À remplacer par un vrai UUID d'utilisateur auth
    'Admin Test',
    'artist', -- En attendant d'avoir un type admin
    'Compte administrateur pour tests de développement',
    true,
    now(),
    now()
),
-- Artiste de test  
(
    gen_random_uuid(),
    gen_random_uuid(), -- À remplacer par un vrai UUID d'utilisateur auth
    'Artiste Test',
    'artist',
    'Artiste de test pour le développement',
    true,
    now(),
    now()
),
-- Agent de test
(
    gen_random_uuid(),
    gen_random_uuid(), -- À remplacer par un vrai UUID d'utilisateur auth
    'Agent Test',
    'agent', 
    'Agent de test pour le développement',
    true,
    now(),
    now()
);

-- ===========================
-- COMMENTAIRES
-- ===========================

-- Les utilisateurs devront être créés manuellement via :
-- 1. Interface Supabase Auth (https://supabase.com/dashboard/project/zckjtuenlpcfbwcgplaw/auth/users)
-- 2. Ou via l'inscription sur l'application

-- Comptes suggérés :
-- Email: admin@vybbi-staging.com, Mot de passe: TestAdmin123!
-- Email: artist@vybbi-staging.com, Mot de passe: TestArtist123!  
-- Email: agent@vybbi-staging.com, Mot de passe: TestAgent123!
