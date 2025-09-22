import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Edit, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Playlist {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  priority: number;
  schedule_start?: string;
  schedule_end?: string;
}

interface EditPlaylistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  playlistId: string | null;
  onPlaylistUpdated: () => void;
}

export function EditPlaylistDialog({ 
  isOpen, 
  onClose, 
  playlistId,
  onPlaylistUpdated 
}: EditPlaylistDialogProps) {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: false,
    priority: 1,
    schedule_start: '',
    schedule_end: ''
  });
  const { toast } = useToast();

  const fetchPlaylist = async () => {
    if (!playlistId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('radio_playlists')
        .select('*')
        .eq('id', playlistId)
        .single();

      if (error) throw error;
      
      setPlaylist(data);
      setFormData({
        name: data.name || '',
        description: data.description || '',
        is_active: data.is_active || false,
        priority: data.priority || 1,
        schedule_start: data.schedule_start || '',
        schedule_end: data.schedule_end || ''
      });
    } catch (error) {
      console.error('Error fetching playlist:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la playlist",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const savePlaylist = async () => {
    if (!playlistId || !formData.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la playlist est requis",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('radio_playlists')
        .update({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          is_active: formData.is_active,
          priority: formData.priority,
          schedule_start: formData.schedule_start || null,
          schedule_end: formData.schedule_end || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', playlistId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Playlist mise à jour avec succès"
      });

      onPlaylistUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating playlist:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la playlist",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (isOpen && playlistId) {
      fetchPlaylist();
    }
  }, [isOpen, playlistId]);

  const handleClose = () => {
    onClose();
    setPlaylist(null);
    setFormData({
      name: '',
      description: '',
      is_active: false,
      priority: 1,
      schedule_start: '',
      schedule_end: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Modifier la playlist
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Chargement...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-playlist-name">Nom de la playlist</Label>
              <Input
                id="edit-playlist-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nom de la playlist"
              />
            </div>

            <div>
              <Label htmlFor="edit-playlist-description">Description</Label>
              <Textarea
                id="edit-playlist-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description de la playlist"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="edit-playlist-priority">Priorité</Label>
              <Input
                id="edit-playlist-priority"
                type="number"
                min="1"
                max="10"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-schedule-start">Début (HH:MM)</Label>
                <Input
                  id="edit-schedule-start"
                  type="time"
                  value={formData.schedule_start}
                  onChange={(e) => setFormData(prev => ({ ...prev, schedule_start: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-schedule-end">Fin (HH:MM)</Label>
                <Input
                  id="edit-schedule-end"
                  type="time"
                  value={formData.schedule_end}
                  onChange={(e) => setFormData(prev => ({ ...prev, schedule_end: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="edit-playlist-active">Playlist active</Label>
              <Switch
                id="edit-playlist-active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button onClick={savePlaylist} disabled={saving || !formData.name.trim()}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Enregistrer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}