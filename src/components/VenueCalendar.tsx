import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Clock, MapPin, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface VenueEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  genres: string[];
  budget_min: number;
  budget_max: number;
  status: string;
}

interface VenueCalendarProps {
  venueProfileId: string;
  showBookingButton?: boolean;
}

export function VenueCalendar({ venueProfileId, showBookingButton = false }: VenueCalendarProps) {
  const { user, profile } = useAuth();
  const [events, setEvents] = useState<VenueEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<VenueEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [venueProfileId]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('venue_profile_id', venueProfileId)
        .eq('status', 'published')
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookEvent = async () => {
    if (!user || !profile || !selectedEvent) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .insert({
          artist_profile_id: profile.id,
          venue_profile_id: venueProfileId,
          event_id: selectedEvent.id,
          message: `Demande de réservation pour l'événement "${selectedEvent.title}"`
        });

      if (error) throw error;
      
      // Close dialog and show success message
      setSelectedEvent(null);
      // You might want to add a toast notification here
    } catch (error) {
      console.error('Error booking event:', error);
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.event_date), date)
    );
  };

  const hasEventsOnDate = (date: Date) => {
    return getEventsForDate(date).length > 0;
  };

  const DayContent = ({ date }: { date: Date }) => {
    const dayEvents = getEventsForDate(date);
    const hasEvents = dayEvents.length > 0;

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <span className={cn(
          "text-sm",
          hasEvents && "font-semibold"
        )}>
          {format(date, 'd')}
        </span>
        {hasEvents && (
          <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 flex gap-0.5">
            {dayEvents.slice(0, 3).map((_, index) => (
              <div
                key={index}
                className="w-1.5 h-1.5 bg-primary rounded-full"
              />
            ))}
            {dayEvents.length > 3 && (
              <div className="w-1.5 h-1.5 bg-primary/60 rounded-full" />
            )}
          </div>
        )}
      </div>
    );
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendrier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Calendrier des événements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="w-full"
          locale={fr}
          components={{
            DayContent: ({ date }) => <DayContent date={date} />
          }}
          modifiers={{
            hasEvents: (date) => hasEventsOnDate(date)
          }}
          modifiersStyles={{
            hasEvents: {
              backgroundColor: 'rgba(var(--primary) / 0.1)',
              borderRadius: '6px'
            }
          }}
        />

        {/* Events for selected date */}
        {selectedDateEvents.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">
              Événements du {selectedDate && format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
            </h4>
            {selectedDateEvents.map((event) => (
              <Dialog key={event.id}>
                <DialogTrigger asChild>
                  <div className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{event.title}</h5>
                        {event.event_time && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            {event.event_time}
                          </div>
                        )}
                        {event.genres && event.genres.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {event.genres.slice(0, 2).map((genre, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {genre}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </DialogTrigger>
                
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{event.title}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {event.description && (
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="h-4 w-4" />
                        {format(new Date(event.event_date), 'dd MMMM yyyy', { locale: fr })}
                        {event.event_time && ` à ${event.event_time}`}
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                      )}
                      
                      {(event.budget_min || event.budget_max) && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4" />
                          Budget: {event.budget_min && `${event.budget_min}€`}
                          {event.budget_min && event.budget_max && ' - '}
                          {event.budget_max && `${event.budget_max}€`}
                        </div>
                      )}
                    </div>

                    {event.genres && event.genres.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Genres recherchés</h4>
                        <div className="flex flex-wrap gap-1">
                          {event.genres.map((genre, index) => (
                            <Badge key={index} variant="secondary">
                              {genre}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {showBookingButton && profile?.profile_type === 'artist' && (
                      <Button 
                        onClick={handleBookEvent} 
                        className="w-full"
                      >
                        Demander une réservation
                      </Button>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        )}

        {events.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun événement programmé
          </p>
        )}
      </CardContent>
    </Card>
  );
}