-- SECURITY FIX: Restrict prospect and business intelligence data access
-- This migration addresses critical security vulnerabilities in prospect management

-- 1. Fix prospect_engagement_events - Remove dangerous open access
DROP POLICY IF EXISTS "Anyone can insert engagement events" ON public.prospect_engagement_events;

-- Create secure policies for prospect_engagement_events
CREATE POLICY "Admins can manage all engagement events" 
ON public.prospect_engagement_events 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Agents can insert engagement for their prospects" 
ON public.prospect_engagement_events 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM prospects p
    JOIN vybbi_agents va ON va.id = p.assigned_agent_id
    WHERE p.id = prospect_engagement_events.prospect_id 
    AND va.user_id = auth.uid()
  )
);

CREATE POLICY "System can insert engagement events" 
ON public.prospect_engagement_events 
FOR INSERT 
WITH CHECK (
  -- Allow system/service role to insert (for automated tracking)
  auth.uid() IS NULL OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- 2. Fix prospecting_campaigns - Restrict to campaign owners and admins
DROP POLICY IF EXISTS "Agents can view campaigns" ON public.prospecting_campaigns;

CREATE POLICY "Agents can view assigned campaigns" 
ON public.prospecting_campaigns 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM prospects p
    JOIN vybbi_agents va ON va.id = p.assigned_agent_id
    WHERE p.campaign_id = prospecting_campaigns.id 
    AND va.user_id = auth.uid()
  )
);

CREATE POLICY "Agents can create their own campaigns" 
ON public.prospecting_campaigns 
FOR INSERT 
WITH CHECK (
  created_by = auth.uid() AND
  EXISTS (SELECT 1 FROM vybbi_agents WHERE user_id = auth.uid())
);

CREATE POLICY "Agents can update their own campaigns" 
ON public.prospecting_campaigns 
FOR UPDATE 
USING (
  created_by = auth.uid() OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- 3. Fix prospecting_workflows - Restrict to authorized users only
DROP POLICY IF EXISTS "Agents can view active workflows" ON public.prospecting_workflows;

CREATE POLICY "Authorized agents can view relevant workflows" 
ON public.prospecting_workflows 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  -- Only agents who have prospects using this workflow can see it
  EXISTS (
    SELECT 1 FROM prospects p
    JOIN vybbi_agents va ON va.id = p.assigned_agent_id
    JOIN prospect_tasks pt ON pt.prospect_id = p.id
    WHERE pt.workflow_id = prospecting_workflows.id 
    AND va.user_id = auth.uid()
  )
);

-- 4. Fix prospect_tags - Restrict to relevant agents only
DROP POLICY IF EXISTS "Admins and agents can view prospect tags" ON public.prospect_tags;

CREATE POLICY "Agents can view tags for their prospects" 
ON public.prospect_tags 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (
    SELECT 1 FROM prospects p
    JOIN vybbi_agents va ON va.id = p.assigned_agent_id
    WHERE p.id = prospect_tags.prospect_id 
    AND va.user_id = auth.uid()
  )
);

CREATE POLICY "Agents can manage tags for their prospects" 
ON public.prospect_tags 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (
    SELECT 1 FROM prospects p
    JOIN vybbi_agents va ON va.id = p.assigned_agent_id
    WHERE p.id = prospect_tags.prospect_id 
    AND va.user_id = auth.uid()
  )
);

CREATE POLICY "Agents can update tags for their prospects" 
ON public.prospect_tags 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (
    SELECT 1 FROM prospects p
    JOIN vybbi_agents va ON va.id = p.assigned_agent_id
    WHERE p.id = prospect_tags.prospect_id 
    AND va.user_id = auth.uid()
  )
);

CREATE POLICY "Agents can delete tags for their prospects" 
ON public.prospect_tags 
FOR DELETE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (
    SELECT 1 FROM prospects p
    JOIN vybbi_agents va ON va.id = p.assigned_agent_id
    WHERE p.id = prospect_tags.prospect_id 
    AND va.user_id = auth.uid()
  )
);

-- 5. Add additional security for prospect_imports
CREATE POLICY "Agents can view their own imports" 
ON public.prospect_imports 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  imported_by = auth.uid()
);

-- 6. Create audit trigger for sensitive data access
CREATE OR REPLACE FUNCTION audit_prospect_data_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log access to sensitive prospect data
  IF TG_OP = 'SELECT' AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    PERFORM audit_sensitive_access(TG_TABLE_NAME, 'PROSPECT_DATA_ACCESS', 
      CASE TG_TABLE_NAME 
        WHEN 'prospects' THEN NEW.id
        WHEN 'prospecting_campaigns' THEN NEW.id
        ELSE NULL
      END
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_prospects_access
  AFTER SELECT ON public.prospects
  FOR EACH ROW EXECUTE FUNCTION audit_prospect_data_access();

CREATE TRIGGER audit_campaigns_access
  AFTER SELECT ON public.prospecting_campaigns
  FOR EACH ROW EXECUTE FUNCTION audit_prospect_data_access();

-- 7. Create function to verify agent prospect access
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION agent_can_access_prospect IS 'Security function to verify agent access to prospect data';