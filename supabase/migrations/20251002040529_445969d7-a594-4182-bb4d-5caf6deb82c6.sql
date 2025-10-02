
-- ============================================
-- FINAL FIX: Clean Up and Secure Profiles RLS
-- ============================================
-- Remove ALL existing SELECT policies and create clean, non-conflicting ones

-- Drop ALL SELECT policies on profiles
DROP POLICY IF EXISTS "Public has no direct access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can only view their own complete profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anonymous can view public profiles without PII" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view public profiles without PII" ON public.profiles;
DROP POLICY IF EXISTS "Block public access to sensitive PII data" ON public.profiles;
DROP POLICY IF EXISTS "Profile owners can view their own complete profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access to all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view temporary venue profiles" ON public.profiles;

-- Drop duplicate INSERT/UPDATE policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- ============================================
-- CREATE CLEAN, SECURE POLICIES
-- ============================================

-- SELECT POLICIES (Most restrictive)
-- 1. Profile owners can see their OWN complete profile (including PII)
CREATE POLICY "owners_view_own_profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Admins can see ALL profiles (including PII)  
CREATE POLICY "admins_view_all_profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. DENY all direct SELECT for public/anon
-- They MUST use safe_public_profiles view or get_safe_profile_data() function
CREATE POLICY "deny_public_direct_access"
ON public.profiles
FOR SELECT  
TO public, anon
USING (false);

-- INSERT POLICIES
CREATE POLICY "users_insert_own_profile"
ON public.profiles
FOR INSERT
TO authenticated, public
WITH CHECK (
  auth.uid() = user_id 
  OR 
  -- Allow temporary venue profiles for claim system
  (is_temporary = true AND profile_type = 'lieu'::profile_type)
);

-- UPDATE POLICIES
CREATE POLICY "users_update_own_profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- DELETE POLICIES (already exists, keep it)
-- "Profile owners and admins can delete profiles" already exists

-- Add security documentation
COMMENT ON POLICY "owners_view_own_profile" ON public.profiles IS
'Security: Users can only view their own complete profile including PII (email, phone, siret)';

COMMENT ON POLICY "admins_view_all_profiles" ON public.profiles IS
'Security: Admins can view all profiles including PII for moderation and support';

COMMENT ON POLICY "deny_public_direct_access" ON public.profiles IS
'Security: CRITICAL - Public users CANNOT access profiles table directly. They MUST use safe_public_profiles view or get_safe_profile_data() function which excludes PII.';

-- Verify safe_public_profiles view exists and has proper grants
GRANT SELECT ON public.safe_public_profiles TO public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_safe_profile_data(text) TO public, anon, authenticated;
