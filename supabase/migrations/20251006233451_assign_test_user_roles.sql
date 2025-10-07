-- Migration pour attribuer les rôles aux utilisateurs de test
-- Date: 2025-10-07
-- Objectif: Créer les profils avec les bons rôles pour les utilisateurs test

-- ===========================
-- INSERTION DES PROFILS AVEC LES BONS RÔLES
-- ===========================

-- Artiste (test-artiste@vybbi.app)
INSERT INTO public.profiles (
    id,
    user_id,
    display_name, 
    profile_type,
    bio,
    is_public,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '503ad7d2-7a18-40cf-ab48-6a34e83e0a4d'::uuid, -- UID de test-artiste@vybbi.app
    'Artiste Test',
    'artist',
    'Profil artiste de test pour le développement',
    true,
    now(),
    now()
) ON CONFLICT (user_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    profile_type = EXCLUDED.profile_type,
    bio = EXCLUDED.bio,
    updated_at = now();

-- Agent (test-agent@vybbi.app) 
INSERT INTO public.profiles (
    id,
    user_id,
    display_name,
    profile_type, 
    bio,
    is_public,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '3bee9f97-1cbd-4028-8cfa-94ab6701d0c1'::uuid, -- UID de test-agent@vybbi.app
    'Agent Test',
    'agent',
    'Profil agent de test pour le développement', 
    true,
    now(),
    now()
) ON CONFLICT (user_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    profile_type = EXCLUDED.profile_type,
    bio = EXCLUDED.bio,
    updated_at = now();

-- Lieu (test-lieu@vybbi.app)
INSERT INTO public.profiles (
    id,
    user_id,
    display_name,
    profile_type,
    bio,
    is_public, 
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '843a3d9a-3586-41c8-94cc-1d4481953398'::uuid, -- UID de test-lieu@vybbi.app
    'Lieu Test',
    'lieu', 
    'Profil lieu de test pour le développement',
    true,
    now(),
    now()
) ON CONFLICT (user_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    profile_type = EXCLUDED.profile_type,
    bio = EXCLUDED.bio,
    updated_at = now();

-- ===========================
-- COMMENTAIRES
-- ===========================

-- Les UUID correspondent aux utilisateurs visibles dans l'image fournie :
-- - 503ad7d2-7a18-40cf-ab48-6a34e83e0a4d → test-artiste@vybbi.app (artist)  
-- - 3bee9f97-1cbd-4028-8cfa-94ab6701d0c1 → test-agent@vybbi.app (agent)
-- - 843a3d9a-3586-41c8-94cc-1d4481953398 → test-lieu@vybbi.app (lieu)
