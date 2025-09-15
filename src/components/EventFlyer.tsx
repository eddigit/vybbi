import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MapPin, Users, Clock, Euro } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EventFlyerProps {
  event: {
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
  };
  artist?: {
    id: string;
    display_name: string;
    avatar_url?: string;
    slug?: string;
  };
  attendeesCount?: number;
  userStatus?: 'attending' | 'not_attending' | null;
  onStatusChange?: () => void;
  className?: string;
}

export function EventFlyer({ 
  event, 
  artist, 
  attendeesCount = 0, 
  userStatus, 
  onStatusChange,
  className = "" 
}: EventFlyerProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleRSVP = async (status: 'attending' | 'not_attending') => {
    if (!user) {
      toast.error("Vous devez être connecté pour répondre à cet événement");
      return;
    }

    setLoading(true);
    try {
      if (userStatus === status) {
        // Remove RSVP if same status
        const { error } = await supabase
          .from('event_attendees')
          .delete()
          .eq('event_id', event.id)
          .eq('user_id', user.id);

        if (error) throw error;
        toast.success("Votre réponse a été supprimée");
      } else {
        // Upsert RSVP
        const { error } = await supabase
          .from('event_attendees')
          .upsert({
            event_id: event.id,
            user_id: user.id,
            status: status
          });

        if (error) throw error;
        toast.success(status === 'attending' ? "Vous participez à cet événement !" : "Vous ne participez pas à cet événement");
      }

      onStatusChange?.();
    } catch (error) {
      console.error('Error updating RSVP:', error);
      toast.error("Erreur lors de la mise à jour de votre réponse");
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = () => {
    const date = parseISO(event.event_date);
    return format(date, 'EEEE d MMMM yyyy', { locale: fr });
  };

  const formatBudget = () => {
    if (event.budget_min && event.budget_max) {
      return `${event.budget_min}€ - ${event.budget_max}€`;
    } else if (event.budget_min) {
      return `À partir de ${event.budget_min}€`;
    } else if (event.budget_max) {
      return `Jusqu'à ${event.budget_max}€`;
    }
    return null;
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Flyer Image */}
      {event.flyer_url && (
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img
            src={event.flyer_url}
            alt={`Flyer ${event.title}`}
            className="w-full h-full object-cover"
            style={{
              objectPosition: `center ${event.flyer_position_y || 50}%`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Event title overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{event.title}</h3>
            {event.genres && event.genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {event.genres.slice(0, 3).map((genre) => (
                  <Badge key={genre} variant="secondary" className="text-xs">
                    {genre}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <CardContent className="p-6">
        {/* Title if no flyer */}
        {!event.flyer_url && (
          <div className="mb-4">
            <h3 className="text-xl md:text-2xl font-bold mb-2">{event.title}</h3>
            {event.genres && event.genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {event.genres.map((genre) => (
                  <Badge key={genre} variant="secondary" className="text-xs">
                    {genre}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Event Info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="capitalize">{formatEventDate()}</span>
            {event.event_time && (
              <>
                <Clock className="h-4 w-4 ml-2" />
                <span>{event.event_time}</span>
              </>
            )}
          </div>

          {event.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          )}

          {formatBudget() && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Euro className="h-4 w-4" />
              <span>{formatBudget()}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{attendeesCount} participant{attendeesCount !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Venue and Artist Info */}
        <div className="space-y-3 mb-6">
          {event.venue_profile && (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={event.venue_profile.avatar_url} />
                <AvatarFallback>{event.venue_profile.display_name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Organisé par</p>
                <p className="text-sm text-muted-foreground">{event.venue_profile.display_name}</p>
              </div>
            </div>
          )}

          {artist && (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={artist.avatar_url} />
                <AvatarFallback>{artist.display_name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Avec</p>
                <p className="text-sm text-muted-foreground">{artist.display_name}</p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-sm text-muted-foreground mb-6 line-clamp-3">
            {event.description}
          </p>
        )}

        {/* RSVP Buttons */}
        {user && (
          <div className="flex gap-2">
            <Button
              onClick={() => handleRSVP('attending')}
              disabled={loading}
              variant={userStatus === 'attending' ? "default" : "outline"}
              className="flex-1"
            >
              {userStatus === 'attending' ? "J'y serai ✓" : "J'y serai"}
            </Button>
            <Button
              onClick={() => handleRSVP('not_attending')}
              disabled={loading}
              variant={userStatus === 'not_attending' ? "destructive" : "outline"}  
              className="flex-1"
            >
              {userStatus === 'not_attending' ? "Je n'y serai pas ✓" : "Je n'y serai pas"}
            </Button>
          </div>
        )}

        {!user && (
          <p className="text-center text-sm text-muted-foreground">
            Connectez-vous pour répondre à cet événement
          </p>
        )}
      </CardContent>
    </Card>
  );
}