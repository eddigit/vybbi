-- Add missing metadata column to security_audit_log table
ALTER TABLE public.security_audit_log 
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Update the audit logging function to handle the missing column properly
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
    ip_address,
    user_agent,
    metadata,
    created_at
  ) VALUES (
    p_user_id,
    p_event_type,
    'security_events',
    p_ip_address,
    p_user_agent,
    jsonb_build_object(
      'email', p_email,
      'ip_address', p_ip_address::text,
      'user_agent', p_user_agent
    ) || p_metadata,
    now()
  );
END;
$$;