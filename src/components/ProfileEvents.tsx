import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EventFlyer } from './EventFlyer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock } from 'lucide-react';
import { useEventRSVP } from '@/hooks/useEventRSVP';

interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  location?: string;
  budget_min?: number;
  budget_max?: number;
  genres?: string[];
  flyer_url?: string;
  flyer_position_y?: number;
  venue_profile?: {
    id: string;
    display_name: string;
    avatar_url?: string;
    slug?: string;
  };
}

interface ProfileEventsProps {
  profileId: string;
  profileType: 'artist' | 'lieu';
  className?: string;
}

export function ProfileEvents({ profileId, profileType, className = "" }: ProfileEventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      if (profileType === 'lieu') {
        // For venues, get all their events
        const { data: eventsData, error } = await supabase
          .from('events')
          .select(`
            id,
            title,
            description,
            event_date,
            event_time,
            location,
            budget_min,
            budget_max,
            genres,
            flyer_url,
            flyer_position_y,
            venue_profile_id
          `)
          .eq('status', 'published')
          .eq('venue_profile_id', profileId)
          .order('event_date', { ascending: false });

        if (error) throw error;

        // Get venue profile info
        const { data: venueProfile } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, slug')
          .eq('id', profileId)
          .single();

        const events: Event[] = (eventsData || []).map(event => ({
          ...event,
          venue_profile: venueProfile || undefined
        }));

        setEvents(events);
      } else {
        // For artists, get all events where they have confirmed bookings
        const { data: bookings } = await supabase
          .from('bookings')
          .select('event_id')
          .eq('artist_profile_id', profileId)
          .eq('status', 'confirmed');

        if (bookings && bookings.length > 0) {
          const eventIds = bookings.map(b => b.event_id);
          const { data: eventsData, error } = await supabase
            .from('events')
            .select(`
              id,
              title,
              description,
              event_date,
              event_time,
              location,
              budget_min,
              budget_max,
              genres,
              flyer_url,
              flyer_position_y,
              venue_profile_id
            `)
            .eq('status', 'published')
            .in('id', eventIds)
            .order('event_date', { ascending: false });

          if (error) throw error;

          // Get venue profiles for all events
          if (eventsData && eventsData.length > 0) {
            const venueIds = [...new Set(eventsData.map(e => e.venue_profile_id))];
            const { data: venueProfiles } = await supabase
              .from('profiles')
              .select('id, display_name, avatar_url, slug')
              .in('id', venueIds);

            const venueProfileMap = new Map(
              (venueProfiles || []).map(profile => [profile.id, profile])
            );

            const events: Event[] = eventsData.map(event => ({
              ...event,
              venue_profile: venueProfileMap.get(event.venue_profile_id) || undefined
            }));

            setEvents(events);
          } else {
            setEvents([]);
          }
        } else {
          // No confirmed bookings, return empty array
          setEvents([]);
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [profileId, profileType]);

  const today = new Date().toISOString().split('T')[0];
  const upcomingEvents = events.filter(event => event.event_date >= today);
  const pastEvents = events.filter(event => event.event_date < today);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Événements</h3>
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-lg h-96"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Événements</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>
            {profileType === 'lieu' 
              ? "Aucun événement organisé pour le moment"
              : "Aucun événement confirmé pour le moment"
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Événements</h3>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'upcoming' | 'past')}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            À venir ({upcomingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Passés ({pastEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-6">
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucun événement à venir</p>
            </div>
          ) : (
            upcomingEvents.map((event) => (
              <EventFlyerWithRSVP 
                key={event.id} 
                event={event}
                artist={profileType === 'lieu' ? undefined : {
                  id: profileId,
                  display_name: '',  // Will be filled by parent component if needed
                  avatar_url: '',
                  slug: ''
                }}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-6">
          {pastEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucun événement passé</p>
            </div>
          ) : (
            pastEvents.map((event) => (
              <EventFlyerWithRSVP 
                key={event.id} 
                event={event}
                artist={profileType === 'lieu' ? undefined : {
                  id: profileId,
                  display_name: '',
                  avatar_url: '',
                  slug: ''
                }}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Wrapper component to handle RSVP data
function EventFlyerWithRSVP({ event, artist }: { event: Event; artist?: any }) {
  const { attendeesCount, userStatus, refetch } = useEventRSVP(event.id);

  return (
    <EventFlyer
      event={event}
      artist={artist}
      attendeesCount={attendeesCount}
      userStatus={userStatus}
      onStatusChange={refetch}
    />
  );
}