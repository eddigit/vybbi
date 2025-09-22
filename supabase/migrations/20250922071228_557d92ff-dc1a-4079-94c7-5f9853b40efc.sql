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
$function$;