import { useParams } from 'react-router-dom';
import { useProfileResolverOptimized } from '@/hooks/useProfileResolverOptimized';
import PartnerProfile from './PartnerProfile';

export default function PartnerProfileBySlug() {
  const { slug } = useParams<{ slug: string }>();
  const { profile, loading, error } = useProfileResolverOptimized(slug);

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
          <h1 className="text-2xl font-bold text-foreground mb-4">Partenaire non trouvé</h1>
          <p className="text-muted-foreground">
            Ce profil n'existe pas ou n'est pas accessible publiquement.
          </p>
        </div>
      </div>
    );
  }

  if (profile.profile_type !== 'agent' && profile.profile_type !== 'manager') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Profil invalide</h1>
          <p className="text-muted-foreground">
            Ce profil n'est pas un agent ou un manager.
          </p>
        </div>
      </div>
    );
  }

  // Render the partner profile directly with the resolved profile ID
  return <PartnerProfile partnerId={profile.id} />;
}
