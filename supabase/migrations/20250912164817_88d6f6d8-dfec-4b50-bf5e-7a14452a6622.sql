-- Create enum types for prospecting system
CREATE TYPE public.prospect_type AS ENUM ('artist', 'venue', 'agent', 'manager');
CREATE TYPE public.prospect_status AS ENUM ('new', 'contacted', 'qualified', 'interested', 'converted', 'rejected', 'unresponsive');
CREATE TYPE public.interaction_type AS ENUM ('email', 'call', 'meeting', 'message', 'note');
CREATE TYPE public.conversion_status AS ENUM ('pending', 'confirmed', 'failed');

-- Vybbi agents table (extends existing user system)
CREATE TABLE public.vybbi_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 2.00, -- 2 euros par défaut
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_prospects_assigned INTEGER DEFAULT 0,
  total_converted INTEGER DEFAULT 0,
  total_commissions DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Prospects table
CREATE TABLE public.prospects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prospect_type public.prospect_type NOT NULL,
  company_name TEXT,
  contact_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  website TEXT,
  social_media JSONB, -- {instagram: "", facebook: "", etc.}
  status public.prospect_status NOT NULL DEFAULT 'new',
  qualification_score INTEGER DEFAULT 0, -- 0-100 score
  notes TEXT,
  source TEXT, -- where did we get this prospect from
  assigned_agent_id UUID REFERENCES public.vybbi_agents(id),
  assigned_at TIMESTAMP WITH TIME ZONE,
  last_contact_at TIMESTAMP WITH TIME ZONE,
  next_follow_up_at TIMESTAMP WITH TIME ZONE,
  converted_user_id UUID REFERENCES auth.users(id), -- when they become a user
  converted_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.vybbi_agents(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Prospect interactions (emails, calls, meetings, etc.)
CREATE TABLE public.prospect_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.vybbi_agents(id),
  interaction_type public.interaction_type NOT NULL,
  subject TEXT,
  content TEXT,
  outcome TEXT, -- result of the interaction
  next_action TEXT, -- what should happen next
  scheduled_at TIMESTAMP WITH TIME ZONE, -- for scheduled calls/meetings
  completed_at TIMESTAMP WITH TIME ZONE,
  email_opened BOOLEAN DEFAULT false,
  email_clicked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Prospect assignments tracking
CREATE TABLE public.prospect_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.vybbi_agents(id),
  assigned_by UUID REFERENCES public.vybbi_agents(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unassigned_at TIMESTAMP WITH TIME ZONE,
  reason TEXT -- reason for assignment/unassignment
);

-- Conversion tracking
CREATE TABLE public.conversion_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prospect_id UUID NOT NULL REFERENCES public.prospects(id),
  agent_id UUID NOT NULL REFERENCES public.vybbi_agents(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  conversion_status public.conversion_status NOT NULL DEFAULT 'pending',
  subscription_type TEXT, -- type of subscription taken
  conversion_value DECIMAL(10,2), -- value of the conversion
  commission_amount DECIMAL(10,2),
  commission_paid BOOLEAN DEFAULT false,
  commission_paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Agent commissions
CREATE TABLE public.agent_commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.vybbi_agents(id),
  conversion_id UUID NOT NULL REFERENCES public.conversion_tracking(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, cancelled
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Prospecting campaigns for mass operations
CREATE TABLE public.prospecting_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  target_type public.prospect_type,
  email_template_subject TEXT,
  email_template_body TEXT,
  created_by UUID REFERENCES public.vybbi_agents(id),
  is_active BOOLEAN DEFAULT true,
  total_sent INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_converted INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vybbi_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospect_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospect_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospecting_campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vybbi_agents
CREATE POLICY "Admins can manage all vybbi agents" ON public.vybbi_agents FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Agents can view their own profile" ON public.vybbi_agents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Agents can update their own profile" ON public.vybbi_agents FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for prospects
CREATE POLICY "Admins can manage all prospects" ON public.prospects FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Agents can view assigned prospects" ON public.prospects FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.vybbi_agents WHERE user_id = auth.uid() AND id = prospects.assigned_agent_id)
);
CREATE POLICY "Agents can update assigned prospects" ON public.prospects FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.vybbi_agents WHERE user_id = auth.uid() AND id = prospects.assigned_agent_id)
);
CREATE POLICY "Agents can create prospects" ON public.prospects FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.vybbi_agents WHERE user_id = auth.uid() AND id = prospects.created_by)
);

-- RLS Policies for prospect_interactions
CREATE POLICY "Admins can manage all interactions" ON public.prospect_interactions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Agents can manage their interactions" ON public.prospect_interactions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.vybbi_agents WHERE user_id = auth.uid() AND id = prospect_interactions.agent_id)
);

-- RLS Policies for prospect_assignments
CREATE POLICY "Admins can manage all assignments" ON public.prospect_assignments FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Agents can view their assignments" ON public.prospect_assignments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.vybbi_agents WHERE user_id = auth.uid() AND id = prospect_assignments.agent_id)
);

-- RLS Policies for conversion_tracking
CREATE POLICY "Admins can manage all conversions" ON public.conversion_tracking FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Agents can view their conversions" ON public.conversion_tracking FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.vybbi_agents WHERE user_id = auth.uid() AND id = conversion_tracking.agent_id)
);

-- RLS Policies for agent_commissions
CREATE POLICY "Admins can manage all commissions" ON public.agent_commissions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Agents can view their commissions" ON public.agent_commissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.vybbi_agents WHERE user_id = auth.uid() AND id = agent_commissions.agent_id)
);

-- RLS Policies for prospecting_campaigns
CREATE POLICY "Admins can manage all campaigns" ON public.prospecting_campaigns FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Agents can view campaigns" ON public.prospecting_campaigns FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.vybbi_agents WHERE user_id = auth.uid())
);

-- Triggers for updated_at
CREATE TRIGGER update_vybbi_agents_updated_at BEFORE UPDATE ON public.vybbi_agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_prospects_updated_at BEFORE UPDATE ON public.prospects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_prospecting_campaigns_updated_at BEFORE UPDATE ON public.prospecting_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_prospects_assigned_agent ON public.prospects(assigned_agent_id);
CREATE INDEX idx_prospects_status ON public.prospects(status);
CREATE INDEX idx_prospects_created_at ON public.prospects(created_at);
CREATE INDEX idx_prospect_interactions_prospect_id ON public.prospect_interactions(prospect_id);
CREATE INDEX idx_prospect_interactions_agent_id ON public.prospect_interactions(agent_id);
CREATE INDEX idx_conversion_tracking_agent_id ON public.conversion_tracking(agent_id);
CREATE INDEX idx_agent_commissions_agent_id ON public.agent_commissions(agent_id);

-- Function to automatically assign prospects to agents based on workload
CREATE OR REPLACE FUNCTION public.assign_prospect_to_agent(prospect_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  selected_agent_id UUID;
BEGIN
  -- Find the agent with the least number of active prospects
  SELECT va.id INTO selected_agent_id
  FROM public.vybbi_agents va
  LEFT JOIN public.prospects p ON p.assigned_agent_id = va.id AND p.status NOT IN ('converted', 'rejected')
  WHERE va.is_active = true
  GROUP BY va.id
  ORDER BY COUNT(p.id) ASC, va.created_at ASC
  LIMIT 1;
  
  IF selected_agent_id IS NOT NULL THEN
    -- Update the prospect
    UPDATE public.prospects 
    SET assigned_agent_id = selected_agent_id, assigned_at = now()
    WHERE id = prospect_id;
    
    -- Create assignment record
    INSERT INTO public.prospect_assignments (prospect_id, agent_id, assigned_by)
    VALUES (prospect_id, selected_agent_id, auth.uid());
    
    -- Update agent stats
    UPDATE public.vybbi_agents 
    SET total_prospects_assigned = total_prospects_assigned + 1
    WHERE id = selected_agent_id;
  END IF;
  
  RETURN selected_agent_id;
END;
$$;