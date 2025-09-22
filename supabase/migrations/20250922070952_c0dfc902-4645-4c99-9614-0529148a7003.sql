-- Enhance get_social_feed function to support following-based feeds
CREATE OR REPLACE FUNCTION public.get_social_feed(
  user_id_param uuid, 
  limit_param integer DEFAULT 20, 
  offset_param integer DEFAULT 0,
  feed_type text DEFAULT 'all'
)
RETURNS TABLE(
  id uuid, 
  user_id uuid, 
  profile_id uuid, 
  content text, 
  post_type text, 
  visibility text, 
  related_id uuid, 
  created_at timestamp with time zone, 
  author_display_name text, 
  author_avatar_url text, 
  author_profile_type profile_type, 
  likes_count bigint, 
  comments_count bigint, 
  user_has_liked boolean, 
  media_attachments jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    WHERE interaction_type = 'like' AND post_interactions.user_id = user_id_param
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
    -- Base visibility rules
    (sp.visibility = 'public' OR
     sp.user_id = user_id_param OR
     (sp.visibility = 'followers' AND EXISTS (
       SELECT 1 FROM public.user_follows 
       WHERE followed_user_id = sp.user_id AND follower_user_id = user_id_param
     )))
    -- Feed type filtering
    AND (
      CASE 
        WHEN feed_type = 'following' THEN 
          -- Only posts from followed users or own posts
          (sp.user_id = user_id_param OR EXISTS (
            SELECT 1 FROM public.user_follows 
            WHERE followed_user_id = sp.user_id AND follower_user_id = user_id_param
          ))
        WHEN feed_type = 'discover' THEN
          -- Exclude posts from followed users (discovery feed)
          (sp.user_id != user_id_param AND NOT EXISTS (
            SELECT 1 FROM public.user_follows 
            WHERE followed_user_id = sp.user_id AND follower_user_id = user_id_param
          ))
        ELSE 
          -- 'all' - show everything according to visibility rules
          true
      END
    )
  ORDER BY 
    -- Prioritize followed users' posts if showing all
    CASE 
      WHEN feed_type = 'all' AND EXISTS (
        SELECT 1 FROM public.user_follows 
        WHERE followed_user_id = sp.user_id AND follower_user_id = user_id_param
      ) THEN 1
      ELSE 2
    END,
    sp.created_at DESC
  LIMIT limit_param OFFSET offset_param;
END;
$function$

-- Create function to get user following statistics
CREATE OR REPLACE FUNCTION public.get_user_follow_stats(user_id_param uuid)
RETURNS TABLE(following_count bigint, followers_count bigint)
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.user_follows WHERE follower_user_id = user_id_param) as following_count,
    (SELECT COUNT(*) FROM public.user_follows WHERE followed_user_id = user_id_param) as followers_count;
END;
$function$