-- Create system configuration table for managing promotional offers
CREATE TABLE public.system_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Only admins can view and modify system config
CREATE POLICY "Only admins can view system config" 
ON public.system_config 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Only admins can update system config" 
ON public.system_config 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Only admins can insert system config" 
ON public.system_config 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_system_config_updated_at
  BEFORE UPDATE ON public.system_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial promotional offer configuration
INSERT INTO public.system_config (config_key, config_value, description) VALUES 
(
  'promotional_trial', 
  '{"days": 30, "active": true, "end_date": "2026-01-31T00:00:00Z"}',
  'Configuration for promotional trial period - will be automatically updated on January 31st, 2026'
);

-- Insert general trial configuration for fallback
INSERT INTO public.system_config (config_key, config_value, description) VALUES 
(
  'standard_trial', 
  '{"days": 7, "active": true}',
  'Standard trial period configuration (used after promotional period ends)'
);