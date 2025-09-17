import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Music, Radio, Clock } from 'lucide-react';

interface RadioSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  musicRelease: {
    id: string;
    title: string;
    artist_name: string;
    cover_image_url: string;
    duration_seconds?: number;
    genre?: string;
    media_assets?: Array<{
      id: string;
      file_url: string;
      file_name: string;
      media_type: string;
    }>;
  };
  onSubmissionSuccess?: () => void;
}

interface RadioPlaylist {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
}

export const RadioSubmissionDialog: React.FC<RadioSubmissionDialogProps> = ({
  open,
  onOpenChange,
  musicRelease,
  onSubmissionSuccess
}) => {
  const [playlists, setPlaylists] = useState<RadioPlaylist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('');
  const [weight, setWeight] = useState(5);
  const [loading, setLoading] = useState(false);
  const [fetchingPlaylists, setFetchingPlaylists] = useState(true);

  useEffect(() => {
    if (open) {
      fetchPlaylists();
    }
  }, [open]);

  const fetchPlaylists = async () => {
    setFetchingPlaylists(true);
    try {
      const { data, error } = await supabase
        .from('radio_playlists')
        .select('id, name, description, is_active')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setPlaylists(data || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les playlists radio",
        variant: "destructive"
      });
    } finally {
      setFetchingPlaylists(false);
    }
  };

  const getAudioAsset = () => {
    return musicRelease.media_assets?.find(asset => asset.media_type === 'audio');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const audioAsset = getAudioAsset();
    if (!audioAsset) {
      toast({
        title: "Erreur",
        description: "Aucun fichier audio trouvé pour ce morceau",
        variant: "destructive"
      });
      return;
    }

    if (!selectedPlaylistId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une playlist",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Check if already submitted
      const { data: existing } = await supabase
        .from('radio_playlist_tracks')
        .select('id')
        .eq('media_asset_id', audioAsset.id)
        .eq('playlist_id', selectedPlaylistId)
        .single();

      if (existing) {
        toast({
          title: "Information",
          description: "Ce morceau a déjà été soumis à cette playlist",
          variant: "default"
        });
        return;
      }

      // Submit to radio playlist
      const { error } = await supabase
        .from('radio_playlist_tracks')
        .insert({
          playlist_id: selectedPlaylistId,
          media_asset_id: audioAsset.id,
          weight: weight,
          is_approved: false, // Requires admin approval
          added_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Votre morceau a été soumis pour approbation",
      });

      onOpenChange(false);
      onSubmissionSuccess?.();
      
      // Reset form
      setSelectedPlaylistId('');
      setWeight(5);

    } catch (error) {
      console.error('Error submitting track:', error);
      toast({
        title: "Erreur",
        description: "Impossible de soumettre le morceau",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const audioAsset = getAudioAsset();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Soumettre à la Radio
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Track Info */}
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <Avatar className="h-12 w-12 rounded-lg">
              <AvatarImage src={musicRelease.cover_image_url} alt={musicRelease.title} />
              <AvatarFallback className="rounded-lg">
                <Music className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{musicRelease.title}</h3>
              <p className="text-sm text-muted-foreground truncate">{musicRelease.artist_name}</p>
              <div className="flex items-center gap-2 mt-1">
                {musicRelease.duration_seconds && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDuration(musicRelease.duration_seconds)}
                  </div>
                )}
                {musicRelease.genre && (
                  <Badge variant="secondary" className="text-xs">{musicRelease.genre}</Badge>
                )}
              </div>
            </div>
          </div>

          {!audioAsset && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
              ⚠️ Aucun fichier audio trouvé. Vous ne pouvez pas soumettre ce morceau.
            </div>
          )}

          {audioAsset && (
            <>
              {/* Playlist Selection */}
              <div className="space-y-2">
                <Label htmlFor="playlist">Playlist de destination</Label>
                {fetchingPlaylists ? (
                  <div className="flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Select value={selectedPlaylistId} onValueChange={setSelectedPlaylistId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une playlist" />
                    </SelectTrigger>
                    <SelectContent>
                      {playlists.map((playlist) => (
                        <SelectItem key={playlist.id} value={playlist.id}>
                          <div>
                            <div className="font-medium">{playlist.name}</div>
                            {playlist.description && (
                              <div className="text-xs text-muted-foreground">{playlist.description}</div>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Weight/Importance */}
              <div className="space-y-2">
                <Label htmlFor="weight">Importance (1-10)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="1"
                  max="10"
                  value={weight}
                  onChange={(e) => setWeight(parseInt(e.target.value) || 5)}
                  placeholder="5"
                />
                <p className="text-xs text-muted-foreground">
                  Plus le nombre est élevé, plus le morceau sera diffusé fréquemment
                </p>
              </div>

              {/* Optional Description */}
              <div className="space-y-2">
                <Label htmlFor="note">Note pour les modérateurs (optionnel)</Label>
                <p className="text-xs text-muted-foreground">
                  Utilisez ce champ pour ajouter des informations sur votre morceau qui pourraient aider les modérateurs lors de l'évaluation.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !selectedPlaylistId}
                  className="flex-1"
                >
                  {loading ? 'Soumission...' : 'Soumettre'}
                </Button>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};