-- Add new columns to profiles table for venue-specific information
ALTER TABLE public.profiles 
ADD COLUMN venue_category TEXT,
ADD COLUMN venue_capacity INTEGER,
ADD COLUMN city TEXT;

-- Create a table for venue photo galleries
CREATE TABLE public.venue_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_profile_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  image_position_y INTEGER DEFAULT 50,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on venue_gallery
ALTER TABLE public.venue_gallery ENABLE ROW LEVEL SECURITY;

-- RLS policies for venue_gallery
CREATE POLICY "Venue owners can manage their gallery" 
ON public.venue_gallery 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.id = venue_gallery.venue_profile_id 
    AND p.user_id = auth.uid() 
    AND p.profile_type = 'lieu'
));

CREATE POLICY "Gallery images are publicly viewable" 
ON public.venue_gallery 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.id = venue_gallery.venue_profile_id 
    AND p.is_public = true
));

-- Create trigger for updated_at
CREATE TRIGGER update_venue_gallery_updated_at
  BEFORE UPDATE ON public.venue_gallery
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();