import React, { useState } from 'react';
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
import { AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DeletePlaylistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  playlistId: string | null;
  playlistName: string;
  onPlaylistDeleted: () => void;
}

export function DeletePlaylistDialog({ 
  isOpen, 
  onClose, 
  playlistId,
  playlistName,
  onPlaylistDeleted 
}: DeletePlaylistDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const deletePlaylist = async () => {
    if (!playlistId) return;

    setDeleting(true);
    try {
      // First, delete all tracks in the playlist
      const { error: tracksError } = await supabase
        .from('radio_playlist_tracks')
        .delete()
        .eq('playlist_id', playlistId);

      if (tracksError) throw tracksError;

      // Then delete the playlist itself
      const { error: playlistError } = await supabase
        .from('radio_playlists')
        .delete()
        .eq('id', playlistId);

      if (playlistError) throw playlistError;

      toast({
        title: "Succès",
        description: "Playlist supprimée avec succès"
      });

      onPlaylistDeleted();
      onClose();
    } catch (error) {
      console.error('Error deleting playlist:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la playlist",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Confirmer la suppression
          </AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer la playlist <strong>"{playlistName}"</strong> ? 
            <br />
            <br />
            Cette action supprimera également tous les morceaux associés à cette playlist et est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={deletePlaylist}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Supprimer définitivement
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}