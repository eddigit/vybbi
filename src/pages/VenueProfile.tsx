import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, MessageSquare, ExternalLink, Calendar, Users, Music, Building2, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ProfileEvents } from '@/components/ProfileEvents';
import { VenueGallery } from '@/components/VenueGallery';
import { VenueCalendar } from '@/components/VenueCalendar';
import { VenuePartners } from '@/components/VenuePartners';
import { VenueTalentHistory } from '@/components/VenueTalentHistory';

interface VenueProfileProps {
  venueId?: string;
}

export default function VenueProfile({ venueId }: VenueProfileProps = {}) {
  const { id: paramId } = useParams<{ id: string }>();
  const id = venueId || paramId;
  const { user, profile } = useAuth();
  const [venue, setVenue] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchVenue();
    }
  }, [id]);

  const fetchVenue = async () => {
    try {
      const { data } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', id)
        .eq('profile_type', 'lieu')
        .maybeSingle();
      
      if (data) {
        setVenue(data);
      }
    } catch (error) {
      console.error('Error fetching venue:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories = {
      'bar': 'Bar',
      'club': 'Club',
      'salle_concert': 'Salle de concert',
      'restaurant': 'Restaurant',
      'cafe_concert': 'Café-concert',
      'festival': 'Festival',
      'theatre': 'Théâtre',
      'centre_culturel': 'Centre culturel',
      'autre': 'Autre'
    };
    return categories[category as keyof typeof categories] || category;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Lieu non trouvé</h1>
        <Link to="/lieux">
          <Button>Retour aux lieux</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header Section with Cover Image */}
      <div 
        className="relative h-64 md:h-80 rounded-xl mb-8 overflow-hidden"
        style={{
          backgroundImage: (venue as any).header_url 
            ? `url(${(venue as any).header_url})` 
            : 'linear-gradient(to right, rgba(var(--primary) / 0.2), rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))',
          backgroundSize: 'cover',
          backgroundPosition: (venue as any).header_url 
            ? `center ${(venue as any).header_position_y || 50}%`
            : 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-6 left-6 flex items-end gap-6">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 ring-4 ring-white/20">
            <AvatarImage src={venue.avatar_url || ''} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary-foreground text-white text-2xl font-bold">
              {venue.display_name ? venue.display_name.charAt(0).toUpperCase() : <Building2 className="h-16 w-16" />}
            </AvatarFallback>
          </Avatar>
          <div className="text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{venue.display_name}</h1>
            <div className="flex items-center gap-4 text-white/80">
              {venue.city && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {venue.city}
                </div>
              )}
              {venue.location && (
                <span className="text-sm">{venue.location}</span>
              )}
            </div>
            
            {/* Venue info badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5 text-sm font-medium">
                <Building2 className="w-4 h-4" />
                <span>{venue.venue_category ? getCategoryLabel(venue.venue_category) : 'Lieu'}</span>
              </div>
              {venue.venue_capacity && (
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5 text-sm font-medium">
                  <UserCheck className="w-4 h-4" />
                  <span>{venue.venue_capacity} personnes</span>
                </div>
              )}
              {venue.genres && venue.genres.length > 0 && (
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5 text-sm font-medium">
                  <Music className="w-4 h-4" />
                  <span>{venue.genres.slice(0, 2).join(', ')}{venue.genres.length > 2 ? '...' : ''}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Action buttons in header */}
        <div className="absolute top-6 right-6 flex gap-2">
          {user ? (
            user.id !== venue.user_id && (
              <Button asChild>
                <Link to={`/messages?contact=${venue.user_id}`} className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Contacter
                </Link>
              </Button>
            )
          ) : (
            <Button asChild>
              <Link to="/auth?tab=signup" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Créer un compte
              </Link>
            </Button>
          )}
          
          {venue.website && (
            <Button variant="outline" asChild className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <a href={venue.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Site web
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contenu principal */}
        <div className="lg:col-span-2 space-y-8">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="about">À propos</TabsTrigger>
              <TabsTrigger value="events">
                <Calendar className="h-4 w-4 mr-2" />
                Événements
              </TabsTrigger>
              <TabsTrigger value="gallery">
                <Users className="h-4 w-4 mr-2" />
                Galerie
              </TabsTrigger>
              <TabsTrigger value="partners">Partenaires</TabsTrigger>
              <TabsTrigger value="talents">Talents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="space-y-6">
              {/* Informations principales */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations principales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {venue.venue_category && (
                      <div>
                        <h4 className="font-medium mb-1">Type d'établissement</h4>
                        <p className="text-sm text-muted-foreground">{getCategoryLabel(venue.venue_category)}</p>
                      </div>
                    )}
                    {venue.venue_capacity && (
                      <div>
                        <h4 className="font-medium mb-1">Capacité d'accueil</h4>
                        <p className="text-sm text-muted-foreground">{venue.venue_capacity} personnes</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* À propos */}
              {venue.bio && (
                <Card>
                  <CardHeader>
                    <CardTitle>À propos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{venue.bio}</p>
                  </CardContent>
                </Card>
              )}

              {/* Styles musicaux */}
              {venue.genres && venue.genres.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Music className="w-5 h-5" />
                      Styles musicaux accueillis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {venue.genres.map((genre, index) => (
                        <Badge key={index} variant="secondary">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Informations complémentaires */}
              {venue.experience && (
                <Card>
                  <CardHeader>
                    <CardTitle>Informations complémentaires</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{venue.experience}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="events">
              <ProfileEvents 
                profileId={venue.id}
                profileType="lieu"
              />
            </TabsContent>

            <TabsContent value="gallery">
              <VenueGallery 
                venueProfileId={venue.id} 
                isOwner={!!user && profile?.id === venue.id}
              />
            </TabsContent>

            <TabsContent value="partners">
              <VenuePartners venueProfileId={venue.id} />
            </TabsContent>

            <TabsContent value="talents">
              <VenueTalentHistory venueProfileId={venue.id} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Informations de contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {venue.city && (
                <div>
                  <h4 className="font-medium mb-1">Ville</h4>
                  <p className="text-sm text-muted-foreground">{venue.city}</p>
                </div>
              )}
              
              {venue.location && (
                <div>
                  <h4 className="font-medium mb-1">Adresse</h4>
                  <p className="text-sm text-muted-foreground">{venue.location}</p>
                </div>
              )}
              
              {venue.website && (
                <div>
                  <h4 className="font-medium mb-1">Site web</h4>
                  <a 
                    href={venue.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline break-all"
                  >
                    {venue.website}
                  </a>
                </div>
              )}
              
              <Button asChild className="w-full" size="sm">
                {user ? (
                  <Link to={`/messages?contact=${venue.user_id}`} className="flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Envoyer un message
                  </Link>
                ) : (
                  <Link to="/auth?tab=signup" className="flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Créer un compte pour contacter
                  </Link>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Calendar Widget */}
          <VenueCalendar 
            venueProfileId={venue.id} 
            showBookingButton={!!user && profile?.profile_type === 'artist'}
          />
        </div>
      </div>
    </div>
  );
}