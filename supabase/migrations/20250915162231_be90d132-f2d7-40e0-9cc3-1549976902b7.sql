-- Create admin_mock_profiles table for generated mock profiles (corrected)
CREATE TABLE public.admin_mock_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_type TEXT NOT NULL CHECK (profile_type IN ('artist', 'lieu', 'agent', 'manager')),
  is_mock BOOLEAN DEFAULT true,
  ai_generated_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_mock_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies - only accessible by admins using has_role function
CREATE POLICY "Admin mock profiles visible to admins" 
ON public.admin_mock_profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin mock profiles manageable by admins" 
ON public.admin_mock_profiles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add index for better performance
CREATE INDEX idx_admin_mock_profiles_type ON public.admin_mock_profiles(profile_type);
CREATE INDEX idx_admin_mock_profiles_is_mock ON public.admin_mock_profiles(is_mock);

-- Add trigger for updated_at
CREATE TRIGGER update_admin_mock_profiles_updated_at
BEFORE UPDATE ON public.admin_mock_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();