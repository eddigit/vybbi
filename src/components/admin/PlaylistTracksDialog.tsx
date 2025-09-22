import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Music, 
  Trash2,
  Clock,
  User,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PlaylistTrack {
  id: string;
  music_release_id: string;
  weight: number;
  is_approved: boolean;
  added_at: string;
  music_releases: {
    id: string;
    title: string;
    artist_name: string;
    cover_image_url?: string;
    youtube_url?: string;
    spotify_url?: string;
    soundcloud_url?: string;
    genre?: string;
    duration_seconds?: number;
    profiles: {
      display_name: string;
      avatar_url?: string;
    };
  };
}

interface PlaylistTracksDialogProps {
  isOpen: boolean;
  onClose: () => void;
  playlistId: string | null;
  playlistName: string;
  onTracksUpdated: () => void;
}

export function PlaylistTracksDialog({ 
  isOpen, 
  onClose, 
  playlistId, 
  playlistName,
  onTracksUpdated 
}: PlaylistTracksDialogProps) {
  const [tracks, setTracks] = useState<PlaylistTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPlaylistTracks = async () => {
    if (!playlistId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('radio_playlist_tracks')
        .select(`
          id,
          music_release_id,
          weight,
          is_approved,
          added_at,
          music_releases!inner(
            id,
            title,
            artist_name,
            cover_image_url,
            youtube_url,
            spotify_url,
            soundcloud_url,
            genre,
            duration_seconds,
            profiles!inner(
              display_name,
              avatar_url
            )
          )
        `)
        .eq('playlist_id', playlistId)
        .order('added_at', { ascending: false });

      if (error) throw error;
      setTracks(data || []);
    } catch (error) {
      console.error('Error fetching playlist tracks:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les morceaux de la playlist",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeTrackFromPlaylist = async (trackId: string) => {
    try {
      const { error } = await supabase
        .from('radio_playlist_tracks')
        .delete()
        .eq('id', trackId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Morceau retiré de la playlist"
      });

      setTracks(tracks.filter(track => track.id !== trackId));
      onTracksUpdated();
      setTrackToDelete(null);
    } catch (error) {
      console.error('Error removing track:', error);
      toast({
        title: "Erreur",
        description: "Impossible de retirer le morceau",
        variant: "destructive"
      });
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isOpen && playlistId) {
      fetchPlaylistTracks();
    }
  }, [isOpen, playlistId]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Morceaux dans "{playlistName}"
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Chargement des morceaux...</span>
              </div>
            ) : tracks.length === 0 ? (
              <div className="text-center py-12">
                <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Aucun morceau</h3>
                <p className="text-muted-foreground">
                  Cette playlist ne contient aucun morceau pour le moment.
                </p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-4">
                {tracks.map((track) => (
                  <div key={track.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={track.music_releases.cover_image_url || track.music_releases.profiles.avatar_url || ''} />
                      <AvatarFallback>
                        <Music className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{track.music_releases.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{track.music_releases.profiles.display_name || track.music_releases.artist_name}</span>
                      </div>
                      {track.music_releases.genre && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {track.music_releases.genre}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(track.music_releases.duration_seconds)}</span>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xs">Poids</div>
                        <Badge variant="outline">{track.weight}</Badge>
                      </div>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setTrackToDelete(track.id)}
                        className="shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!trackToDelete} onOpenChange={() => setTrackToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir retirer ce morceau de la playlist ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => trackToDelete && removeTrackFromPlaylist(trackToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Retirer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}