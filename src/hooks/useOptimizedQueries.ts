import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];

/**
 * Optimized hook for fetching profile data with caching
 */
export function useProfileData(profileId?: string) {
  return useQuery({
    queryKey: ['profile', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Optimized hook for fetching events with pagination
 */
export function useEventsData(venueProfileId?: string, limit = 10) {
  return useQuery({
    queryKey: ['events', venueProfileId, limit],
    queryFn: async () => {
      if (!venueProfileId) return [];
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('venue_profile_id', venueProfileId)
        .eq('status', 'published')
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!venueProfileId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Optimized hook for fetching artist reviews
 */
export function useArtistReviews(artistProfileId?: string) {
  return useQuery({
    queryKey: ['reviews', artistProfileId],
    queryFn: async () => {
      if (!artistProfileId) return null;
      
      const { data, error } = await supabase
        .from('detailed_reviews')
        .select(`
          *,
          reviewer:profiles!detailed_reviews_reviewer_id_fkey(display_name, avatar_url)
        `)
        .eq('reviewed_profile_id', artistProfileId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!artistProfileId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Optimized hook for checking user permissions
 */
export function useUserPermissions(userId?: string) {
  return useQuery({
    queryKey: ['user-permissions', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('profile_type, user_id, id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return profile;
    },
    enabled: !!userId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Generic optimized query hook with error handling
 */
export function useOptimizedQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: Partial<UseQueryOptions<T>>
) {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000, // 5 minutes default
    gcTime: 10 * 60 * 1000, // 10 minutes default
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error && typeof error === 'object' && 'status' in error) {
        const status = error.status as number;
        if (status >= 400 && status < 500) return false;
      }
      return failureCount < 2;
    },
    ...options,
  });
}