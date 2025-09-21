import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Music, Save, ExternalLink } from 'lucide-react';

interface MusicRelease {
  id: string;
  title: string;
  artist_name: string;
  youtube_url?: string;
  spotify_url?: string;
  soundcloud_url?: string;
  direct_audio_url?: string;
  profile: {
    display_name: string;
  };
}

export function MusicReleaseAudioManager() {
  const [releases, setReleases] = useState<MusicRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReleases = async () => {
    try {
      const { data, error } = await supabase
        .from('music_releases')
        .select(`
          id,
          title,
          artist_name,
          youtube_url,
          spotify_url,
          soundcloud_url,
          direct_audio_url,
          profile:profiles(display_name)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReleases(data || []);
    } catch (error) {
      console.error('Error fetching releases:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les releases musicales",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateDirectAudioUrl = async (releaseId: string, audioUrl: string) => {
    try {
      const { error } = await supabase
        .from('music_releases')
        .update({ direct_audio_url: audioUrl })
        .eq('id', releaseId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "URL audio mise à jour avec succès"
      });

      fetchReleases();
    } catch (error) {
      console.error('Error updating audio URL:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'URL audio",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  if (loading) {
    return <div className="p-4">Chargement des releases musicales...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Music className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Gestion Audio des Releases</h2>
      </div>

      <div className="grid gap-4">
        {releases.map((release) => (
          <Card key={release.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div>
                  <div className="text-lg">{release.title}</div>
                  <div className="text-sm text-muted-foreground">
                    par {release.artist_name || release.profile?.display_name}
                  </div>
                </div>
                {release.direct_audio_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(release.direct_audio_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Liens existants:</label>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {release.youtube_url && (
                    <div>YouTube: {release.youtube_url}</div>
                  )}
                  {release.spotify_url && (
                    <div>Spotify: {release.spotify_url}</div>
                  )}
                  {release.soundcloud_url && (
                    <div>SoundCloud: {release.soundcloud_url}</div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  URL Audio Direct (pour la webradio):
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/audio.mp3"
                    defaultValue={release.direct_audio_url || ''}
                    onBlur={(e) => {
                      if (e.target.value !== release.direct_audio_url) {
                        updateDirectAudioUrl(release.id, e.target.value);
                      }
                    }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Formats supportés: .mp3, .wav, .ogg
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {releases.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Aucune release musicale trouvée
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}