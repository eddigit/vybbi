-- FIX: Function Search Path Security Warnings
-- This addresses the security warnings about functions with mutable search paths

-- Fix the agent_can_access_prospect function
CREATE OR REPLACE FUNCTION agent_can_access_prospect(prospect_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN has_role(auth.uid(), 'admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM prospects p
      JOIN vybbi_agents va ON va.id = p.assigned_agent_id
      WHERE p.id = prospect_id AND va.user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix the audit_prospect_access function
CREATE OR REPLACE FUNCTION audit_prospect_access(
  table_name TEXT,
  operation TEXT,
  record_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Manual security audit logging for critical operations
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    PERFORM log_security_event(
      'PROSPECT_DATA_ACCESS',
      auth.uid(),
      NULL,
      inet_client_addr(),
      NULL,
      jsonb_build_object(
        'table_name', table_name,
        'operation', operation,
        'record_id', record_id,
        'timestamp', now()
      )
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;