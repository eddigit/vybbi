-- Create profile_views table for tracking profile visits
CREATE TABLE IF NOT EXISTS public.profile_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  viewed_profile_id UUID NOT NULL,
  viewer_user_id UUID,
  viewer_profile_id UUID,
  view_type view_type DEFAULT 'full_profile'::view_type,
  referrer_page TEXT,
  session_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_profile ON public.profile_views(viewed_profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer_user ON public.profile_views(viewer_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_session ON public.profile_views(session_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_created_at ON public.profile_views(created_at);

-- Enable RLS
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Profile owners can view their analytics"
ON public.profile_views FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = profile_views.viewed_profile_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can insert profile views for tracking"
ON public.profile_views FOR INSERT
WITH CHECK (true);

-- Create or update the track_profile_view function
CREATE OR REPLACE FUNCTION public.track_profile_view(
  p_viewed_profile_id UUID,
  p_view_type view_type DEFAULT 'full_profile'::view_type,
  p_referrer_page TEXT DEFAULT NULL,
  p_session_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  viewer_profile_id UUID;
  new_session_id UUID;
  view_id UUID;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  -- Exit if no user or user is viewing their own profile
  IF current_user_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Check if user is viewing their own profile
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = p_viewed_profile_id AND user_id = current_user_id
  ) THEN
    RETURN NULL;
  END IF;
  
  -- Get viewer's profile
  SELECT id INTO viewer_profile_id 
  FROM public.profiles 
  WHERE user_id = current_user_id;
  
  -- Use provided session_id or generate new one
  new_session_id := COALESCE(p_session_id, gen_random_uuid());
  
  -- Check if view already exists for this session and profile (prevent duplicates within same session)
  IF EXISTS (
    SELECT 1 FROM public.profile_views
    WHERE viewed_profile_id = p_viewed_profile_id 
    AND viewer_user_id = current_user_id 
    AND session_id = new_session_id
    AND created_at > NOW() - INTERVAL '1 hour'
  ) THEN
    RETURN new_session_id;
  END IF;
  
  -- Insert view
  INSERT INTO public.profile_views (
    viewed_profile_id,
    viewer_user_id,
    viewer_profile_id,
    view_type,
    referrer_page,
    session_id
  ) VALUES (
    p_viewed_profile_id,
    current_user_id,
    viewer_profile_id,
    p_view_type,
    p_referrer_page,
    new_session_id
  )
  RETURNING id INTO view_id;
  
  RETURN COALESCE(view_id, new_session_id);
END;
$$;

-- Create or update the get_profile_view_stats function
CREATE OR REPLACE FUNCTION public.get_profile_view_stats(p_profile_id UUID)
RETURNS TABLE(
  total_views BIGINT,
  views_this_week BIGINT,
  views_this_month BIGINT,
  unique_visitors BIGINT,
  agent_views BIGINT,
  manager_views BIGINT,
  venue_views BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_views,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as views_this_week,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as views_this_month,
    COUNT(DISTINCT viewer_user_id) as unique_visitors,
    COUNT(*) FILTER (WHERE EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = pv.viewer_profile_id AND p.profile_type = 'agent'
    )) as agent_views,
    COUNT(*) FILTER (WHERE EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = pv.viewer_profile_id AND p.profile_type = 'manager'
    )) as manager_views,
    COUNT(*) FILTER (WHERE EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = pv.viewer_profile_id AND p.profile_type = 'lieu'
    )) as venue_views
  FROM public.profile_views pv
  WHERE pv.viewed_profile_id = p_profile_id;
END;
$$;