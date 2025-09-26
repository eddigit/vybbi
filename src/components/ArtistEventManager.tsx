import React, { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, Edit3, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { EventFlyerUpload } from './EventFlyerUpload';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ArtistEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  flyer_url: string | null;
  flyer_position_y: number | null;
  genres: string[] | null;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
}

interface ArtistEventManagerProps {
  artistProfileId: string;
  isOwner: boolean;
}

export default function ArtistEventManager({ artistProfileId, isOwner }: ArtistEventManagerProps) {
  const { user } = useAuth();
  const [events, setEvents] = useState<ArtistEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ArtistEvent | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    genres: [] as string[],
    status: 'published' as 'draft' | 'published' | 'cancelled' | 'completed'
  });

  const genreOptions = [
    'Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical', 'R&B', 'Reggae',
    'Folk', 'Blues', 'Country', 'Metal', 'Funk', 'Soul', 'Disco', 'House',
    'Techno', 'Trance', 'Dubstep', 'Ambient', 'World Music'
  ];

  const fetchEvents = async () => {
    if (!artistProfileId) return;

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('artist_profile_id', artistProfileId)
        .eq('created_by_artist', true)
        .order('event_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching artist events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [artistProfileId]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_date: '',
      event_time: '',
      location: '',
      genres: [],
      status: 'published'
    });
    setEditingEvent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !artistProfileId) return;

    try {
      const eventData = {
        ...formData,
        artist_profile_id: artistProfileId,
        created_by_artist: true,
        created_by_user_id: user.id,
        venue_profile_id: artistProfileId // Pour la compatibilité avec le schéma existant
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id);

        if (error) throw error;
        toast.success('Événement mis à jour avec succès');
      } else {
        const { error } = await supabase
          .from('events')
          .insert([eventData]);

        if (error) throw error;
        toast.success('Événement ajouté avec succès');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (event: ArtistEvent) => {
    setFormData({
      title: event.title,
      description: event.description || '',
      event_date: event.event_date,
      event_time: event.event_time || '',
      location: event.location || '',
      genres: event.genres || [],
      status: event.status
    });
    setEditingEvent(event);
    setIsDialogOpen(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      toast.success('Événement supprimé');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const addGenre = (genre: string) => {
    if (!formData.genres.includes(genre)) {
      setFormData(prev => ({
        ...prev,
        genres: [...prev.genres, genre]
      }));
    }
  };

  const removeGenre = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.filter(g => g !== genre)
    }));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Portfolio d'événements</h3>
          <p className="text-sm text-muted-foreground">
            Gérez vos performances et événements passés
          </p>
        </div>
        
        {isOwner && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un événement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre de l'événement</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event_date">Date</Label>
                    <Input
                      id="event_date"
                      type="date"
                      value={formData.event_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="event_time">Heure (optionnel)</Label>
                    <Input
                      id="event_time"
                      type="time"
                      value={formData.event_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, event_time: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Organisateur</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Nom de l'organisateur, adresse..."
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Genres musicaux</Label>
                  <Select onValueChange={addGenre}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ajouter un genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genreOptions.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.genres.map((genre) => (
                      <Badge key={genre} variant="secondary" className="cursor-pointer" onClick={() => removeGenre(genre)}>
                        {genre} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Statut</Label>
                  <Select value={formData.status} onValueChange={(value: 'draft' | 'published' | 'cancelled' | 'completed') => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Publié</SelectItem>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="completed">Terminé</SelectItem>
                      <SelectItem value="cancelled">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editingEvent && (
                  <div>
                    <Label>Flyer de l'événement</Label>
                    <EventFlyerUpload
                      eventId={editingEvent.id}
                      currentFlyerUrl={editingEvent.flyer_url}
                      currentPosition={editingEvent.flyer_position_y || 50}
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingEvent ? 'Mettre à jour' : 'Créer l\'événement'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {isOwner ? 'Aucun événement ajouté. Commencez par créer votre premier événement.' : 'Aucun événement à afficher.'}
            </p>
          </div>
        ) : (
          events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <div className="flex">
                {event.flyer_url && (
                  <div className="w-24 h-24 flex-shrink-0">
                    <img
                      src={event.flyer_url}
                      alt={`Flyer de ${event.title}`}
                      className="w-full h-full object-cover"
                      style={{
                        objectPosition: `center ${event.flyer_position_y || 50}%`
                      }}
                    />
                  </div>
                )}
                
                <div className="flex-1">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{event.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(event.event_date), 'dd MMM yyyy', { locale: fr })}
                            {event.event_time && ` à ${event.event_time}`}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {isOwner && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(event)}
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(event.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {event.description && (
                      <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                    )}
                    
                    {event.genres && event.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {event.genres.map((genre) => (
                          <Badge key={genre} variant="outline" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}