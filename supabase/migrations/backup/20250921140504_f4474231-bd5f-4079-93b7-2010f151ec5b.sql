-- Create social posts table
CREATE TABLE public.social_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'image', 'video', 'music', 'event', 'annonce'
  visibility TEXT NOT NULL DEFAULT 'public', -- 'public', 'followers', 'private'
  related_id UUID NULL, -- Reference to related content (event, music_release, etc.)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create post media attachments table
CREATE TABLE public.post_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL, -- 'image', 'video', 'audio'
  thumbnail_url TEXT NULL,
  file_size INTEGER NULL,
  duration INTEGER NULL, -- for video/audio in seconds
  alt_text TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create post interactions table
CREATE TABLE public.post_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'like', 'comment', 'share'
  comment_text TEXT NULL, -- for comments
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, interaction_type)
);

-- Create user follows table
CREATE TABLE public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  follower_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  followed_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_user_id, followed_user_id)
);

-- Create user presence table for online status
CREATE TABLE public.user_presence (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_online BOOLEAN NOT NULL DEFAULT false,
  status_message TEXT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social_posts
CREATE POLICY "Users can create their own posts" ON public.social_posts
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view public posts and posts from followed users" ON public.social_posts
FOR SELECT USING (
  visibility = 'public' OR
  auth.uid() = user_id OR
  (visibility = 'followers' AND EXISTS (
    SELECT 1 FROM public.user_follows 
    WHERE followed_user_id = social_posts.user_id 
    AND follower_user_id = auth.uid()
  ))
);

CREATE POLICY "Users can update their own posts" ON public.social_posts
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON public.social_posts
FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for post_media
CREATE POLICY "Users can add media to their posts" ON public.post_media
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.social_posts WHERE id = post_media.post_id AND user_id = auth.uid())
);

CREATE POLICY "Users can view media from visible posts" ON public.post_media
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.social_posts sp 
    WHERE sp.id = post_media.post_id AND (
      sp.visibility = 'public' OR 
      sp.user_id = auth.uid() OR
      (sp.visibility = 'followers' AND EXISTS (
        SELECT 1 FROM public.user_follows 
        WHERE followed_user_id = sp.user_id AND follower_user_id = auth.uid()
      ))
    )
  )
);

-- RLS Policies for post_interactions
CREATE POLICY "Users can interact with visible posts" ON public.post_interactions
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.social_posts sp 
    WHERE sp.id = post_interactions.post_id AND (
      sp.visibility = 'public' OR 
      sp.user_id = auth.uid() OR
      (sp.visibility = 'followers' AND EXISTS (
        SELECT 1 FROM public.user_follows 
        WHERE followed_user_id = sp.user_id AND follower_user_id = auth.uid()
      ))
    )
  )
);

CREATE POLICY "Users can view interactions on visible posts" ON public.post_interactions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.social_posts sp 
    WHERE sp.id = post_interactions.post_id AND (
      sp.visibility = 'public' OR 
      sp.user_id = auth.uid() OR
      (sp.visibility = 'followers' AND EXISTS (
        SELECT 1 FROM public.user_follows 
        WHERE followed_user_id = sp.user_id AND follower_user_id = auth.uid()
      ))
    )
  )
);

CREATE POLICY "Users can delete their own interactions" ON public.post_interactions
FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_follows
CREATE POLICY "Users can follow others" ON public.user_follows
FOR INSERT WITH CHECK (auth.uid() = follower_user_id);

CREATE POLICY "Users can view public follows" ON public.user_follows
FOR SELECT USING (true);

CREATE POLICY "Users can unfollow" ON public.user_follows
FOR DELETE USING (auth.uid() = follower_user_id);

-- RLS Policies for user_presence
CREATE POLICY "Users can update their own presence" ON public.user_presence
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view all presence" ON public.user_presence
FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX idx_social_posts_created_at ON public.social_posts(created_at DESC);
CREATE INDEX idx_social_posts_user_id ON public.social_posts(user_id);
CREATE INDEX idx_post_interactions_post_id ON public.post_interactions(post_id);
CREATE INDEX idx_user_follows_follower ON public.user_follows(follower_user_id);
CREATE INDEX idx_user_follows_followed ON public.user_follows(followed_user_id);
CREATE INDEX idx_user_presence_is_online ON public.user_presence(is_online) WHERE is_online = true;

-- Create function to get social feed
CREATE OR REPLACE FUNCTION public.get_social_feed(user_id_param UUID, limit_param INTEGER DEFAULT 20, offset_param INTEGER DEFAULT 0)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  profile_id UUID,
  content TEXT,
  post_type TEXT,
  visibility TEXT,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  author_display_name TEXT,
  author_avatar_url TEXT,
  author_profile_type profile_type,
  likes_count BIGINT,
  comments_count BIGINT,
  user_has_liked BOOLEAN,
  media_attachments JSONB
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id,
    sp.user_id,
    sp.profile_id,
    sp.content,
    sp.post_type,
    sp.visibility,
    sp.related_id,
    sp.created_at,
    p.display_name as author_display_name,
    p.avatar_url as author_avatar_url,
    p.profile_type as author_profile_type,
    COALESCE(likes.count, 0) as likes_count,
    COALESCE(comments.count, 0) as comments_count,
    COALESCE(user_like.exists, false) as user_has_liked,
    COALESCE(media.attachments, '[]'::jsonb) as media_attachments
  FROM public.social_posts sp
  JOIN public.profiles p ON p.id = sp.profile_id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as count
    FROM public.post_interactions
    WHERE interaction_type = 'like'
    GROUP BY post_id
  ) likes ON likes.post_id = sp.id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as count
    FROM public.post_interactions
    WHERE interaction_type = 'comment'
    GROUP BY post_id
  ) comments ON comments.post_id = sp.id
  LEFT JOIN (
    SELECT post_id, true as exists
    FROM public.post_interactions
    WHERE interaction_type = 'like' AND user_id = user_id_param
  ) user_like ON user_like.post_id = sp.id
  LEFT JOIN (
    SELECT 
      post_id, 
      jsonb_agg(jsonb_build_object(
        'id', id,
        'media_url', media_url,
        'media_type', media_type,
        'thumbnail_url', thumbnail_url,
        'alt_text', alt_text
      )) as attachments
    FROM public.post_media
    GROUP BY post_id
  ) media ON media.post_id = sp.id
  WHERE 
    sp.visibility = 'public' OR
    sp.user_id = user_id_param OR
    (sp.visibility = 'followers' AND EXISTS (
      SELECT 1 FROM public.user_follows 
      WHERE followed_user_id = sp.user_id AND follower_user_id = user_id_param
    ))
  ORDER BY sp.created_at DESC
  LIMIT limit_param OFFSET offset_param;
END;
$$;

-- Create function to get online users
CREATE OR REPLACE FUNCTION public.get_online_users(limit_param INTEGER DEFAULT 20)
RETURNS TABLE(
  user_id UUID,
  profile_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  profile_type profile_type,
  status_message TEXT,
  last_seen_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.user_id,
    up.profile_id,
    p.display_name,
    p.avatar_url,
    p.profile_type,
    up.status_message,
    up.last_seen_at
  FROM public.user_presence up
  JOIN public.profiles p ON p.id = up.profile_id
  WHERE up.is_online = true AND p.is_public = true
  ORDER BY up.last_seen_at DESC
  LIMIT limit_param;
END;
$$;

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON public.social_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_presence_updated_at BEFORE UPDATE ON public.user_presence
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();