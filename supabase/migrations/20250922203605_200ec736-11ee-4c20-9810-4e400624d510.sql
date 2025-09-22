-- Create service_requests table for prestations
CREATE TABLE public.service_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_type TEXT NOT NULL CHECK (request_type IN ('offer', 'demand')),
  service_category TEXT NOT NULL CHECK (service_category IN ('performance', 'venue', 'agent', 'other')),
  location TEXT NOT NULL,
  budget_min INTEGER,
  budget_max INTEGER,
  event_date DATE,
  deadline DATE,  
  description TEXT NOT NULL,
  requirements TEXT,
  created_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service_applications table for responses to prestations
CREATE TABLE public.service_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  applicant_user_id UUID NOT NULL,
  applicant_profile_id UUID NOT NULL,
  message TEXT,
  proposed_fee INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_applications ENABLE ROW LEVEL SECURITY;

-- RLS policies for service_requests
CREATE POLICY "Anyone can view active service requests" 
ON public.service_requests 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Users can create their own service requests" 
ON public.service_requests 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own service requests" 
ON public.service_requests 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own service requests" 
ON public.service_requests 
FOR DELETE 
USING (auth.uid() = created_by);

-- RLS policies for service_applications
CREATE POLICY "Service request owners can view applications" 
ON public.service_applications 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.service_requests sr 
  WHERE sr.id = service_applications.service_request_id 
  AND sr.created_by = auth.uid()
));

CREATE POLICY "Applicants can view their own applications"
ON public.service_applications 
FOR SELECT 
USING (auth.uid() = applicant_user_id);

CREATE POLICY "Users can create applications" 
ON public.service_applications 
FOR INSERT 
WITH CHECK (auth.uid() = applicant_user_id);

CREATE POLICY "Service request owners can update application status" 
ON public.service_applications 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.service_requests sr 
  WHERE sr.id = service_applications.service_request_id 
  AND sr.created_by = auth.uid()
));

-- Add updated_at trigger
CREATE TRIGGER update_service_requests_updated_at
  BEFORE UPDATE ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_applications_updated_at
  BEFORE UPDATE ON public.service_applications  
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();