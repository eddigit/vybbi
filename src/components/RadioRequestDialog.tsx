import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Music, Clock, Users, MessageSquare, Star } from 'lucide-react';
import { useRadioRequests } from '@/hooks/useRadioRequests';
import { MusicRelease } from '@/hooks/useMusicReleases';

interface RadioRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  musicRelease: MusicRelease;
}

export function RadioRequestDialog({
  open,
  onOpenChange,
  musicRelease
}: RadioRequestDialogProps) {
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState([5]); // 1-10 scale
  const { submitRequest, submitting } = useRadioRequests();

  const getAudioAsset = () => {
    return musicRelease.media_assets?.find(asset => asset.media_type === 'audio');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const audioAsset = getAudioAsset();
    if (!audioAsset) return;

    const success = await submitRequest(
      audioAsset.id,
      musicRelease.id,
      message.trim() || undefined,
      priority[0]
    );

    if (success) {
      setMessage('');
      setPriority([5]);
      onOpenChange(false);
    }
  };

  const audioAsset = getAudioAsset();
  if (!audioAsset) {
    return null;
  }

  const getPriorityLabel = (value: number) => {
    if (value <= 3) return 'Normale';
    if (value <= 7) return 'Élevée';
    return 'Urgente';
  };

  const getPriorityColor = (value: number) => {
    if (value <= 3) return 'bg-green-500';
    if (value <= 7) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Demander ce morceau à la radio
          </DialogTitle>
          <DialogDescription>
            Soumettez une demande pour que ce morceau soit diffusé sur Vybbi Radio
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Track Info */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <Avatar className="h-16 w-16 rounded-lg">
              <AvatarImage 
                src={musicRelease.cover_image_url} 
                alt={musicRelease.title}
                className="rounded-lg"
              />
              <AvatarFallback className="rounded-lg">
                <Music className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">
                {musicRelease.title}
              </h3>
              <p className="text-muted-foreground truncate">
                {musicRelease.artist_name}
              </p>
              {musicRelease.genre && (
                <Badge variant="secondary" className="mt-1">
                  {musicRelease.genre}
                </Badge>
              )}
            </div>
          </div>

          {/* Priority Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Priorité de la demande
            </Label>
            <div className="space-y-2">
              <Slider
                value={priority}
                onValueChange={setPriority}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Normale</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(priority[0])}`} />
                  <span className="font-medium">
                    {getPriorityLabel(priority[0])} ({priority[0]}/10)
                  </span>
                </div>
                <span className="text-muted-foreground">Urgente</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Les demandes avec une priorité plus élevée ont plus de chances d'être diffusées rapidement
            </p>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">
              Message (optionnel)
            </Label>
            <Textarea
              id="message"
              placeholder="Ajoutez un message pour accompagner votre demande..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={200}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/200 caractères
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <Clock className="h-4 w-4 text-blue-600" />
              <div className="text-sm">
                <div className="font-medium text-blue-900 dark:text-blue-100">
                  File d'attente
                </div>
                <div className="text-blue-600 dark:text-blue-400">
                  Temps d'attente estimé
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <Users className="h-4 w-4 text-green-600" />
              <div className="text-sm">
                <div className="font-medium text-green-900 dark:text-green-100">
                  Votes communauté
                </div>
                <div className="text-green-600 dark:text-green-400">
                  Influence la priorité
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-gradient-primary hover:opacity-90"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Envoi...
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Soumettre la demande
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}