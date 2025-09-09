import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, MessageSquare, ExternalLink, Calendar, Users, Music } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';

export default function VenueProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [venue, setVenue] = useState<Profile | null>(null);
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
        .single();
      
      if (data) {
        setVenue(data);
      }
    } catch (error) {
      console.error('Error fetching venue:', error);
    } finally {
      setLoading(false);
    }
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          <Avatar className="w-32 h-32 mx-auto lg:mx-0">
            <AvatarImage src={venue.avatar_url || ''} />
            <AvatarFallback className="text-4xl bg-gradient-primary text-white">
              {venue.display_name ? venue.display_name.charAt(0).toUpperCase() : <Calendar className="h-16 w-16" />}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl font-bold mb-2">{venue.display_name}</h1>
            
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-4">
              <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                <Calendar className="w-4 h-4 mr-1" />
                Lieu
              </Badge>
            </div>
            
            {venue.location && (
              <div className="flex items-center gap-2 justify-center lg:justify-start text-muted-foreground mb-4">
                <MapPin className="w-4 h-4" />
                <span>{venue.location}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2 w-full lg:w-auto">
            {user ? (
              user.id !== venue.user_id && (
                <Button asChild className="w-full">
                  <Link to={`/messages?contact=${venue.user_id}`} className="flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Contacter
                  </Link>
                </Button>
              )
            ) : (
              <Button asChild className="w-full">
                <Link to="/auth" className="flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Créer un compte pour contacter
                </Link>
              </Button>
            )}
            
            {venue.website && (
              <Button variant="outline" asChild className="w-full">
                <a href={venue.website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Site web
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
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

          {/* Genres */}
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
                  {venue.genres.map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experience */}
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
                  <Link to="/auth" className="flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Créer un compte pour contacter
                  </Link>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}