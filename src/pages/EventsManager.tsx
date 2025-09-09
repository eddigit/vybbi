import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Plus, Edit, Eye, Trash2, Grid, List, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/components/ImageUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  venue_profile_id: string;
  profiles?: {
    display_name: string;
    location: string | null;
    avatar_url: string | null;
  } | null;
}

interface Booking {
  id: string;
  event_id: string;
  artist_profile_id: string;
  venue_profile_id: string;
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
  const [allPublishedEvents, setAllPublishedEvents] = useState<Event[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // all, upcoming, past
  const [statusFilter, setStatusFilter] = useState('all'); // all, available, booked

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
    if (profile) {
      fetchAllPublishedEvents();
      if (profile.profile_type === 'lieu') {
        fetchMyEvents();
        fetchBookings();
      }
    }
  }, [profile]);

  const fetchAllPublishedEvents = async () => {
    // Get all published events
    const { data: publishedData, error: publishedError } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .order('event_date', { ascending: true });

    if (publishedError) {
      console.error('Error fetching published events:', publishedError);
      toast({ title: "Erreur", description: "Impossible de charger les événements publiés", variant: "destructive" });
      setLoading(false);
      return;
    }

    // If user is a venue, also get their own events (regardless of status)
    let allEvents = publishedData || [];
    if (profile?.profile_type === 'lieu') {
      const { data: myEventsData, error: myEventsError } = await supabase
        .from('events')
        .select('*')
        .eq('venue_profile_id', profile.id)
        .order('event_date', { ascending: true });

      if (myEventsError) {
        console.error('Error fetching my events:', myEventsError);
      } else if (myEventsData) {
        // Merge events, avoiding duplicates
        const publishedIds = new Set((publishedData || []).map(e => e.id));
        const uniqueMyEvents = myEventsData.filter(e => !publishedIds.has(e.id));
        allEvents = [...(publishedData || []), ...uniqueMyEvents].sort((a, b) => 
          new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
        );
      }
    }

    // Get venue profiles for all events
    if (allEvents.length > 0) {
      const venueProfileIds = [...new Set(allEvents.map(e => e.venue_profile_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, location, avatar_url')
        .in('id', venueProfileIds);

      if (!profilesError && profilesData) {
        const profilesMap = new Map(profilesData.map(p => [p.id, p]));
        allEvents = allEvents.map(event => ({
          ...event,
          profiles: profilesMap.get(event.venue_profile_id) || null
        }));
      }
    }

    setAllPublishedEvents(allEvents);
    setLoading(false);
  };

  const fetchMyEvents = async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('venue_profile_id', profile.id)
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Error fetching my events:', error);
      toast({ title: "Erreur", description: "Impossible de charger mes événements", variant: "destructive" });
    } else {
      setMyEvents(data || []);
    }
  };

  const fetchBookings = async () => {
    if (!profile) return;

    // First fetch bookings, then fetch profiles separately
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .eq('venue_profile_id', profile.id)
      .order('created_at', { ascending: false });

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      return;
    }

    if (!bookingsData || bookingsData.length === 0) {
      setBookings([]);
      return;
    }

    // Get unique artist profile IDs
    const artistProfileIds = [...new Set(bookingsData.map(b => b.artist_profile_id))];
    
    // Fetch artist profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .in('id', artistProfileIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return;
    }

    // Create a map of profile ID to profile data
    const profilesMap = new Map(
      (profilesData || []).map(p => [p.id, p])
    );

    // Transform the data to match our interface
    const transformedBookings = bookingsData.map(booking => ({
      id: booking.id,
      event_id: booking.event_id,
      artist_profile_id: booking.artist_profile_id,
      venue_profile_id: booking.venue_profile_id,
      status: booking.status,
      message: booking.message,
      proposed_fee: booking.proposed_fee,
      created_at: booking.created_at,
      artist: profilesMap.get(booking.artist_profile_id) || { 
        display_name: 'Artiste inconnu', 
        avatar_url: null 
      }
    }));
    
    setBookings(transformedBookings);
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
      fetchMyEvents();
      fetchAllPublishedEvents();
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

  const filteredPublishedEvents = allPublishedEvents.filter(event => {
    // Search filter
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.profiles?.display_name?.toLowerCase().includes(searchTerm.toLowerCase());

    // Date filter
    const eventDate = new Date(event.event_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let matchesDate = true;
    if (dateFilter === 'upcoming') {
      matchesDate = eventDate >= today;
    } else if (dateFilter === 'past') {
      matchesDate = eventDate < today;
    }

    // Status filter (for now, we'll assume all published events are "available")
    let matchesStatus = true;
    if (statusFilter === 'available') {
      matchesStatus = event.status === 'published';
    }
    // TODO: Add logic for 'booked' status when booking system is fully implemented

    return matchesSearch && matchesDate && matchesStatus;
  });

  const EventCard = ({ event, isOwner = false }: { event: Event, isOwner?: boolean }) => (
    <Card className="overflow-hidden">
      {event.image_url && (
        <div className="aspect-video relative overflow-hidden">
          <img 
            src={event.image_url} 
            alt={event.title}
            className="w-full h-full object-cover"
            style={{
              objectPosition: `center ${event.image_position_y || 50}%`
            }}
          />
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold line-clamp-1">{event.title}</h3>
          {getStatusBadge(event.status)}
        </div>
        
        {event.profiles && (
          <p className="text-sm text-muted-foreground mb-2">
            Organisé par {event.profiles.display_name}
          </p>
        )}
        
        <div className="space-y-1 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {new Date(event.event_date).toLocaleDateString('fr-FR')}
            {event.event_time && (
              <>
                <Clock className="h-4 w-4 ml-2" />
                {event.event_time}
              </>
            )}
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {event.location}
            </div>
          )}
        </div>

        {event.description && (
          <p className="text-sm mb-3 line-clamp-2">{event.description}</p>
        )}

        {(event.budget_min || event.budget_max) && (
          <div className="text-sm text-muted-foreground mb-3">
            Budget: {event.budget_min && `${event.budget_min}€`}
            {event.budget_min && event.budget_max && ' - '}
            {event.budget_max && `${event.budget_max}€`}
          </div>
        )}

        {isOwner && (
          <div className="flex gap-2 mt-3">
            {event.status === 'published' && (
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const EventListItem = ({ event, isOwner = false }: { event: Event, isOwner?: boolean }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold">{event.title}</h3>
              {getStatusBadge(event.status)}
            </div>
            
            {event.profiles && (
              <p className="text-sm text-muted-foreground mb-2">
                Organisé par {event.profiles.display_name}
              </p>
            )}
            
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

          {isOwner && (
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
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h1 className="text-3xl font-bold">Événements</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          {profile?.profile_type === 'lieu' && (
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
                  currentImageUrl={formData.image_url}
                  currentImagePosition={formData.image_position_y}
                  onImageChange={(imageUrl) => setFormData({ ...formData, image_url: imageUrl || '' })}
                  onPositionChange={(position) => setFormData({ ...formData, image_position_y: position })}
                  bucket="media"
                  folder="events"
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
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des événements, clubs, lieux..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'card' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('card')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Additional Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes dates</SelectItem>
              <SelectItem value="upcoming">À venir</SelectItem>
              <SelectItem value="past">Passés</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              <SelectItem value="available">Disponibles</SelectItem>
              <SelectItem value="booked">Réservés</SelectItem>
            </SelectContent>
          </Select>

          {(searchTerm || dateFilter !== 'all' || statusFilter !== 'all') && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setSearchTerm('');
                setDateFilter('all');
                setStatusFilter('all');
              }}
            >
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Tous les événements</TabsTrigger>
          {profile?.profile_type === 'lieu' && (
            <TabsTrigger value="mine">Mes événements</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {filteredPublishedEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  {searchTerm || dateFilter !== 'all' || statusFilter !== 'all' 
                    ? 'Aucun événement trouvé avec ces critères de recherche.' 
                    : 'Aucun événement publié pour le moment.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === 'card' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
              {filteredPublishedEvents.map((event) => 
                viewMode === 'card' ? (
                  <EventCard key={event.id} event={event} />
                ) : (
                  <EventListItem key={event.id} event={event} />
                )
              )}
            </div>
          )}
        </TabsContent>

        {profile?.profile_type === 'lieu' && (
          <TabsContent value="mine" className="space-y-4">
            {myEvents.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Aucun événement créé pour le moment.</p>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === 'card' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
                {myEvents.map((event) => 
                  viewMode === 'card' ? (
                    <EventCard key={event.id} event={event} isOwner={true} />
                  ) : (
                    <EventListItem key={event.id} event={event} isOwner={true} />
                  )
                )}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Bookings - Only show for venues */}
      {profile?.profile_type === 'lieu' && (
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
      )}
    </div>
  );
}