import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Music, 
  Play, 
  Pause,
  SkipForward,
  Clock,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PlaylistTrack {
  id: string;
  music_release_id: string;
  music_releases: {
    id: string;
    title: string;
    artist_name: string;
    cover_image_url?: string;
    duration_seconds?: number;
    profiles: {
      display_name: string;
      avatar_url?: string;
    };
  };
}

interface RadioPlaylist {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  track_count: number;
  tracks?: PlaylistTrack[];
}

export function RadioPlaylistController() {
  const [activePlaylists, setActivePlaylists] = useState<RadioPlaylist[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<RadioPlaylist | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch active playlists with their tracks
  const fetchActivePlaylists = async () => {
    try {
      const { data, error } = await supabase
        .from('radio_playlists')
        .select(`
          *,
          radio_playlist_tracks(
            id,
            music_release_id,
            music_releases(
              id,
              title,
              artist_name,
              cover_image_url,
              duration_seconds,
              profiles(display_name, avatar_url)
            )
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const playlistsWithTracks = data?.map(playlist => ({
        ...playlist,
        track_count: playlist.radio_playlist_tracks?.length || 0,
        tracks: playlist.radio_playlist_tracks || []
      })) || [];

      setActivePlaylists(playlistsWithTracks);
      
      // Set the first active playlist as current if none selected
      if (playlistsWithTracks.length > 0 && !currentPlaylist) {
        setCurrentPlaylist(playlistsWithTracks[0]);
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les playlists actives",
        variant: "destructive"
      });
    }
  };

  // Switch current playlist
  const switchPlaylist = (playlist: RadioPlaylist) => {
    setCurrentPlaylist(playlist);
    toast({
      title: "Playlist changée",
      description: `Lecture de: ${playlist.name}`,
    });
  };

  // Format duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchActivePlaylists();
      setLoading(false);
    };

    loadData();

    // Set up real-time subscription for playlist changes
    const subscription = supabase
      .channel('radio_playlists')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'radio_playlists' },
        () => fetchActivePlaylists()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Music className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Chargement des playlists...</p>
        </CardContent>
      </Card>
    );
  }

  if (activePlaylists.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Aucune playlist active</h3>
          <p className="text-muted-foreground">
            Contactez un administrateur pour activer des playlists
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Playlist Display */}
      {currentPlaylist && (
        <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Play className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">En cours de diffusion</CardTitle>
                  <p className="text-primary font-medium">{currentPlaylist.name}</p>
                </div>
              </div>
              <Badge variant="default" className="bg-green-600">
                🔴 LIVE
              </Badge>
            </div>
            {currentPlaylist.description && (
              <p className="text-muted-foreground">{currentPlaylist.description}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Music className="h-4 w-4" />
                {currentPlaylist.track_count} piste(s)
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Depuis {new Date(currentPlaylist.created_at).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Playlists */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Playlists disponibles ({activePlaylists.length})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activePlaylists.map((playlist) => (
            <Card 
              key={playlist.id} 
              className={`transition-all hover:shadow-md ${
                currentPlaylist?.id === playlist.id ? 'ring-2 ring-primary' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{playlist.name}</CardTitle>
                  {currentPlaylist?.id === playlist.id && (
                    <Badge variant="outline" className="text-primary border-primary">
                      Actuelle
                    </Badge>
                  )}
                </div>
                {playlist.description && (
                  <p className="text-sm text-muted-foreground">{playlist.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Music className="h-4 w-4" />
                      {playlist.track_count} piste(s)
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => switchPlaylist(playlist)}
                  disabled={currentPlaylist?.id === playlist.id}
                  size="sm"
                  className="w-full"
                  variant={currentPlaylist?.id === playlist.id ? "outline" : "default"}
                >
                  {currentPlaylist?.id === playlist.id ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      En cours
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Sélectionner
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Playlist Tracks Preview */}
      {currentPlaylist && currentPlaylist.tracks && currentPlaylist.tracks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Aperçu - {currentPlaylist.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {currentPlaylist.tracks.slice(0, 10).map((track, index) => (
                <div key={track.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <div className="flex-shrink-0 w-8 text-center text-sm text-muted-foreground">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{track.music_releases.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {track.music_releases.profiles?.display_name || track.music_releases.artist_name}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDuration(track.music_releases.duration_seconds)}
                  </div>
                </div>
              ))}
              {currentPlaylist.tracks.length > 10 && (
                <div className="text-center text-sm text-muted-foreground py-2">
                  ... et {currentPlaylist.tracks.length - 10} autres pistes
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}