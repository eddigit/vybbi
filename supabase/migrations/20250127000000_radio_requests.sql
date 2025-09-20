-- Create radio requests system for real-time music requests

-- Table for user music requests
CREATE TABLE public.radio_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_asset_id UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
  music_release_id UUID REFERENCES public.music_releases(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'queued', 'playing', 'played', 'rejected')),
  priority INTEGER NOT NULL DEFAULT 1, -- Higher number = higher priority
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  queued_at TIMESTAMP WITH TIME ZONE,
  played_at TIMESTAMP WITH TIME ZONE,
  message TEXT, -- Optional message from user
  votes_count INTEGER NOT NULL DEFAULT 0, -- Community voting
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for request votes (community can vote for requests)
CREATE TABLE public.radio_request_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.radio_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(request_id, user_id)
);

-- Table for radio queue management
CREATE TABLE public.radio_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.radio_requests(id) ON DELETE CASCADE,
  media_asset_id UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  estimated_play_time TIMESTAMP WITH TIME ZONE,
  is_priority BOOLEAN NOT NULL DEFAULT false,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(position)
);

-- Enable RLS
ALTER TABLE public.radio_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radio_request_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radio_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for radio_requests
CREATE POLICY "Users can view all requests" ON public.radio_requests
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "Users can create their own requests" ON public.radio_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests" ON public.radio_requests
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all requests" ON public.radio_requests
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for radio_request_votes
CREATE POLICY "Users can view all votes" ON public.radio_request_votes
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "Users can manage their own votes" ON public.radio_request_votes
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for radio_queue
CREATE POLICY "Everyone can view queue" ON public.radio_queue
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can manage queue" ON public.radio_queue
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_radio_requests_status ON public.radio_requests(status);
CREATE INDEX idx_radio_requests_user_id ON public.radio_requests(user_id);
CREATE INDEX idx_radio_requests_priority ON public.radio_requests(priority DESC);
CREATE INDEX idx_radio_requests_requested_at ON public.radio_requests(requested_at);
CREATE INDEX idx_radio_queue_position ON public.radio_queue(position);
CREATE INDEX idx_radio_request_votes_request_id ON public.radio_request_votes(request_id);

-- Trigger for updated_at
CREATE TRIGGER update_radio_requests_updated_at
  BEFORE UPDATE ON public.radio_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update votes count
CREATE OR REPLACE FUNCTION public.update_request_votes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.radio_requests 
    SET votes_count = votes_count + CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END
    WHERE id = NEW.request_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.radio_requests 
    SET votes_count = votes_count - CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE -1 END
    WHERE id = OLD.request_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.radio_requests 
    SET votes_count = votes_count + 
      CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END -
      CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE -1 END
    WHERE id = NEW.request_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for votes count
CREATE TRIGGER update_request_votes_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.radio_request_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_request_votes_count();

-- Function to get current radio queue
CREATE OR REPLACE FUNCTION public.get_radio_queue()
RETURNS TABLE(
  queue_id UUID,
  request_id UUID,
  media_asset_id UUID,
  position INTEGER,
  estimated_play_time TIMESTAMP WITH TIME ZONE,
  is_priority BOOLEAN,
  file_url TEXT,
  file_name TEXT,
  artist_name TEXT,
  artist_avatar TEXT,
  artist_profile_id UUID,
  requester_name TEXT,
  votes_count INTEGER,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rq.id as queue_id,
    rr.id as request_id,
    ma.id as media_asset_id,
    rq.position,
    rq.estimated_play_time,
    rq.is_priority,
    ma.file_url,
    ma.file_name,
    artist_p.display_name as artist_name,
    artist_p.avatar_url as artist_avatar,
    artist_p.id as artist_profile_id,
    requester_p.display_name as requester_name,
    rr.votes_count,
    rr.message
  FROM radio_queue rq
  LEFT JOIN radio_requests rr ON rr.id = rq.request_id
  JOIN media_assets ma ON ma.id = rq.media_asset_id
  JOIN profiles artist_p ON artist_p.id = ma.profile_id
  LEFT JOIN profiles requester_p ON requester_p.user_id = rr.user_id
  WHERE ma.media_type = 'audio'
    AND artist_p.is_public = true
  ORDER BY rq.position ASC;
END;
$$;

-- Function to add request to queue
CREATE OR REPLACE FUNCTION public.add_request_to_queue(
  p_request_id UUID,
  p_is_priority BOOLEAN DEFAULT false
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_media_asset_id UUID;
  v_next_position INTEGER;
BEGIN
  -- Get media asset from request
  SELECT media_asset_id INTO v_media_asset_id
  FROM radio_requests
  WHERE id = p_request_id AND status = 'pending';
  
  IF v_media_asset_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get next position
  SELECT COALESCE(MAX(position), 0) + 1 INTO v_next_position
  FROM radio_queue;
  
  -- Add to queue
  INSERT INTO radio_queue (request_id, media_asset_id, position, is_priority)
  VALUES (p_request_id, v_media_asset_id, v_next_position, p_is_priority);
  
  -- Update request status
  UPDATE radio_requests 
  SET status = 'queued', queued_at = now()
  WHERE id = p_request_id;
  
  RETURN true;
END;
$$;