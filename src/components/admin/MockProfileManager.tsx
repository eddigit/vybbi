import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2, RefreshCw, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface MockProfile {
  id: string;
  profile_id: string;
  profile_type: string;
  is_mock: boolean;
  created_at: string;
  profile: {
    display_name: string;
    avatar_url?: string;
    location: string;
    genres?: string[];
  };
}

export default function MockProfileManager() {
  const [mockProfiles, setMockProfiles] = useState<MockProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string[]>([]);

  const fetchMockProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_mock_profiles')
        .select(`
          id,
          profile_id,
          profile_type,
          is_mock,
          created_at,
          profile:profiles(
            display_name,
            avatar_url,
            location,
            genres
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMockProfiles(data || []);
    } catch (error) {
      console.error('Error fetching mock profiles:', error);
      toast.error('Erreur lors du chargement des profils mocks');
    } finally {
      setLoading(false);
    }
  };

  const deleteMockProfile = async (mockId: string, profileId: string) => {
    setDeleting(prev => [...prev, mockId]);
    try {
      // Delete the actual profile (cascade will delete mock record)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId);

      if (error) throw error;
      
      setMockProfiles(prev => prev.filter(mock => mock.id !== mockId));
      toast.success('Profil mock supprimé');
    } catch (error) {
      console.error('Error deleting mock profile:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleting(prev => prev.filter(id => id !== mockId));
    }
  };

  const deleteAllMockProfiles = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer TOUS les profils mocks ? Cette action est irréversible.')) {
      return;
    }

    setLoading(true);
    try {
      const profileIds = mockProfiles.map(mock => mock.profile_id);
      
      const { error } = await supabase
        .from('profiles')
        .delete()
        .in('id', profileIds);

      if (error) throw error;
      
      setMockProfiles([]);
      toast.success('Tous les profils mocks ont été supprimés');
    } catch (error) {
      console.error('Error deleting all mock profiles:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMockProfiles();
  }, []);

  const getProfileTypeColor = (type: string) => {
    switch (type) {
      case 'artist': return 'bg-purple-100 text-purple-800';
      case 'lieu': return 'bg-blue-100 text-blue-800';
      case 'agent': return 'bg-green-100 text-green-800';
      case 'manager': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProfileTypeLabel = (type: string) => {
    switch (type) {
      case 'artist': return 'Artiste';
      case 'lieu': return 'Lieu';
      case 'agent': return 'Agent';
      case 'manager': return 'Manager';
      default: return type;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gestion des Profils Mocks ({mockProfiles.length})</CardTitle>
        <div className="flex gap-2">
          <Button
            onClick={fetchMockProfiles}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          {mockProfiles.length > 0 && (
            <Button
              onClick={deleteAllMockProfiles}
              disabled={loading}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Tout Supprimer
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading && mockProfiles.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Chargement...</p>
          </div>
        ) : mockProfiles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Aucun profil mock trouvé.</p>
            <p className="text-sm">Utilisez le générateur pour créer des profils de démonstration.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mockProfiles.map((mock) => (
              <div key={mock.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={mock.profile.avatar_url} alt={mock.profile.display_name} />
                    <AvatarFallback>
                      {mock.profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{mock.profile.display_name}</p>
                      <Badge className={getProfileTypeColor(mock.profile_type)}>
                        {getProfileTypeLabel(mock.profile_type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      📍 {mock.profile.location}
                      {mock.profile.genres && mock.profile.genres.length > 0 && (
                        <span> • 🎵 {mock.profile.genres.slice(0, 2).join(', ')}</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Créé le {new Date(mock.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => window.open(`/artistes/${mock.profile_id}`, '_blank')}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => deleteMockProfile(mock.id, mock.profile_id)}
                    disabled={deleting.includes(mock.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className={`h-4 w-4 ${deleting.includes(mock.id) ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}