import { useParams } from 'react-router-dom';
import { useProfileResolver, generateProfileStructuredData, getProfileUrl } from '@/hooks/useProfileResolver';
import { SEOHead } from '@/components/SEOHead';
import VenueProfile from './VenueProfile';

export default function LieuProfile() {
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
          <h1 className="text-2xl font-bold text-foreground mb-4">Lieu non trouvé</h1>
          <p className="text-muted-foreground">
            Ce lieu n'existe pas ou n'est pas accessible publiquement.
          </p>
        </div>
      </div>
    );
  }

  if (profile.profile_type !== 'lieu') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Type de profil incorrect</h1>
          <p className="text-muted-foreground">
            Ce profil n'est pas un lieu.
          </p>
        </div>
      </div>
    );
  }

  const canonicalUrl = `${window.location.origin}${getProfileUrl(profile)}`;
  const description = profile.bio 
    ? `${profile.display_name} - ${profile.bio.slice(0, 155)}...`
    : `Découvrez ${profile.display_name}, ${profile.venue_category || 'lieu de spectacle'} ${profile.location ? `à ${profile.location}` : ''} sur Vybbi.`;

  return (
    <>
      <SEOHead
        title={`${profile.display_name} - ${profile.venue_category || 'Lieu de spectacle'}`}
        description={description}
        canonicalUrl={canonicalUrl}
        ogImage={profile.avatar_url || undefined}
        structuredData={generateProfileStructuredData(profile)}
      />
      <VenueProfile />
    </>
  );
}