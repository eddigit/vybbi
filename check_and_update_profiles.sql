-- Vérifier la structure de la table profiles
\d+ profiles

-- Voir les utilisateurs existants
SELECT 
    email, 
    id, 
    created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- Voir les profils existants
SELECT 
    id, 
    user_type, 
    full_name, 
    email,
    created_at
FROM profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- Mettre à jour les rôles des utilisateurs de test
-- Lieu/Venue
UPDATE profiles 
SET user_type = 'lieu', 
    full_name = COALESCE(full_name, 'Test Lieu')
WHERE email = 'test-lieu@vybbi.app';

-- Agent
UPDATE profiles 
SET user_type = 'agent', 
    full_name = COALESCE(full_name, 'Test Agent')
WHERE email = 'test-agent@vybbi.app';

-- Artiste
UPDATE profiles 
SET user_type = 'artiste', 
    full_name = COALESCE(full_name, 'Test Artiste')
WHERE email = 'test-artiste@vybbi.app';

-- Vérification finale
SELECT 
    id, 
    user_type, 
    full_name, 
    email,
    created_at
FROM profiles 
WHERE email IN ('test-lieu@vybbi.app', 'test-agent@vybbi.app', 'test-artiste@vybbi.app')
ORDER BY email;