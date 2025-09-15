import { useParams } from 'react-router-dom';
import { useProfileResolver } from '@/hooks/useProfileResolver';
import ArtistProfile from './ArtistProfile';

export default function ArtistProfileBySlug() {
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
          <h1 className="text-2xl font-bold text-foreground mb-4">Profil invalide</h1>
          <p className="text-muted-foreground">
            Ce profil n'est pas un artiste.
          </p>
        </div>
      </div>
    );
  }

  // Convert ResolvedProfile to Profile for ArtistProfile component
  const convertedProfile = {
    ...profile,
    profile_type: profile.profile_type as 'artist'
  };

  // Render the artist profile directly with the resolved profile data
  return <ArtistProfile resolvedProfile={convertedProfile} />;
}