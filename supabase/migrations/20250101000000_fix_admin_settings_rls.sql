-- Fix admin_settings RLS policies to allow public read access
-- This prevents 406 errors when non-admin users try to read admin settings

-- Drop existing policy
DROP POLICY IF EXISTS "Only admins can manage admin settings" ON public.admin_settings;

-- Create separate policies for read and write operations
CREATE POLICY "Anyone can read admin settings" ON public.admin_settings
FOR SELECT USING (true);

CREATE POLICY "Only admins can modify admin settings" ON public.admin_settings
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update admin settings" ON public.admin_settings
FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete admin settings" ON public.admin_settings
FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Create a more robust function to get security settings
CREATE OR REPLACE FUNCTION public.get_security_settings()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  settings jsonb;
BEGIN
  SELECT setting_value INTO settings
  FROM public.admin_settings
  WHERE setting_key = 'security_settings';
  
  RETURN COALESCE(settings, '{
    "max_login_attempts": 5,
    "lockout_duration_minutes": 15,
    "require_captcha_after_attempts": 3
  }'::jsonb);
END;
$$;