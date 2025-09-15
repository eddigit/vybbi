import { useState, useEffect, useMemo } from 'react';
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = `profile-${slug}`;

  useEffect(() => {
    if (!slug) {
      setProfile(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Check cache first
    const cached = profileCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setProfile(cached.profile);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('id, slug, profile_type, display_name, avatar_url, is_public')
          .eq('slug', slug)
          .eq('is_public', true)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching profile:', fetchError);
          setError('Erreur lors du chargement du profil');
          profileCache.set(cacheKey, { profile: null, timestamp: Date.now() });
          return;
        }

        // Cache the result
        profileCache.set(cacheKey, { profile: data, timestamp: Date.now() });
        setProfile(data);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Erreur inattendue');
        profileCache.set(cacheKey, { profile: null, timestamp: Date.now() });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [slug, cacheKey]);

  return useMemo(() => ({ profile, loading, error }), [profile, loading, error]);
}