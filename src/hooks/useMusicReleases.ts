import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MusicRelease {
  id: string;
  profile_id: string;
  title: string;
  artist_name: string;
  album_name?: string;
  cover_image_url?: string;
  release_date?: string;
  duration_seconds?: number;
  genre?: string;
  label?: string;
  copyright_owner?: string;
  isrc_code?: string;
  distribution_service?: string;
  spotify_url?: string;
  apple_music_url?: string;
  soundcloud_url?: string;
  youtube_url?: string;
  royalty_percentage: number;
  is_original_composition: boolean;
  featured_artists: any[] | any;
  credits: any;
  lyrics?: string;
  bpm?: number;
  key_signature?: string;
  explicit_content: boolean;
  plays_count: number;
  likes_count: number;
  status: 'draft' | 'published' | 'private';
  created_at: string;
  updated_at: string;
}

export interface MusicCollaborator {
  id: string;
  music_release_id: string;
  collaborator_profile_id?: string;
  collaborator_name: string;
  role: string;
  royalty_percentage: number;
  created_at: string;
}

export interface MusicPlay {
  id: string;
  music_release_id: string;
  user_id?: string;
  played_at: string;
  duration_played: number;
  source?: string;
}

// Hook to fetch music releases for a profile
export const useMusicReleases = (profileId?: string, status?: 'published' | 'all') => {
  return useQuery({
    queryKey: ['music-releases', profileId, status],
    queryFn: async () => {
      if (!profileId) return [];

      let query = supabase
        .from('music_releases')
        .select(`
          *,
          music_collaborators (
            id,
            collaborator_name,
            role,
            royalty_percentage
          ),
          media_assets (
            id,
            file_url,
            file_name,
            media_type,
            preview_url,
            duration_seconds
          )
        `)
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

      if (status === 'published') {
        query = query.eq('status', 'published');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching music releases:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to fetch a single music release
export const useMusicRelease = (releaseId?: string) => {
  return useQuery({
    queryKey: ['music-release', releaseId],
    queryFn: async () => {
      if (!releaseId) return null;

      const { data, error } = await supabase
        .from('music_releases')
        .select(`
          *,
          music_collaborators (
            id,
            collaborator_profile_id,
            collaborator_name,
            role,
            royalty_percentage
          ),
          media_assets (
            id,
            file_url,
            file_name,
            media_type,
            preview_url,
            duration_seconds
          )
        `)
        .eq('id', releaseId)
        .single();

      if (error) {
        console.error('Error fetching music release:', error);
        throw error;
      }

      return data;
    },
    enabled: !!releaseId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook to track music plays
export const useTrackMusicPlay = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      releaseId, 
      durationPlayed = 0, 
      source = 'profile' 
    }: { 
      releaseId: string; 
      durationPlayed?: number; 
      source?: string; 
    }) => {
      const { data, error } = await supabase.rpc('track_music_play', {
        p_music_release_id: releaseId,
        p_duration_played: durationPlayed,
        p_source: source
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch music releases to update play counts
      queryClient.invalidateQueries({ queryKey: ['music-releases'] });
      queryClient.invalidateQueries({ queryKey: ['music-release', variables.releaseId] });
    },
    onError: (error) => {
      console.error('Error tracking music play:', error);
    }
  });
};

// Hook to delete a music release
export const useDeleteMusicRelease = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (releaseId: string) => {
      // Delete collaborators first
      await supabase
        .from('music_collaborators')
        .delete()
        .eq('music_release_id', releaseId);

      // Delete media assets
      await supabase
        .from('media_assets')
        .delete()
        .eq('music_release_id', releaseId);

      // Delete music plays
      await supabase
        .from('music_plays')
        .delete()
        .eq('music_release_id', releaseId);

      // Finally delete the release
      const { error } = await supabase
        .from('music_releases')
        .delete()
        .eq('id', releaseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['music-releases'] });
      toast({
        title: "Succès",
        description: "La sortie musicale a été supprimée avec succès."
      });
    },
    onError: (error) => {
      console.error('Error deleting music release:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression.",
        variant: "destructive"
      });
    }
  });
};

// Hook to update music release
export const useUpdateMusicRelease = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      releaseId, 
      data 
    }: { 
      releaseId: string; 
      data: Partial<MusicRelease> 
    }) => {
      const { error } = await supabase
        .from('music_releases')
        .update(data)
        .eq('id', releaseId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['music-releases'] });
      queryClient.invalidateQueries({ queryKey: ['music-release', variables.releaseId] });
      toast({
        title: "Succès",
        description: "La sortie musicale a été mise à jour avec succès."
      });
    },
    onError: (error) => {
      console.error('Error updating music release:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour.",
        variant: "destructive"
      });
    }
  });
};

// Hook to get music analytics for a profile
export const useMusicAnalytics = (profileId?: string) => {
  return useQuery({
    queryKey: ['music-analytics', profileId],
    queryFn: async () => {
      if (!profileId) return null;

      const { data, error } = await supabase
        .from('music_releases')
        .select(`
          id,
          title,
          plays_count,
          likes_count,
          music_plays (
            played_at,
            duration_played,
            source
          )
        `)
        .eq('profile_id', profileId)
        .eq('status', 'published');

      if (error) throw error;

      // Calculate analytics
      const totalPlays = data?.reduce((sum, release) => sum + release.plays_count, 0) || 0;
      const totalLikes = data?.reduce((sum, release) => sum + release.likes_count, 0) || 0;
      
      const playsByMonth = data?.reduce((acc: Record<string, number>, release) => {
        release.music_plays?.forEach((play: any) => {
          const month = new Date(play.played_at).toISOString().slice(0, 7);
          acc[month] = (acc[month] || 0) + 1;
        });
        return acc;
      }, {});

      return {
        totalReleases: data?.length || 0,
        totalPlays,
        totalLikes,
        playsByMonth: playsByMonth || {},
        topTracks: data?.sort((a, b) => b.plays_count - a.plays_count).slice(0, 5) || []
      };
    },
    enabled: !!profileId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook to search music releases
export const useSearchMusicReleases = (query?: string, genre?: string) => {
  return useQuery({
    queryKey: ['search-music-releases', query, genre],
    queryFn: async () => {
      if (!query && !genre) return [];

      let supabaseQuery = supabase
        .from('music_releases')
        .select(`
          *,
          profiles (
            display_name,
            avatar_url,
            slug
          )
        `)
        .eq('status', 'published');

      if (query) {
        supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,artist_name.ilike.%${query}%`);
      }

      if (genre) {
        supabaseQuery = supabaseQuery.eq('genre', genre);
      }

      const { data, error } = await supabaseQuery
        .order('plays_count', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: !!query || !!genre,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};