import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useProfileTracking } from './useProfileTracking';

export interface ResolvedProfile {
  id: string;
  user_id: string;
  display_name: string;
  profile_type: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  city: string | null;
  genres: string[] | null;
  talents: string[] | null;
  languages: string[] | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  instagram_url: string | null;
  spotify_url: string | null;
  soundcloud_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  experience: string | null;
  is_public: boolean;
  slug: string | null;
  header_url: string | null;
  header_position_y: number | null;
  venue_category: string | null;
  venue_capacity: number | null;
  accepts_direct_contact: boolean | null;
  preferred_contact_profile_id: string | null;
  created_at: string;
  updated_at: string;
  is_slug_match: boolean;
}

export const useProfileResolver = (identifier: string | undefined) => {
  const [profile, setProfile] = useState<ResolvedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Track profile view when successfully loaded
  useProfileTracking(
    profile?.id, 
    'full_profile',
    window.location.pathname
  );

  useEffect(() => {
    if (!identifier) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .rpc('resolve_profile', { identifier })
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          setError('Profile not found');
          setProfile(null);
          return;
        }

        setProfile(data);

        // If we resolved by ID (UUID), redirect to the slug URL
        if (!data.is_slug_match && data.slug) {
          const pathSegments = window.location.pathname.split('/');
          if (pathSegments.length >= 2) {
            const basePath = pathSegments[1]; // 'artistes', 'lieux', etc.
            navigate(`/${basePath}/${data.slug}`, { replace: true });
          }
        }
      } catch (err) {
        console.error('Error resolving profile:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [identifier, navigate]);

  return { profile, loading, error };
};

// Utility function to generate profile URL by type
export const getProfileUrl = (profile: { profile_type: string; slug?: string; id?: string }) => {
  const identifier = profile.slug || profile.id;
  
  switch (profile.profile_type) {
    case 'artist':
      return `/artistes/${identifier}`;
    case 'agent':
    case 'manager':
    case 'academie':
    case 'sponsors':
    case 'media':
    case 'influenceur':
    case 'agence':
      return `/partners/${identifier}`;
    case 'lieu':
      return `/lieux/${identifier}`;
    default:
      return `/profiles/${identifier}`;
  }
};

// SEO utility for generating structured data
export const generateProfileStructuredData = (profile: ResolvedProfile) => {
  const baseData = {
    "@context": "https://schema.org",
    "@type": profile.profile_type === 'artist' ? "MusicGroup" : 
              profile.profile_type === 'lieu' ? "MusicVenue" : "Organization",
    "name": profile.display_name,
    "description": profile.bio,
    "url": `${window.location.origin}${getProfileUrl(profile)}`,
  };

  if (profile.avatar_url) {
    baseData["image"] = profile.avatar_url;
  }

  if (profile.location) {
    baseData["address"] = {
      "@type": "PostalAddress",
      "addressLocality": profile.city || profile.location
    };
  }

  if (profile.profile_type === 'artist' && profile.genres) {
    baseData["genre"] = profile.genres;
  }

  if (profile.website) {
    baseData["sameAs"] = [profile.website];
    
    const socialUrls = [
      profile.instagram_url,
      profile.spotify_url,
      profile.soundcloud_url,
      profile.youtube_url,
      profile.tiktok_url
    ].filter(Boolean);
    
    if (socialUrls.length > 0) {
      baseData["sameAs"] = baseData["sameAs"].concat(socialUrls);
    }
  }

  return baseData;
};