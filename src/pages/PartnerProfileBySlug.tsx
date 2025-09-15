import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProfileResolver } from '@/hooks/useProfileResolver';

export default function PartnerProfileBySlug() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { profile, loading, error } = useProfileResolver(slug);

  useEffect(() => {
    if (profile?.id) {
      navigate(`/partners/${profile.id}`, { replace: true });
    }
  }, [profile?.id, navigate]);

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

  // Une fois le profil résolu, on redirige; ce rendu ne devrait pas s'afficher
  return null;
}
