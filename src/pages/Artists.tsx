import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Music } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/lib/types';
import { getProfileUrl } from '@/hooks/useProfileResolver';
import FeaturedArtistsStrip from '@/components/FeaturedArtistsStrip';
import { VybbiAssistant } from "@/components/VybbiAssistant";

export default function Artists() {
  const [artists, setArtists] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('profile_type', 'artist')
        .eq('is_public', true);

      if (error) throw error;
      setArtists(data || []);
    } catch (error) {
      console.error('Error fetching artists:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArtists = artists.filter(artist =>
    artist.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.genres?.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading artists...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <FeaturedArtistsStrip />
      
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Nos Artistes</h1>
          <p className="text-muted-foreground mb-6">
            Découvrez les artistes talentueux, DJs, musiciens et performers
          </p>
          
          <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search artists, genres, or locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredArtists.map((artist) => (
          <Link key={artist.id} to={`/artists/${artist.id}`}>
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card/95 backdrop-blur-sm border border-border/50">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 mb-4 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                    <AvatarImage src={artist.avatar_url || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-semibold text-lg">
                      {artist.display_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {artist.display_name}
                  </h3>
                  
                  {artist.location && (
                    <div className="flex items-center text-muted-foreground text-sm mb-3">
                      <MapPin className="h-3 w-3 mr-1" />
                      {artist.location}
                    </div>
                  )}
                  
                  {artist.experience && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {artist.experience}
                    </p>
                  )}
                  
                  {artist.genres && artist.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {artist.genres.slice(0, 3).map((genre) => (
                        <Badge key={genre} variant="secondary" className="text-xs">
                          {genre}
                        </Badge>
                      ))}
                      {artist.genres.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{artist.genres.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredArtists.length === 0 && (
        <div className="text-center py-12">
          <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No artists found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or browse all artists
          </p>
        </div>
        )}
      </div>
      
      {/* Assistant Vybbi pour les recherches */}
      <VybbiAssistant context="recherche-artistes" variant="floating" />
    </div>
  );
}