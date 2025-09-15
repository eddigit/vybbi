import { useParams } from 'react-router-dom';
import { useProfileResolver, generateProfileStructuredData, getProfileUrl, ResolvedProfile } from '@/hooks/useProfileResolver';
import { SEOHead } from '@/components/SEOHead';
import ArtistProfile from './ArtistProfile';
import { Profile, ProfileType } from '@/lib/types';

// Convert ResolvedProfile to Profile with proper typing
const convertResolvedProfile = (resolvedProfile: ResolvedProfile): Profile => {
  return {
    ...resolvedProfile,
    profile_type: resolvedProfile.profile_type as ProfileType
  };
};

export default function ArtisteProfile() {
  const { slug } = useParams<{ slug: string }>();
  const { profile, loading, error } = useProfileResolver(slug);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Artiste non trouvé</h1>
          <p className="text-muted-foreground">
            Cet artiste n'existe pas ou n'est pas accessible publiquement.
          </p>
        </div>
      </div>
    );
  }

  if (profile.profile_type !== 'artist') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Type de profil incorrect</h1>
          <p className="text-muted-foreground">
            Ce profil n'est pas un artiste.
          </p>
        </div>
      </div>
    );
  }

  const canonicalUrl = `${window.location.origin}${getProfileUrl(profile)}`;
  const description = profile.bio 
    ? `${profile.display_name} - ${profile.bio.slice(0, 155)}...`
    : `Découvrez le profil de ${profile.display_name}, artiste ${profile.genres?.join(', ') || ''} ${profile.location ? `basé à ${profile.location}` : ''} sur Vybbi.`;

  return (
    <>
      <SEOHead
        title={`${profile.display_name} - Artiste ${profile.genres?.join(' · ') || ''}`}
        description={description}
        canonicalUrl={canonicalUrl}
        ogImage={profile.avatar_url || undefined}
        structuredData={generateProfileStructuredData(profile)}
      />
      <ArtistProfile resolvedProfile={convertResolvedProfile(profile)} />
    </>
  );
}