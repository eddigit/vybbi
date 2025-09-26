import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, MapPin, Euro, User, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BookingData {
  id: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  proposed_fee: number | null;
  message: string | null;
  created_at: string;
  updated_at: string;
  artist_profile_id: string;
  venue_profile_id: string;
  event_id: string;
  artist_profile?: {
    display_name: string;
    avatar_url: string | null;
  };
  venue_profile?: {
    display_name: string;
    avatar_url: string | null;
  };
  event?: {
    title: string;
    event_date: string;
    event_time: string | null;
    location: string | null;
  };
}

export function BookingDashboard() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      // Fetch bookings with separate queries for related data
      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select(`
          id,
          status,
          proposed_fee,
          message,
          created_at,
          updated_at,
          artist_profile_id,
          venue_profile_id,
          event_id
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch related profiles and events
      const bookingsWithDetails = await Promise.all(
        (bookingsData || []).map(async (booking) => {
          const [artistProfile, venueProfile, event] = await Promise.all([
            supabase.from('profiles').select('display_name, avatar_url').eq('id', booking.artist_profile_id).single(),
            supabase.from('profiles').select('display_name, avatar_url').eq('id', booking.venue_profile_id).single(),
            supabase.from('events').select('title, event_date, event_time, location').eq('id', booking.event_id).single()
          ]);

          return {
            ...booking,
            artist_profile: artistProfile.data,
            venue_profile: venueProfile.data,
            event: event.data
          };
        })
      );

      setBookings(bookingsWithDetails);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les demandes de booking",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'cancelled': return 'Annulé';
      case 'pending': return 'En attente';
      case 'completed': return 'Terminé';
      default: return status;
    }
  };

  const filteredBookings = statusFilter === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === statusFilter);

  const getStatsCount = (status?: string) => {
    return status ? bookings.filter(b => b.status === status).length : bookings.length;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard Booking</h2>
        <Button onClick={fetchBookings} variant="outline">
          Actualiser
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setStatusFilter('all')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{getStatsCount()}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setStatusFilter('pending')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-warning">{getStatsCount('pending')}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setStatusFilter('confirmed')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmés</p>
                <p className="text-2xl font-bold text-success">{getStatsCount('confirmed')}</p>
              </div>
              <User className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setStatusFilter('rejected')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Refusés</p>
                <p className="text-2xl font-bold text-destructive">{getStatsCount('rejected')}</p>
              </div>
              <Building className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map(status => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {status === 'all' ? 'Tous' : getStatusText(status)}
            {status !== 'all' && (
              <Badge variant="secondary" className="ml-2">
                {getStatsCount(status)}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                {statusFilter === 'all' 
                  ? 'Aucune demande de booking pour le moment'
                  : `Aucune demande ${getStatusText(statusFilter).toLowerCase()}`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredBookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {booking.event?.title || 'Événement'}
                  </CardTitle>
                  <Badge className={getStatusColor(booking.status)}>
                    {getStatusText(booking.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4" />
                      <span className="font-medium">Artiste:</span>
                      {booking.artist_profile?.display_name || 'Non spécifié'}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="h-4 w-4" />
                      <span className="font-medium">Organisateur:</span>
                      {booking.venue_profile?.display_name || 'Non spécifié'}
                    </div>
                    
                    {booking.event?.event_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">Date:</span>
                        {new Date(booking.event.event_date).toLocaleDateString('fr-FR')}
                        {booking.event.event_time && ` à ${booking.event.event_time}`}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {booking.event?.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">Organisateur:</span>
                        {booking.event.location}
                      </div>
                    )}
                    
                    {booking.proposed_fee && (
                      <div className="flex items-center gap-2 text-sm">
                        <Euro className="h-4 w-4" />
                        <span className="font-medium">Cachet proposé:</span>
                        {booking.proposed_fee}€
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Créé le:</span>
                      {new Date(booking.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>

                {booking.message && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Message:</p>
                    <p className="text-sm text-muted-foreground">{booking.message}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}