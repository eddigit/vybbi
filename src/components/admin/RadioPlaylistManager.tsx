import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  Music, 
  Plus, 
  Search, 
  PlayCircle,
  Users,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MusicRelease {
  id: string;
  title: string;
  artist_name: string;
  album_name?: string;
  cover_image_url?: string;
  youtube_url?: string;
  spotify_url?: string;
  soundcloud_url?: string;
  profile_id: string;
  artist_display_name: string;
  artist_avatar?: string;
  genre?: string;
  duration_seconds?: number;
}

interface Playlist {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  track_count: number;
}

export function RadioPlaylistManager() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [availableMusic, setAvailableMusic] = useState<MusicRelease[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAddMusicDialog, setShowAddMusicDialog] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch playlists
  const fetchPlaylists = async () => {
    try {
      const { data, error } = await supabase
        .from('radio_playlists')
        .select(`
          *,
          radio_playlist_tracks(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const playlistsWithCount = data?.map(playlist => ({
        ...playlist,
        track_count: playlist.radio_playlist_tracks?.[0]?.count || 0
      })) || [];

      setPlaylists(playlistsWithCount);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les playlists",
        variant: "destructive"
      });
    }
  };

  // Fetch available music from music_releases
  const fetchAvailableMusic = async () => {
    try {
      const { data, error } = await supabase
        .from('music_releases')
        .select(`
          id,
          title,
          artist_name,
          album_name,
          cover_image_url,
          youtube_url,
          spotify_url,
          soundcloud_url,
          profile_id,
          genre,
          duration_seconds,
          profiles!inner(
            display_name,
            avatar_url,
            profile_type
          )
        `)
        .eq('status', 'published')
        .eq('profiles.profile_type', 'artist')
        .eq('profiles.is_public', true);

      if (error) throw error;

      const musicWithArtist = data?.map(release => ({
        ...release,
        artist_display_name: release.profiles?.display_name || release.artist_name || 'Artiste inconnu',
        artist_avatar: release.profiles?.avatar_url
      })) || [];

      setAvailableMusic(musicWithArtist);
    } catch (error) {
      console.error('Error fetching music:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la musique",
        variant: "destructive"
      });
    }
  };

  // Create new playlist
  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la playlist est requis",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('radio_playlists')
        .insert({
          name: newPlaylistName,
          description: newPlaylistDescription,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Playlist créée avec succès"
      });

      setNewPlaylistName('');
      setNewPlaylistDescription('');
      setShowCreateDialog(false);
      fetchPlaylists();
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la playlist",
        variant: "destructive"
      });
    }
  };

  // Add music to playlist
  const addMusicToPlaylist = async () => {
    if (!selectedPlaylist || selectedMusic.length === 0) return;

    try {
      const playlistTracks = selectedMusic.map((musicReleaseId) => ({
        playlist_id: selectedPlaylist,
        music_release_id: musicReleaseId,
        is_approved: true,
        weight: 1
      }));

      const { error } = await supabase
        .from('radio_playlist_tracks')
        .insert(playlistTracks);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `${selectedMusic.length} piste(s) ajoutée(s) à la playlist`
      });

      setSelectedMusic([]);
      setShowAddMusicDialog(false);
      fetchPlaylists();
    } catch (error) {
      console.error('Error adding music to playlist:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la musique à la playlist",
        variant: "destructive"
      });
    }
  };

  // Toggle playlist active status
  const togglePlaylistStatus = async (playlistId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('radio_playlists')
        .update({ is_active: !isActive })
        .eq('id', playlistId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Playlist ${!isActive ? 'activée' : 'désactivée'}`
      });

      fetchPlaylists();
    } catch (error) {
      console.error('Error updating playlist:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier la playlist",
        variant: "destructive"
      });
    }
  };

  // Launch playlist in radio
  const launchPlaylist = async (playlistId: string) => {
    try {
      // Set the selected playlist as the active one for radio
      const { error } = await supabase
        .from('radio_playlists')
        .update({ is_active: false })
        .neq('id', playlistId);

      if (error) throw error;

      const { error: activateError } = await supabase
        .from('radio_playlists')
        .update({ is_active: true })
        .eq('id', playlistId);

      if (activateError) throw activateError;

      toast({
        title: "Playlist lancée !",
        description: "La playlist est maintenant diffusée sur la webradio",
        variant: "default"
      });

      fetchPlaylists();
    } catch (error) {
      console.error('Error launching playlist:', error);
      toast({
        title: "Erreur",
        description: "Impossible de lancer la playlist",
        variant: "destructive"
      });
    }
  };

  // Filter music based on search
  const filteredMusic = availableMusic.filter(music =>
    music.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    music.artist_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    music.artist_display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPlaylists(), fetchAvailableMusic()]);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Music className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Chargement des playlists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Playlists Radio</h2>
          <p className="text-muted-foreground">
            Créez et gérez les playlists de la webradio
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Playlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une nouvelle playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="playlist-name">Nom de la playlist</Label>
                <Input
                  id="playlist-name"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Ex: Musique du matin"
                />
              </div>
              <div>
                <Label htmlFor="playlist-description">Description (optionnelle)</Label>
                <Input
                  id="playlist-description"
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  placeholder="Description de la playlist"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={createPlaylist}>
                  Créer la playlist
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Playlists List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {playlists.map((playlist) => (
          <Card key={playlist.id} className={playlist.is_active ? 'border-primary/50' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{playlist.name}</CardTitle>
                <Badge variant={playlist.is_active ? 'default' : 'secondary'}>
                  {playlist.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {playlist.description && (
                <p className="text-sm text-muted-foreground">{playlist.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Music className="h-4 w-4" />
                  {playlist.track_count} piste(s)
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(playlist.created_at).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Dialog open={showAddMusicDialog && selectedPlaylist === playlist.id} 
                        onOpenChange={(open) => {
                          setShowAddMusicDialog(open);
                          if (open) setSelectedPlaylist(playlist.id);
                          else setSelectedPlaylist(null);
                        }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                      <DialogTitle>Ajouter de la musique à "{playlist.name}"</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 flex-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        <Input
                          placeholder="Rechercher par titre ou artiste..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      
                      <div className="overflow-y-auto max-h-96 space-y-2">
                        {filteredMusic.map((music) => (
                          <div key={music.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                            <Checkbox
                              checked={selectedMusic.includes(music.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedMusic([...selectedMusic, music.id]);
                                } else {
                                  setSelectedMusic(selectedMusic.filter(id => id !== music.id));
                                }
                              }}
                            />
                            
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={music.artist_avatar || ''} />
                              <AvatarFallback>
                                {music.artist_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{music.title}</p>
                              <p className="text-sm text-muted-foreground">
                                par {music.artist_display_name}
                              </p>
                            </div>
                            
                            <PlayCircle className="h-5 w-5 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                      
                      {selectedMusic.length > 0 && (
                        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                          <span className="text-sm">
                            {selectedMusic.length} piste(s) sélectionnée(s)
                          </span>
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setSelectedMusic([])}>
                              Tout désélectionner
                            </Button>
                            <Button onClick={addMusicToPlaylist}>
                              Ajouter à la playlist
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button
                  variant={playlist.is_active ? "destructive" : "default"}
                  size="sm"
                  onClick={() => togglePlaylistStatus(playlist.id, playlist.is_active)}
                >
                  {playlist.is_active ? 'Désactiver' : 'Activer'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => launchPlaylist(playlist.id)}
                  disabled={playlist.track_count === 0}
                  className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                >
                  🎵 Lancer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {playlists.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Aucune playlist</h3>
            <p className="text-muted-foreground mb-4">
              Créez votre première playlist pour commencer à diffuser de la musique
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer ma première playlist
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}