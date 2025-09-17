import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, MapPin, Euro, User, Building2, Music, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface BookingData {
  id: string;
  status: 'pending' | 'cancelled' | 'confirmed' | 'completed';
  proposed_fee: number | null;
  message: string | null;
  created_at: string;
  updated_at: string;
  artist_profile: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    profile_type: string;
  } | null;
  venue_profile: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    profile_type: string;
  } | null;
  event: {
    id: string;
    title: string;
    event_date: string;
    event_time: string | null;
    location: string | null;
    genres: string[] | null;
  } | null;
}

interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  today: number;
  this_week: number;
}

export function BookingMonitoringDashboard() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);

  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          artist_profile:profiles!bookings_artist_profile_id_fkey(
            id, display_name, avatar_url, profile_type
          ),
          venue_profile:profiles!bookings_venue_profile_id_fkey(
            id, display_name, avatar_url, profile_type
          ),
          event:events(
            id, title, event_date, event_time, location, genres
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setBookings((data as any) || []);
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

  const fetchStats = async () => {
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const weekStart = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('bookings')
        .select('status, created_at');

      if (error) throw error;

      const stats: BookingStats = {
        total: data.length,
        pending: data.filter(b => b.status === 'pending').length,
        confirmed: data.filter(b => b.status === 'confirmed').length,
        cancelled: data.filter(b => b.status === 'cancelled').length,
        today: data.filter(b => b.created_at.split('T')[0] === today).length,
        this_week: data.filter(b => b.created_at.split('T')[0] >= weekStart).length
      };

      setStats(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'cancelled': return 'Annulé';
      case 'pending': return 'En attente';
      case 'completed': return 'Terminé';
      default: return status;
    }
  };

  const filteredBookings = selectedStatus === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === selectedStatus);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-12 bg-muted rounded"></div>
              <div className="h-12 bg-muted rounded"></div>
              <div className="h-12 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">En attente</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Confirmées</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Annulées</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Aujourd'hui</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{stats.today}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Cette semaine</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{stats.this_week}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Demandes de Booking
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={selectedStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('all')}
            >
              Toutes
            </Button>
            <Button
              variant={selectedStatus === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('pending')}
            >
              En attente
            </Button>
            <Button
              variant={selectedStatus === 'confirmed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('confirmed')}
            >
              Confirmées
            </Button>
            <Button
              variant={selectedStatus === 'cancelled' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('cancelled')}
            >
              Annulées
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredBookings.map((booking) => (
              <Dialog key={booking.id}>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex -space-x-2">
                            {booking.artist_profile?.avatar_url ? (
                              <img 
                                src={booking.artist_profile.avatar_url} 
                                alt={booking.artist_profile.display_name}
                                className="w-8 h-8 rounded-full border-2 border-background"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center">
                                <User className="h-4 w-4" />
                              </div>
                            )}
                            {booking.venue_profile?.avatar_url ? (
                              <img 
                                src={booking.venue_profile.avatar_url} 
                                alt={booking.venue_profile.display_name}
                                className="w-8 h-8 rounded-full border-2 border-background"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-secondary/10 border-2 border-background flex items-center justify-center">
                                <Building2 className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">
                              {booking.artist_profile?.display_name || 'Artiste'} → {booking.venue_profile?.display_name || 'Lieu'}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Music className="h-3 w-3" />
                                {booking.event?.title || 'Événement'}
                              </span>
                              {booking.event?.event_date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(booking.event.event_date), 'dd MMM yyyy', { locale: fr })}
                                </span>
                              )}
                              {booking.proposed_fee && (
                                <span className="flex items-center gap-1">
                                  <Euro className="h-3 w-3" />
                                  {booking.proposed_fee}€
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(booking.status)}>
                            {getStatusLabel(booking.status)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(booking.created_at), 'dd/MM HH:mm')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Détails de la demande de booking</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    {/* Participants */}
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Artiste
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-3">
                            {booking.artist_profile.avatar_url && (
                              <img 
                                src={booking.artist_profile.avatar_url} 
                                alt={booking.artist_profile.display_name}
                                className="w-10 h-10 rounded-full"
                              />
                            )}
                            <div>
                              <p className="font-medium">{booking.artist_profile.display_name}</p>
                              <p className="text-sm text-muted-foreground capitalize">
                                {booking.artist_profile.profile_type}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Lieu
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-3">
                            {booking.venue_profile.avatar_url && (
                              <img 
                                src={booking.venue_profile.avatar_url} 
                                alt={booking.venue_profile.display_name}
                                className="w-10 h-10 rounded-full"
                              />
                            )}
                            <div>
                              <p className="font-medium">{booking.venue_profile.display_name}</p>
                              <p className="text-sm text-muted-foreground capitalize">
                                {booking.venue_profile.profile_type}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Événement */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Music className="h-4 w-4" />
                          Événement
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="font-medium">{booking.event.title}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(booking.event.event_date), 'dd MMMM yyyy', { locale: fr })}
                          </div>
                          {booking.event.event_time && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {booking.event.event_time}
                            </div>
                          )}
                          {booking.event.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {booking.event.location}
                            </div>
                          )}
                          {booking.proposed_fee && (
                            <div className="flex items-center gap-2">
                              <Euro className="h-4 w-4" />
                              {booking.proposed_fee}€ proposés
                            </div>
                          )}
                        </div>
                        
                        {booking.event.genres && booking.event.genres.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-2">
                            {booking.event.genres.map((genre, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {genre}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    {/* Message */}
                    {booking.message && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Message</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm whitespace-pre-wrap">{booking.message}</p>
                        </CardContent>
                      </Card>
                    )}
                    
                    {/* Statut et dates */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Informations</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Statut:</span>
                          <Badge className={getStatusColor(booking.status)}>
                            {getStatusLabel(booking.status)}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Créé le:</span>
                          <span>{format(new Date(booking.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Dernière mise à jour:</span>
                          <span>{format(new Date(booking.updated_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
            
            {filteredBookings.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune demande de booking trouvée</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}