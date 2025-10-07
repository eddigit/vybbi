-- Create event_attendees table for RSVP functionality
CREATE TABLE public.event_attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('attending', 'not_attending')) DEFAULT 'attending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Add flyer fields to events table
ALTER TABLE public.events 
ADD COLUMN flyer_url TEXT,
ADD COLUMN flyer_position_y INTEGER DEFAULT 50;

-- Enable RLS
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_attendees
CREATE POLICY "Anyone can view event attendees for published events" 
ON public.event_attendees 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.events e 
    WHERE e.id = event_attendees.event_id 
    AND e.status = 'published'
  )
);

CREATE POLICY "Users can manage their own attendance" 
ON public.event_attendees 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Event owners can view attendees" 
ON public.event_attendees 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.events e 
    JOIN public.profiles p ON p.id = e.venue_profile_id
    WHERE e.id = event_attendees.event_id 
    AND p.user_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_event_attendees_updated_at
  BEFORE UPDATE ON public.event_attendees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get event attendees count
CREATE OR REPLACE FUNCTION public.get_event_attendees_count(event_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attendees_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO attendees_count
  FROM public.event_attendees
  WHERE event_id = event_uuid AND status = 'attending';
  
  RETURN COALESCE(attendees_count, 0);
END;
$$;

-- Function to get user attendance status for an event
CREATE OR REPLACE FUNCTION public.get_user_event_status(event_uuid UUID, user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_status TEXT;
BEGIN
  SELECT status INTO user_status
  FROM public.event_attendees
  WHERE event_id = event_uuid AND user_id = user_uuid;
  
  RETURN user_status;
END;
$$;