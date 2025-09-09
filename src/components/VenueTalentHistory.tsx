import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Music, Calendar, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ArtistHistory {
  id: string;
  artist_profile_id: string;
  performance_date: string | null;
  event_title: string | null;
  description: string | null;
  artist: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    bio: string | null;
    city: string | null;
    genres: string[] | null;
    profile_type: string;
  };
}

interface VenueTalentHistoryProps {
  venueProfileId: string;
}

export function VenueTalentHistory({ venueProfileId }: VenueTalentHistoryProps) {
  const [artistHistory, setArtistHistory] = useState<ArtistHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchArtistHistory();
  }, [venueProfileId]);

  const fetchArtistHistory = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('venue_artist_history')
        .select(`
          *,
          artist:artist_profile_id (
            id,
            display_name,
            avatar_url,
            bio,
            city,
            genres,
            profile_type
          )
        `)
        .eq('venue_profile_id', venueProfileId)
        .eq('is_visible', true)
        .order('performance_date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArtistHistory((data as any) || []);
    } catch (error) {
      console.error('Error fetching artist history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Nos talents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-32 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (artistHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Nos talents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun artiste référencé pour le moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  const displayedArtists = showAll ? artistHistory : artistHistory.slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Nos talents ({artistHistory.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {displayedArtists.map((history) => (
            <div key={history.id} className="flex items-start gap-3 p-3 border rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarImage src={history.artist.avatar_url || ''} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary-foreground text-white text-sm">
                  {history.artist.display_name ? 
                    history.artist.display_name.charAt(0).toUpperCase() : 
                    <User className="h-5 w-5" />
                  }
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm truncate">
                    {history.artist.display_name}
                  </h4>
                </div>
                
                {history.performance_date && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(history.performance_date), 'MMM yyyy', { locale: fr })}
                  </div>
                )}
                
                {history.event_title && (
                  <p className="text-xs text-muted-foreground mb-1 truncate">
                    {history.event_title}
                  </p>
                )}
                
                {history.artist.genres && history.artist.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {history.artist.genres.slice(0, 2).map((genre, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <Button asChild size="sm" variant="outline" className="h-6 text-xs w-full">
                  <Link to={`/artists/${history.artist.id}`}>
                    Voir le profil
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {artistHistory.length > 6 && (
          <div className="text-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Voir moins' : `Voir tous les talents (${artistHistory.length})`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}