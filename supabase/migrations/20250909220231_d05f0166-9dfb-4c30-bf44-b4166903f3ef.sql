-- Create enums for event and booking status
CREATE TYPE public.event_status AS ENUM ('draft', 'published', 'cancelled');
CREATE TYPE public.booking_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_profile_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  location TEXT,
  genres TEXT[],
  budget_min INTEGER,
  budget_max INTEGER,
  status event_status NOT NULL DEFAULT 'draft',
  image_url TEXT,
  image_position_y INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  artist_profile_id UUID NOT NULL,
  venue_profile_id UUID NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  message TEXT,
  proposed_fee INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add event_id column to annonces table
ALTER TABLE public.annonces ADD COLUMN event_id UUID;

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS policies for events
CREATE POLICY "Published events are viewable by everyone" 
ON public.events 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Venues can create their own events" 
ON public.events 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.id = events.venue_profile_id 
    AND p.user_id = auth.uid() 
    AND p.profile_type = 'lieu'
));

CREATE POLICY "Venues can update their own events" 
ON public.events 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.id = events.venue_profile_id 
    AND p.user_id = auth.uid() 
    AND p.profile_type = 'lieu'
));

CREATE POLICY "Venues can view their own events" 
ON public.events 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.id = events.venue_profile_id 
    AND p.user_id = auth.uid() 
    AND p.profile_type = 'lieu'
));

CREATE POLICY "Venues can delete their own events" 
ON public.events 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.id = events.venue_profile_id 
    AND p.user_id = auth.uid() 
    AND p.profile_type = 'lieu'
));

-- RLS policies for bookings
CREATE POLICY "Artists can create bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.id = bookings.artist_profile_id 
    AND p.user_id = auth.uid() 
    AND p.profile_type = 'artist'
));

CREATE POLICY "Artists can view their own bookings" 
ON public.bookings 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.id = bookings.artist_profile_id 
    AND p.user_id = auth.uid() 
    AND p.profile_type = 'artist'
));

CREATE POLICY "Venues can view bookings for their events" 
ON public.bookings 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.id = bookings.venue_profile_id 
    AND p.user_id = auth.uid() 
    AND p.profile_type = 'lieu'
));

CREATE POLICY "Venues can update booking status" 
ON public.bookings 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.id = bookings.venue_profile_id 
    AND p.user_id = auth.uid() 
    AND p.profile_type = 'lieu'
));

-- Create triggers for updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();