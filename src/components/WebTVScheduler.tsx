import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, Plus, X } from 'lucide-react';
import { AutoTranslate } from '@/components/AutoTranslate';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { extractYouTubeVideoId } from '@/components/YouTubePlayer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface WebTVSchedulerProps {
  onEventCreated: () => void;
}

export function WebTVScheduler({ onEventCreated }: WebTVSchedulerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('20:00');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [duration, setDuration] = useState(60);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !date || !title || !youtubeUrl) return;

    // Validate YouTube URL
    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (!videoId) {
      toast({
        title: 'URL invalide',
        description: 'Veuillez entrer une URL YouTube valide',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Combine date and time
      const [hours, minutes] = time.split(':');
      const scheduledDate = new Date(date);
      scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const { error } = await supabase
        .from('webtv_events')
        .insert({
          title: title.trim(),
          description: description.trim(),
          youtube_url: youtubeUrl.trim(),
          scheduled_at: scheduledDate.toISOString(),
          duration_minutes: duration,
          host_name: profile.display_name || 'Artiste Vybbi',
          tags,
          created_by: user.id,
          is_live: false,
          viewer_count: 0,
        });

      if (error) throw error;

      toast({
        title: 'Événement créé',
        description: 'Votre événement a été programmé avec succès',
      });

      // Reset form
      setTitle('');
      setDescription('');
      setYoutubeUrl('');
      setDate(undefined);
      setTime('20:00');
      setDuration(60);
      setTags([]);
      setIsOpen(false);
      
      onEventCreated();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer l\'événement',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !profile || profile.profile_type !== 'artist') {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gradient-primary hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          <AutoTranslate text="Programmer" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <AutoTranslate text="Programmer un événement Web TV" />
          </DialogTitle>
          <DialogDescription>
            <AutoTranslate text="Créez votre émission et partagez votre talent avec la communauté Vybbi" />
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              <AutoTranslate text="Titre de l'événement" />
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Concert acoustique en live"
              maxLength={100}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              <AutoTranslate text="Description" />
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre événement, le programme, etc."
              maxLength={500}
              rows={3}
            />
          </div>

          {/* YouTube URL */}
          <div className="space-y-2">
            <Label htmlFor="youtube-url">
              <AutoTranslate text="URL YouTube" />
            </Label>
            <Input
              id="youtube-url"
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
            <p className="text-xs text-muted-foreground">
              <AutoTranslate text="URL de votre live stream ou vidéo YouTube" />
            </p>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                <AutoTranslate text="Date" />
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                      format(date, "PPP", { locale: fr })
                    ) : (
                      <AutoTranslate text="Choisir une date" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">
                <AutoTranslate text="Heure" />
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">
              <AutoTranslate text="Durée (minutes)" />
            </Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              min={15}
              max={240}
              step={15}
              required
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>
              <AutoTranslate text="Tags" /> ({tags.length}/5)
            </Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Ajouter un tag"
                maxLength={20}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                disabled={!newTag.trim() || tags.length >= 5}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              <AutoTranslate text="Annuler" />
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !date || !title.trim() || !youtubeUrl.trim()}
              className="bg-gradient-primary hover:opacity-90"
            >
              {isLoading ? (
                <AutoTranslate text="Création..." />
              ) : (
                <AutoTranslate text="Programmer" />
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}