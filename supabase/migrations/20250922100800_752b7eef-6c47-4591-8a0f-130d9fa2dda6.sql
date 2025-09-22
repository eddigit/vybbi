-- Fix Critical PII Exposure in profiles table
-- Drop existing policies that expose PII and create secure ones

-- First, drop all existing policies on profiles table
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create secure policies that protect PII
CREATE POLICY "Public can view safe profile data" ON public.profiles
FOR SELECT USING (
  is_public = true AND (
    -- Hide sensitive PII from public view
    CASE 
      WHEN auth.uid() = user_id THEN true  -- Users can see their own full profile
      WHEN has_role(auth.uid(), 'admin') THEN true  -- Admins can see all
      ELSE email IS NULL OR email = ''  -- Public can only see profiles without exposed emails
    END
  )
);

-- Users can view their own complete profile (including PII)
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create a safe function to get public profile data without PII exposure
CREATE OR REPLACE FUNCTION public.get_safe_public_profile(profile_identifier text)
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
    -- Exclude profiles with exposed PII unless user owns it or is admin
    AND (
      p.email IS NULL OR 
      p.email = '' OR 
      p.user_id = auth.uid() OR 
      has_role(auth.uid(), 'admin')
    )
  LIMIT 1;
END;
$$;

-- Fix database functions to include proper search_path settings
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Update existing functions to have proper search_path
CREATE OR REPLACE FUNCTION public.user_owns_profile(profile_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = profile_id_param 
    AND p.user_id = auth.uid()
  );
END;
$$;

-- Create audit logging for sensitive data access
CREATE OR REPLACE FUNCTION public.audit_sensitive_profile_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log access to profiles with PII if not owner or admin
  IF (NEW.email IS NOT NULL AND NEW.email != '') OR (NEW.phone IS NOT NULL AND NEW.phone != '') THEN
    IF auth.uid() != NEW.user_id AND NOT has_role(auth.uid(), 'admin') THEN
      INSERT INTO public.security_audit_log (
        user_id,
        action,
        table_name,
        record_id,
        metadata,
        created_at
      ) VALUES (
        auth.uid(),
        'SENSITIVE_PROFILE_ACCESS',
        'profiles',
        NEW.id,
        jsonb_build_object(
          'accessed_profile_user_id', NEW.user_id,
          'has_pii', true,
          'profile_type', NEW.profile_type
        ),
        now()
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for audit logging
DROP TRIGGER IF EXISTS audit_profile_access_trigger ON public.profiles;
CREATE TRIGGER audit_profile_access_trigger
  AFTER SELECT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_sensitive_profile_access();

-- Create admin settings table for configurable admin emails
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on admin settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage settings
CREATE POLICY "Only admins can manage admin settings" ON public.admin_settings
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Insert default admin settings (replace hardcoded values)
INSERT INTO public.admin_settings (setting_key, setting_value, description)
VALUES 
  ('admin_emails', '["admin@vybbi.app", "support@vybbi.app"]'::jsonb, 'List of admin email addresses'),
  ('security_settings', '{
    "max_login_attempts": 5,
    "lockout_duration_minutes": 15,
    "require_captcha_after_attempts": 3
  }'::jsonb, 'Security configuration settings')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  updated_at = now();

-- Create function to get admin emails securely
CREATE OR REPLACE FUNCTION public.get_admin_emails()
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  emails text[];
BEGIN
  SELECT ARRAY(
    SELECT jsonb_array_elements_text(setting_value)
    FROM public.admin_settings
    WHERE setting_key = 'admin_emails'
  ) INTO emails;
  
  RETURN COALESCE(emails, ARRAY['admin@vybbi.app']);
END;
$$;