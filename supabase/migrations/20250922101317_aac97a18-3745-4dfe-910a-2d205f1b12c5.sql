-- Fix remaining function search_path issues and add enhanced security

-- Update all existing functions to have proper search_path settings
CREATE OR REPLACE FUNCTION public.ensure_user_profile(_user_id uuid, _display_name text DEFAULT NULL::text, _profile_type profile_type DEFAULT 'artist'::profile_type)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _profile_id UUID;
  _role app_role;
BEGIN
  -- Map profile_type to app_role
  _role := _profile_type::text::app_role;
  
  -- Check if profile already exists
  SELECT id INTO _profile_id
  FROM public.profiles
  WHERE user_id = _user_id;
  
  -- If no profile exists, create one
  IF _profile_id IS NULL THEN
    INSERT INTO public.profiles (user_id, display_name, profile_type)
    VALUES (_user_id, COALESCE(_display_name, 'New User'), _profile_type)
    RETURNING id INTO _profile_id;
  END IF;
  
  -- Ensure user role exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN _profile_id;
END;
$$;

-- Update other critical functions with proper search_path
CREATE OR REPLACE FUNCTION public.user_can_access_conversation(conv_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conv_id 
    AND cp.user_id = auth.uid()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_community_member(community_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.community_members cm
    WHERE cm.community_id = community_id_param 
    AND cm.user_id = user_id_param
  );
END;
$$;

-- Create login attempt tracking for enhanced security
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address inet,
  user_agent text,
  attempt_time timestamp with time zone DEFAULT now(),
  success boolean DEFAULT false,
  failure_reason text,
  blocked_until timestamp with time zone
);

-- Enable RLS on login attempts
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Only admins can view login attempts
CREATE POLICY "Only admins can view login attempts" ON public.login_attempts
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create function to track login attempts
CREATE OR REPLACE FUNCTION public.track_login_attempt(
  p_email text,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_success boolean DEFAULT false,
  p_failure_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_failures integer;
  block_duration integer;
  security_settings jsonb;
BEGIN
  -- Get security settings
  SELECT setting_value INTO security_settings
  FROM public.admin_settings
  WHERE setting_key = 'security_settings';
  
  IF security_settings IS NULL THEN
    security_settings := '{"max_login_attempts": 5, "lockout_duration_minutes": 15}'::jsonb;
  END IF;
  
  -- Insert the attempt
  INSERT INTO public.login_attempts (email, ip_address, user_agent, success, failure_reason)
  VALUES (p_email, p_ip_address, p_user_agent, p_success, p_failure_reason);
  
  -- If this is a failed attempt, check for blocking
  IF NOT p_success THEN
    -- Count recent failures
    SELECT COUNT(*) INTO recent_failures
    FROM public.login_attempts
    WHERE email = p_email
      AND success = false
      AND attempt_time > now() - INTERVAL '1 hour';
    
    -- Check if we should block
    IF recent_failures >= (security_settings->>'max_login_attempts')::integer THEN
      block_duration := (security_settings->>'lockout_duration_minutes')::integer;
      
      -- Update all recent failed attempts with block time
      UPDATE public.login_attempts
      SET blocked_until = now() + (block_duration || ' minutes')::interval
      WHERE email = p_email
        AND success = false
        AND attempt_time > now() - INTERVAL '1 hour'
        AND blocked_until IS NULL;
      
      RETURN jsonb_build_object(
        'blocked', true,
        'block_duration_minutes', block_duration,
        'attempts_count', recent_failures
      );
    END IF;
  END IF;
  
  RETURN jsonb_build_object(
    'blocked', false,
    'attempts_count', recent_failures
  );
END;
$$;

-- Create function to check if user is currently blocked
CREATE OR REPLACE FUNCTION public.is_user_blocked(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.login_attempts
    WHERE email = p_email
      AND blocked_until IS NOT NULL
      AND blocked_until > now()
  );
END;
$$;

-- Create enhanced audit logging for security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_user_id uuid DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    table_name,
    metadata,
    created_at
  ) VALUES (
    p_user_id,
    p_event_type,
    'security_events',
    jsonb_build_object(
      'email', p_email,
      'ip_address', p_ip_address::text,
      'user_agent', p_user_agent
    ) || p_metadata,
    now()
  );
END;
$$;

-- Create function to clean up old login attempts
CREATE OR REPLACE FUNCTION public.cleanup_old_login_attempts()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Delete login attempts older than 30 days
  DELETE FROM public.login_attempts 
  WHERE attempt_time < now() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Create password validation function
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb := '{"valid": true, "errors": []}'::jsonb;
  errors text[] := '{}';
BEGIN
  -- Check minimum length
  IF length(password) < 8 THEN
    errors := array_append(errors, 'Password must be at least 8 characters long');
  END IF;
  
  -- Check for uppercase letter
  IF password !~ '[A-Z]' THEN
    errors := array_append(errors, 'Password must contain at least one uppercase letter');
  END IF;
  
  -- Check for lowercase letter
  IF password !~ '[a-z]' THEN
    errors := array_append(errors, 'Password must contain at least one lowercase letter');
  END IF;
  
  -- Check for digit
  IF password !~ '[0-9]' THEN
    errors := array_append(errors, 'Password must contain at least one number');
  END IF;
  
  -- Check for special character
  IF password !~ '[^a-zA-Z0-9]' THEN
    errors := array_append(errors, 'Password must contain at least one special character');
  END IF;
  
  IF array_length(errors, 1) > 0 THEN
    result := jsonb_build_object(
      'valid', false,
      'errors', to_jsonb(errors)
    );
  END IF;
  
  RETURN result;
END;
$$;

-- Update existing trigger functions to include proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;