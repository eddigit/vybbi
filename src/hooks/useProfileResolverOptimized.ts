import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  slug: string;
  profile_type: 'artist' | 'agent' | 'manager' | 'lieu' | 'influenceur' | 'academie' | 'sponsors' | 'media' | 'agence';
  display_name: string;
  avatar_url?: string;
  is_public: boolean;
}

interface UseProfileResolverResult {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

// Simple cache to avoid repeated API calls
const profileCache = new Map<string, { profile: Profile | null; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useProfileResolverOptimized(slug?: string): UseProfileResolverResult {
  const { data: profile, isLoading: loading, error } = useQuery({
    queryKey: ['profile-resolver', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error: fetchError } = await supabase
        .rpc('get_safe_profile_data', { profile_identifier: slug })
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        throw new Error('Erreur lors du chargement du profil');
      }

      return data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error && typeof error === 'object' && 'status' in error) {
        const status = error.status as number;
        if (status >= 400 && status < 500) return false;
      }
      return failureCount < 2;
    },
  });

  return {
    profile: profile || null,
    loading,
    error: error ? (error as Error).message : null,
  };
}