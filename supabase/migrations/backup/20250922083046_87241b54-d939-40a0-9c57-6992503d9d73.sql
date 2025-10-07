-- Drop and recreate the get_social_feed function with proper column references
DROP FUNCTION IF EXISTS get_social_feed(uuid, integer, integer, text);

CREATE OR REPLACE FUNCTION get_social_feed(
  user_id_param uuid,
  limit_param integer DEFAULT 10,
  offset_param integer DEFAULT 0,
  feed_type text DEFAULT 'all'
)
RETURNS TABLE (
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
  author_profile_type text,
  likes_count bigint,
  comments_count bigint,
  user_has_liked boolean,
  media_attachments jsonb
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
    SELECT pi.post_id, COUNT(*) as count
    FROM public.post_interactions pi
    WHERE pi.interaction_type = 'like'
    GROUP BY pi.post_id
  ) likes ON likes.post_id = sp.id
  LEFT JOIN (
    SELECT pi.post_id, COUNT(*) as count
    FROM public.post_interactions pi
    WHERE pi.interaction_type = 'comment'
    GROUP BY pi.post_id
  ) comments ON comments.post_id = sp.id
  LEFT JOIN (
    SELECT pi.post_id, true as exists
    FROM public.post_interactions pi
    WHERE pi.interaction_type = 'like' AND pi.user_id = user_id_param
  ) user_like ON user_like.post_id = sp.id
  LEFT JOIN (
    SELECT 
      pm.post_id, 
      jsonb_agg(jsonb_build_object(
        'id', pm.id,
        'media_url', pm.media_url,
        'media_type', pm.media_type,
        'thumbnail_url', pm.thumbnail_url,
        'alt_text', pm.alt_text
      )) as attachments
    FROM public.post_media pm
    GROUP BY pm.post_id
  ) media ON media.post_id = sp.id
  WHERE 
    -- Base visibility rules
    (sp.visibility = 'public' OR
     sp.user_id = user_id_param OR
     (sp.visibility = 'followers' AND EXISTS (
       SELECT 1 FROM public.user_follows uf
       WHERE uf.followed_user_id = sp.user_id AND uf.follower_user_id = user_id_param
     )))
    -- Feed type filtering
    AND (
      CASE 
        WHEN feed_type = 'following' THEN 
          -- Only posts from followed users or own posts
          (sp.user_id = user_id_param OR EXISTS (
            SELECT 1 FROM public.user_follows uf2
            WHERE uf2.followed_user_id = sp.user_id AND uf2.follower_user_id = user_id_param
          ))
        WHEN feed_type = 'discover' THEN
          -- Exclude posts from followed users (discovery feed)
          (sp.user_id != user_id_param AND NOT EXISTS (
            SELECT 1 FROM public.user_follows uf3
            WHERE uf3.followed_user_id = sp.user_id AND uf3.follower_user_id = user_id_param
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
        SELECT 1 FROM public.user_follows uf4
        WHERE uf4.followed_user_id = sp.user_id AND uf4.follower_user_id = user_id_param
      ) THEN 1
      ELSE 2
    END,
    sp.created_at DESC
  LIMIT limit_param OFFSET offset_param;
END;
$$;