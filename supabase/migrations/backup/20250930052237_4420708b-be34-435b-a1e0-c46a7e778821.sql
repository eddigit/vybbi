-- Phase 1: Create temporary_credentials table for venue prospecting
CREATE TABLE IF NOT EXISTS public.temporary_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  temp_username TEXT NOT NULL UNIQUE,
  temp_password_hash TEXT NOT NULL,
  claim_token TEXT NOT NULL UNIQUE,
  is_claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMPTZ,
  claimed_by_user_id UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Add columns to profiles for temporary profile tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_temporary BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS created_by_admin UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS temp_profile_notes TEXT;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_temp_credentials_profile ON public.temporary_credentials(profile_id);
CREATE INDEX IF NOT EXISTS idx_temp_credentials_token ON public.temporary_credentials(claim_token);
CREATE INDEX IF NOT EXISTS idx_temp_credentials_username ON public.temporary_credentials(temp_username);
CREATE INDEX IF NOT EXISTS idx_profiles_temporary ON public.profiles(is_temporary) WHERE is_temporary = true;

-- Enable RLS on temporary_credentials
ALTER TABLE public.temporary_credentials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for temporary_credentials
CREATE POLICY "Admins can manage all temporary credentials"
ON public.temporary_credentials
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view unclaimed credentials with valid token"
ON public.temporary_credentials
FOR SELECT
TO anon
USING (is_claimed = false AND expires_at > NOW());

CREATE POLICY "Authenticated users can claim credentials"
ON public.temporary_credentials
FOR UPDATE
TO authenticated
USING (is_claimed = false AND expires_at > NOW())
WITH CHECK (is_claimed = true AND claimed_by_user_id = auth.uid());

-- Update profiles RLS to allow viewing temporary profiles
CREATE POLICY "Public can view temporary venue profiles"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (is_temporary = true AND is_public = true AND profile_type = 'lieu'::profile_type);

-- Function to cleanup expired temporary credentials
CREATE OR REPLACE FUNCTION public.cleanup_expired_temp_credentials()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete expired unclaimed credentials
  DELETE FROM public.temporary_credentials
  WHERE is_claimed = false 
    AND expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Mark expired temporary profiles as inactive
  UPDATE public.profiles
  SET is_public = false
  WHERE is_temporary = true 
    AND id IN (
      SELECT profile_id FROM public.temporary_credentials
      WHERE is_claimed = false AND expires_at < NOW()
    );
  
  RETURN deleted_count;
END;
$$;

COMMENT ON TABLE public.temporary_credentials IS 'Stores temporary login credentials for venues created during physical prospecting';
COMMENT ON COLUMN public.profiles.is_temporary IS 'Indicates if this is a temporary profile created by admin during physical prospecting';
COMMENT ON COLUMN public.profiles.created_by_admin IS 'References the admin user who created this temporary profile';
COMMENT ON FUNCTION public.cleanup_expired_temp_credentials IS 'Removes expired temporary credentials and hides expired temporary profiles';