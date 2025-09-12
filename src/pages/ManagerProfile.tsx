import { useParams } from 'react-router-dom';
import { useProfileResolver, generateProfileStructuredData, getProfileUrl } from '@/hooks/useProfileResolver';
import { SEOHead } from '@/components/SEOHead';
import PartnerProfile from './PartnerProfile';

export default function ManagerProfile() {
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
          <h1 className="text-2xl font-bold text-foreground mb-4">Manager non trouvé</h1>
          <p className="text-muted-foreground">
            Ce manager n'existe pas ou n'est pas accessible publiquement.
          </p>
        </div>
      </div>
    );
  }

  if (profile.profile_type !== 'manager') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Type de profil incorrect</h1>
          <p className="text-muted-foreground">
            Ce profil n'est pas un manager.
          </p>
        </div>
      </div>
    );
  }

  const canonicalUrl = `${window.location.origin}${getProfileUrl(profile)}`;
  const description = profile.bio 
    ? `${profile.display_name} - ${profile.bio.slice(0, 155)}...`
    : `Découvrez le profil de ${profile.display_name}, manager artistique ${profile.location ? `basé à ${profile.location}` : ''} sur Vybbi.`;

  return (
    <>
      <SEOHead
        title={`${profile.display_name} - Manager Artistique`}
        description={description}
        canonicalUrl={canonicalUrl}
        ogImage={profile.avatar_url || undefined}
        structuredData={generateProfileStructuredData(profile)}
      />
      <PartnerProfile />
    </>
  );
}