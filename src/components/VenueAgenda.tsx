import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Euro, Music } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useBookingNotifications } from '@/hooks/useBookingNotifications';

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
  image_url: string | null;
  image_position_y: number | null;
}

interface VenueAgendaProps {
  venueProfileId: string;
  showBookingButton?: boolean;
}

export function VenueAgenda({ venueProfileId, showBookingButton = false }: VenueAgendaProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { notifyBookingProposed } = useBookingNotifications();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    message: '',
    proposed_fee: ''
  });

  useEffect(() => {
    fetchEvents();
  }, [venueProfileId]);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('venue_profile_id', venueProfileId)
      .eq('status', 'published')
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  const handleBookingRequest = async () => {
    if (!profile || !selectedEvent) return;

    if (profile.profile_type !== 'artist') {
      toast({ 
        title: "Erreur", 
        description: "Seuls les artistes peuvent faire des demandes de booking", 
        variant: "destructive" 
      });
      return;
    }

    const bookingData = {
      event_id: selectedEvent.id,
      artist_profile_id: profile.id,
      venue_profile_id: venueProfileId,
      message: bookingForm.message || null,
      proposed_fee: bookingForm.proposed_fee ? parseInt(bookingForm.proposed_fee) : null
    };

    const { error } = await supabase
      .from('bookings')
      .insert([bookingData]);

    if (error) {
      console.error('Error creating booking:', error);
      toast({ 
        title: "Erreur", 
        description: "Impossible d'envoyer la demande de booking", 
        variant: "destructive" 
      });
    } else {
      // Récupérer les infos de la venue pour notification
      const { data: venueProfile } = await supabase
        .from('profiles')
        .select('email, display_name')
        .eq('id', venueProfileId)
        .single();

      if (venueProfile?.email && selectedEvent) {
        notifyBookingProposed({
          venueEmail: venueProfile.email,
          venueName: venueProfile.display_name || 'Organisateur',
          eventTitle: selectedEvent.title,
          eventDate: new Date(selectedEvent.event_date).toLocaleDateString('fr-FR'),
          artistName: profile?.display_name || 'Artiste',
          proposedFee: bookingForm.proposed_fee ? `${bookingForm.proposed_fee}€` : 'À négocier',
          message: bookingForm.message
        });
      }

      toast({ 
        title: "Succès", 
        description: "Votre demande de booking a été envoyée avec notification email" 
      });
      setIsBookingModalOpen(false);
      setBookingForm({ message: '', proposed_fee: '' });
      setSelectedEvent(null);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Chargement des événements...</div>;
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Aucun événement programmé pour le moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            {event.image_url && (
              <div className="relative h-48 overflow-hidden">
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
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.event_date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
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
                    {(event.budget_min || event.budget_max) && (
                      <div className="flex items-center gap-2">
                        <Euro className="h-4 w-4" />
                        {event.budget_min && `${event.budget_min}€`}
                        {event.budget_min && event.budget_max && ' - '}
                        {event.budget_max && `${event.budget_max}€`}
                      </div>
                    )}
                  </div>
                </div>
                
                {showBookingButton && profile?.profile_type === 'artist' && (
                  <Button
                    onClick={() => {
                      setSelectedEvent(event);
                      setIsBookingModalOpen(true);
                    }}
                  >
                    Postuler
                  </Button>
                )}
              </div>

              {event.description && (
                <p className="text-sm mb-4">{event.description}</p>
              )}

              {event.genres && event.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {event.genres.map((genre, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      <Music className="h-3 w-3" />
                      {genre}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Booking Modal */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demande de booking pour {selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="proposed_fee">Cachet proposé (€)</Label>
              <Input
                id="proposed_fee"
                type="number"
                value={bookingForm.proposed_fee}
                onChange={(e) => setBookingForm({ ...bookingForm, proposed_fee: e.target.value })}
                placeholder="Montant souhaité"
              />
            </div>
            
            <div>
              <Label htmlFor="message">Message (optionnel)</Label>
              <Textarea
                id="message"
                value={bookingForm.message}
                onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                placeholder="Présentez-vous et votre projet..."
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsBookingModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleBookingRequest}>
                Envoyer la demande
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}