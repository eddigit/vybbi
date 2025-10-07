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

-- Create enhanced audit logging function
CREATE OR REPLACE FUNCTION public.audit_profile_access(profile_id uuid, access_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_record RECORD;
BEGIN
  -- Get profile info
  SELECT * INTO profile_record FROM public.profiles WHERE id = profile_id;
  
  -- Log access to profiles with PII if not owner or admin
  IF profile_record.email IS NOT NULL AND profile_record.email != '' THEN
    IF auth.uid() != profile_record.user_id AND NOT has_role(auth.uid(), 'admin') THEN
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
        profile_id,
        jsonb_build_object(
          'access_type', access_type,
          'accessed_profile_user_id', profile_record.user_id,
          'has_pii', true,
          'profile_type', profile_record.profile_type
        ),
        now()
      );
    END IF;
  END IF;
END;
$$;