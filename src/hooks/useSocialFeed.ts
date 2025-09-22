import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SocialPost, PostMedia } from "@/types/social";

export function useSocialFeed(feedType: 'all' | 'following' | 'discover' = 'all') {
  const { user } = useAuth();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchPosts = useCallback(async (reset = false) => {
    if (!user) {
      console.log('🔍 [SocialFeed] No user found, skipping fetch');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const currentOffset = reset ? 0 : offset;
      const limit = 10;

      console.log('🔍 [SocialFeed] Fetching posts:', {
        userId: user.id,
        feedType,
        currentOffset,
        limit
      });

      // Call the database function to get the social feed
      const { data, error: fetchError } = await supabase.rpc('get_social_feed', {
        user_id_param: user.id,
        limit_param: limit,
        offset_param: currentOffset,
        feed_type: feedType
      });

      console.log('🔍 [SocialFeed] RPC Response:', {
        dataLength: data?.length || 0,
        error: fetchError,
        rawData: data
      });

      if (fetchError) {
        console.error('🔍 [SocialFeed] RPC Error:', fetchError);
        throw fetchError;
      }

      // Process the posts
      const newPosts: SocialPost[] = (data || []).map((post, index) => {
        console.log(`🔍 [SocialFeed] Processing post ${index}:`, post);
        
        return {
          ...post,
          updated_at: post.created_at, // Use created_at as fallback for updated_at
          author_profile_id: post.profile_id, // Map profile_id to author_profile_id
          media_attachments: Array.isArray(post.media_attachments) 
            ? (post.media_attachments as unknown) as PostMedia[]
            : []
        };
      });

      console.log('🔍 [SocialFeed] Processed posts:', newPosts.length);
      
      if (reset) {
        setPosts(newPosts);
        setOffset(limit);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
        setOffset(prev => prev + limit);
      }

      setHasMore(newPosts.length === limit);
    } catch (err) {
      console.error('🔍 [SocialFeed] Error details:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        user: user?.id,
        feedType
      });
      
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      
      if (errorMessage.includes('permission denied') || errorMessage.includes('not authenticated')) {
        setError('Vous devez être connecté pour voir le feed');
      } else if (errorMessage.includes('function') && errorMessage.includes('does not exist')) {
        setError('Erreur de configuration du système - contactez le support');
      } else if (errorMessage.includes('structure of query does not match')) {
        setError('Erreur de format des données - veuillez recharger la page');
      } else {
        setError(`Erreur lors du chargement: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  }, [user, offset, feedType]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPosts(false);
    }
  }, [fetchPosts, loading, hasMore]);

  const refreshFeed = useCallback(() => {
    setOffset(0);
    fetchPosts(true);
  }, [fetchPosts]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    // Initial load
    refreshFeed();

    // Subscribe to new posts
    const channel = supabase
      .channel('social_posts_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'social_posts'
        },
        () => {
          // Refresh feed when new post is added
          refreshFeed();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'post_interactions'
        },
        () => {
          // Refresh to update interaction counts
          refreshFeed();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refreshFeed, feedType]);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refreshFeed
  };
}