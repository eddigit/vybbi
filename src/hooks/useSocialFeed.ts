import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SocialPost, PostMedia } from "@/types/social";

export function useSocialFeed(feedType: 'all' | 'following' | 'discover' = 'all', contentFilter: 'all' | 'prestations' | 'events' | 'annonces' | 'messages' = 'all') {
  const { user } = useAuth();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchPosts = useCallback(async (reset = false) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const currentOffset = reset ? 0 : offset;
      const limit = 10;

      // Add a small delay to prevent rapid successive calls
      await new Promise(resolve => setTimeout(resolve, 100));

      // Call the database function to get the social feed
      const { data, error: fetchError } = await supabase.rpc('get_social_feed', {
        user_id_param: user.id,
        limit_param: limit,
        offset_param: currentOffset,
        feed_type: feedType,
        content_filter: contentFilter
      } as any);

      if (fetchError) {
        throw fetchError;
      }

      const newPosts: SocialPost[] = (data || []).map(post => ({
        ...post,
        updated_at: post.created_at, // Use created_at as fallback for updated_at
        author_profile_id: post.profile_id, // Map profile_id to author_profile_id
        media_attachments: Array.isArray(post.media_attachments) 
          ? (post.media_attachments as unknown) as PostMedia[]
          : []
      }));
      
      if (reset) {
        setPosts(newPosts);
        setOffset(limit);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
        setOffset(prev => prev + limit);
      }

      setHasMore(newPosts.length === limit);
    } catch (err) {
      // Surface clearer Supabase RPC errors to the UI and console
      console.error('Error fetching social feed (RPC get_social_feed):', err);

      let errorMessage = 'Une erreur est survenue';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = String((err as any).message);
      }

      // Additional context for debugging in console (kept out of UI)
      if (typeof err === 'object' && err !== null) {
        const details = (err as any).details || (err as any).hint;
        if (details) console.warn('[get_social_feed] details:', details);
      }

      if (errorMessage.toLowerCase().includes('permission denied') || errorMessage.toLowerCase().includes('not authenticated')) {
        setError('Vous devez être connecté pour voir le feed');
      } else if (
        (errorMessage.toLowerCase().includes('function') && errorMessage.toLowerCase().includes('does not exist')) ||
        errorMessage.toLowerCase().includes('not found')
      ) {
        setError('Erreur de configuration du système (fonction manquante). Veuillez contacter le support.');
      } else if (errorMessage.toLowerCase().includes('structure of query does not match')) {
        setError('Erreur de format des données - veuillez recharger la page');
      } else if (errorMessage.toLowerCase().includes('failed to fetch') || errorMessage.toLowerCase().includes('network')) {
        setError('Problème de connexion - vérifiez votre réseau');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [user, offset, feedType, contentFilter]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPosts(false);
    }
  }, [fetchPosts, loading, hasMore]);

  const refreshFeed = useCallback(() => {
    setOffset(0);
    fetchPosts(true);
  }, [fetchPosts]);

  // Subscribe to real-time updates with debouncing
  useEffect(() => {
    if (!user) return;

    // Reset state when feed type or filter changes
    setPosts([]);
    setOffset(0);
    setError(null);

    // Debounced initial load
    const timeoutId = setTimeout(() => {
      refreshFeed();
    }, 200);

    // Subscribe to new posts with debouncing
    const channel = supabase
      .channel(`social_posts_changes_${feedType}_${contentFilter}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'social_posts'
        },
        () => {
          // Debounce refresh to prevent too many calls
          setTimeout(() => refreshFeed(), 1000);
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
          // Debounce refresh to prevent too many calls
          setTimeout(() => refreshFeed(), 1500);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [user, feedType, contentFilter]);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refreshFeed
  };
}