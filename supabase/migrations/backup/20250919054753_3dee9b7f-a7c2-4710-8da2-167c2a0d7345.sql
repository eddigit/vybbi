-- Create tables for business integrations

-- Integrations table
CREATE TABLE public.integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'inactive'
);

-- Prospect meetings table
CREATE TABLE public.prospect_meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  meeting_type TEXT NOT NULL DEFAULT 'video',
  meeting_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER DEFAULT 60,
  agenda TEXT,
  location TEXT,
  notes TEXT,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Automation workflows table
CREATE TABLE public.automation_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Automation steps table
CREATE TABLE public.automation_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES automation_workflows(id) ON DELETE CASCADE,
  order_number INTEGER NOT NULL,
  channel TEXT NOT NULL,
  delay_hours INTEGER DEFAULT 0,
  template_id UUID,
  content TEXT,
  conditions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Automation executions table
CREATE TABLE public.automation_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES automation_workflows(id) ON DELETE CASCADE,
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  current_step_id UUID REFERENCES automation_steps(id),
  metadata JSONB DEFAULT '{}'
);

-- Webhook subscriptions table
CREATE TABLE public.webhook_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  headers JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Webhook deliveries table
CREATE TABLE public.webhook_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id UUID NOT NULL REFERENCES webhook_subscriptions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  delivered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  success BOOLEAN DEFAULT false
);

-- Enable RLS on all tables
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospect_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for integrations
CREATE POLICY "Admins can manage all integrations" ON public.integrations FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for prospect meetings
CREATE POLICY "Users can manage meetings for their prospects" ON public.prospect_meetings 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM prospects p 
    WHERE p.id = prospect_meetings.prospect_id 
    AND p.assigned_agent_id IN (
      SELECT va.id FROM vybbi_agents va WHERE va.user_id = auth.uid()
    )
  )
);

-- RLS Policies for automation workflows
CREATE POLICY "Admins can manage automation workflows" ON public.automation_workflows FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Agents can view active workflows" ON public.automation_workflows FOR SELECT USING (is_active = true);

-- RLS Policies for automation steps
CREATE POLICY "Users can view steps for accessible workflows" ON public.automation_steps 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM automation_workflows w 
    WHERE w.id = automation_steps.workflow_id 
    AND (w.is_active = true OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- RLS Policies for automation executions
CREATE POLICY "Users can view executions for their prospects" ON public.automation_executions 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM prospects p 
    WHERE p.id = automation_executions.prospect_id 
    AND p.assigned_agent_id IN (
      SELECT va.id FROM vybbi_agents va WHERE va.user_id = auth.uid()
    )
  ) OR has_role(auth.uid(), 'admin'::app_role)
);

-- RLS Policies for webhooks (admin only)
CREATE POLICY "Admins can manage webhook subscriptions" ON public.webhook_subscriptions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view webhook deliveries" ON public.webhook_deliveries FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON public.integrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_prospect_meetings_updated_at BEFORE UPDATE ON public.prospect_meetings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_automation_workflows_updated_at BEFORE UPDATE ON public.automation_workflows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_webhook_subscriptions_updated_at BEFORE UPDATE ON public.webhook_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add missing prospect status value
ALTER TYPE prospect_status ADD VALUE IF NOT EXISTS 'meeting_scheduled';

-- Create indexes for performance
CREATE INDEX idx_prospect_meetings_prospect_id ON public.prospect_meetings(prospect_id);
CREATE INDEX idx_prospect_meetings_meeting_time ON public.prospect_meetings(meeting_time);
CREATE INDEX idx_automation_executions_prospect_id ON public.automation_executions(prospect_id);
CREATE INDEX idx_automation_executions_workflow_id ON public.automation_executions(workflow_id);
CREATE INDEX idx_webhook_deliveries_webhook_id ON public.webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_delivered_at ON public.webhook_deliveries(delivered_at);