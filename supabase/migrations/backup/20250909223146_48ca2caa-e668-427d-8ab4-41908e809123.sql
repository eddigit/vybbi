-- Create table for venue partnerships with agents/managers/bookers
CREATE TABLE public.venue_partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_profile_id UUID NOT NULL,
  partner_profile_id UUID NOT NULL,
  partnership_type TEXT NOT NULL CHECK (partnership_type IN ('agent', 'manager', 'booker', 'tournee')),
  is_visible BOOLEAN NOT NULL DEFAULT true,
  allow_direct_contact BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(venue_profile_id, partner_profile_id)
);

-- Create table for venue artist history (artists who performed at the venue)
CREATE TABLE public.venue_artist_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_profile_id UUID NOT NULL,
  artist_profile_id UUID NOT NULL,
  performance_date DATE,
  event_title TEXT,
  description TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.venue_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_artist_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for venue_partners
CREATE POLICY "Venue owners can manage their partnerships"
ON public.venue_partners
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = venue_partners.venue_profile_id 
    AND p.user_id = auth.uid() 
    AND p.profile_type = 'lieu'
));

CREATE POLICY "Visible partnerships are publicly viewable"
ON public.venue_partners
FOR SELECT
USING (is_visible = true);

CREATE POLICY "Partners can view their partnerships"
ON public.venue_partners
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = venue_partners.partner_profile_id 
    AND p.user_id = auth.uid()
));

-- RLS Policies for venue_artist_history
CREATE POLICY "Venue owners can manage their artist history"
ON public.venue_artist_history
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = venue_artist_history.venue_profile_id 
    AND p.user_id = auth.uid() 
    AND p.profile_type = 'lieu'
));

CREATE POLICY "Visible artist history is publicly viewable"
ON public.venue_artist_history
FOR SELECT
USING (is_visible = true);

CREATE POLICY "Artists can view their own history"
ON public.venue_artist_history
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = venue_artist_history.artist_profile_id 
    AND p.user_id = auth.uid()
));

-- Add triggers for updated_at
CREATE TRIGGER update_venue_partners_updated_at
BEFORE UPDATE ON public.venue_partners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_venue_artist_history_updated_at
BEFORE UPDATE ON public.venue_artist_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();