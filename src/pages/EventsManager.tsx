import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Plus, Edit, Eye, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/components/ImageUpload';

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  genres: string[] | null;
  budget_min: number | null;
  budget_max: number | null;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  image_url: string | null;
  image_position_y: number | null;
  created_at: string;
}

interface Booking {
  id: string;
  event_id: string;
  artist_profile_id: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  message: string | null;
  proposed_fee: number | null;
  created_at: string;
  artist: {
    display_name: string;
    avatar_url: string | null;
  };
}

export default function EventsManager() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    genres: [] as string[],
    budget_min: '',
    budget_max: '',
    status: 'draft' as Event['status'],
    image_url: '',
    image_position_y: 50
  });

  useEffect(() => {
    if (profile?.profile_type === 'lieu') {
      fetchEvents();
      fetchBookings();
    }
  }, [profile]);

  const fetchEvents = async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('venue_profile_id', profile.id)
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      toast({ title: "Erreur", description: "Impossible de charger les événements", variant: "destructive" });
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  const fetchBookings = async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        artist:profiles!bookings_artist_profile_id_fkey(display_name, avatar_url)
      `)
      .eq('venue_profile_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
    } else {
      setBookings(data || []);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_date: '',
      event_time: '',
      location: '',
      genres: [],
      budget_min: '',
      budget_max: '',
      status: 'draft',
      image_url: '',
      image_position_y: 50
    });
  };

  const handleCreateEvent = async () => {
    if (!profile || !formData.title || !formData.event_date) {
      toast({ title: "Erreur", description: "Veuillez remplir les champs obligatoires", variant: "destructive" });
      return;
    }

    const eventData = {
      venue_profile_id: profile.id,
      title: formData.title,
      description: formData.description || null,
      event_date: formData.event_date,
      event_time: formData.event_time || null,
      location: formData.location || null,
      genres: formData.genres.length > 0 ? formData.genres : null,
      budget_min: formData.budget_min ? parseInt(formData.budget_min) : null,
      budget_max: formData.budget_max ? parseInt(formData.budget_max) : null,
      status: formData.status,
      image_url: formData.image_url || null,
      image_position_y: formData.image_position_y
    };

    const { error } = await supabase
      .from('events')
      .insert([eventData]);

    if (error) {
      console.error('Error creating event:', error);
      toast({ title: "Erreur", description: "Impossible de créer l'événement", variant: "destructive" });
    } else {
      toast({ title: "Succès", description: "Événement créé avec succès" });
      setIsCreateModalOpen(false);
      resetForm();
      fetchEvents();
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    if (error) {
      console.error('Error updating booking:', error);
      toast({ title: "Erreur", description: "Impossible de mettre à jour la demande", variant: "destructive" });
    } else {
      toast({ title: "Succès", description: `Demande ${status === 'confirmed' ? 'confirmée' : 'annulée'}` });
      fetchBookings();
    }
  };

  const getStatusBadge = (status: Event['status']) => {
    const variants = {
      draft: 'secondary',
      published: 'default',
      cancelled: 'destructive'
    } as const;
    
    const labels = {
      draft: 'Brouillon',
      published: 'Publié',
      cancelled: 'Annulé'
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des événements</h1>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un événement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un nouvel événement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nom de l'événement"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de l'événement"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event_date">Date *</Label>
                  <Input
                    id="event_date"
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="event_time">Heure</Label>
                  <Input
                    id="event_time"
                    type="time"
                    value={formData.event_time}
                    onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Lieu</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Adresse du lieu"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget_min">Budget min (€)</Label>
                  <Input
                    id="budget_min"
                    type="number"
                    value={formData.budget_min}
                    onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="budget_max">Budget max (€)</Label>
                  <Input
                    id="budget_max"
                    type="number"
                    value={formData.budget_max}
                    onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Statut</Label>
                <Select value={formData.status} onValueChange={(value: Event['status']) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="published">Publié</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Image de l'événement</Label>
                <ImageUpload
                  onUpload={(imageUrl) => setFormData({ ...formData, image_url: imageUrl })}
                  currentImageUrl={formData.image_url}
                  onRemove={() => setFormData({ ...formData, image_url: '' })}
                  bucket="media"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateEvent}>
                  Créer l'événement
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Events List */}
      <div className="grid gap-6">
        <h2 className="text-2xl font-semibold">Mes événements</h2>
        {events.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Aucun événement créé pour le moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {events.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{event.title}</h3>
                        {getStatusBadge(event.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(event.event_date).toLocaleDateString('fr-FR')}
                        </div>
                        {event.event_time && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {event.event_time}
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                          </div>
                        )}
                      </div>

                      {event.description && (
                        <p className="mt-3 text-sm">{event.description}</p>
                      )}

                      {(event.budget_min || event.budget_max) && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          Budget: {event.budget_min && `${event.budget_min}€`}
                          {event.budget_min && event.budget_max && ' - '}
                          {event.budget_max && `${event.budget_max}€`}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      {event.status === 'published' && (
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bookings */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Demandes de booking</h2>
        {bookings.filter(b => b.status === 'pending').length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Aucune demande de booking en attente.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {bookings.filter(b => b.status === 'pending').map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">{booking.artist.display_name}</span>
                      </div>
                      {booking.proposed_fee && (
                        <span className="text-sm text-muted-foreground">
                          Cachet proposé: {booking.proposed_fee}€
                        </span>
                      )}
                      {booking.message && (
                        <span className="text-sm text-muted-foreground">
                          "{booking.message}"
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                      >
                        Confirmer
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}