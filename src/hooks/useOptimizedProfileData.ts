import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook optimisé pour récupérer les données complètes d'un profil
 */
export function useOptimizedProfileData(profileId?: string) {
  return useQuery({
    queryKey: ['profile-data', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          agent_artists!agent_artists_agent_profile_id_fkey(
            id,
            artist_profile_id,
            representation_status,
            artist_profile:profiles!agent_artists_artist_profile_id_fkey(
              id,
              display_name,
              avatar_url,
              genres
            )
          ),
          manager_artists!manager_artists_manager_profile_id_fkey(
            id,
            artist_profile_id,
            representation_status,
            artist_profile:profiles!manager_artists_artist_profile_id_fkey(
              id,
              display_name,
              avatar_url,
              genres
            )
          )
        `)
        .eq('id', profileId)
        .eq('is_public', true)
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
 * Hook pour précharger les données de profil
 */
export function usePrefetchProfile() {
  const queryClient = useQueryClient();

  const prefetchProfile = (profileId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['profile-data', profileId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .eq('is_public', true)
          .maybeSingle();
        
        if (error) throw error;
        return data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  return { prefetchProfile };
}

/**
 * Hook optimisé pour les statistiques de profil
 */
export function useProfileStats(profileId?: string) {
  return useQuery({
    queryKey: ['profile-stats', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      
      const { data, error } = await supabase.rpc('get_profile_stats', {
        profile_id: profileId
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profileId,
    staleTime: 10 * 60 * 1000, // 10 minutes pour les stats
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook optimisé pour les événements d'un lieu
 */
export function useVenueEvents(venueProfileId?: string, limit = 10) {
  return useQuery({
    queryKey: ['venue-events', venueProfileId, limit],
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
    staleTime: 2 * 60 * 1000, // 2 minutes pour les événements
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook optimisé pour les reviews d'un artiste
 */
export function useArtistReviews(artistProfileId?: string) {
  return useQuery({
    queryKey: ['artist-reviews', artistProfileId],
    queryFn: async () => {
      if (!artistProfileId) return [];
      
      const { data, error } = await supabase
        .from('detailed_reviews')
        .select(`
          *,
          reviewer:profiles!detailed_reviews_reviewer_id_fkey(
            id,
            display_name,
            avatar_url,
            profile_type
          )
        `)
        .eq('reviewed_profile_id', artistProfileId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!artistProfileId,
    staleTime: 10 * 60 * 1000, // 10 minutes pour les reviews
    gcTime: 30 * 60 * 1000,
  });
}