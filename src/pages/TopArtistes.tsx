import { useState, useEffect } from 'react';
import { Search, Star, MapPin, Trophy, TrendingUp, Users, Music, Crown, Medal } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { getProfileUrl } from '@/hooks/useProfileResolver';
import { VybbiAssistant } from "@/components/VybbiAssistant";
import { SEOHead } from '@/components/SEOHead';

interface TopArtist {
  profile_id: string;
  display_name: string;
  avatar_url: string | null;
  location: string | null;
  genres: string[] | null;
  total_plays: number;
  avg_talent_score: number;
  avg_professionalism_score: number;
  avg_communication_score: number;
  overall_score: number;
  total_reviews: number;
  combined_score: number;
}

export default function TopArtistes() {
  const [artists, setArtists] = useState<TopArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [genres, setGenres] = useState<string[]>([]);

  useEffect(() => {
    fetchTopArtists();
    fetchGenres();
  }, [selectedGenre]);

  const fetchTopArtists = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_top_artists', { 
          limit_count: 50,
          genre_filter: selectedGenre === 'all' ? null : selectedGenre
        });

      if (error) throw error;
      setArtists(data || []);
    } catch (error) {
      console.error('Error fetching top artists:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('genres')
        .eq('profile_type', 'artist')
        .eq('is_public', true)
        .not('genres', 'is', null);

      if (error) throw error;
      
      // Extract unique genres
      const allGenres = new Set<string>();
      data?.forEach(profile => {
        profile.genres?.forEach(genre => allGenres.add(genre));
      });
      
      setGenres(Array.from(allGenres).sort());
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const filteredArtists = artists.filter(artist =>
    artist.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.genres?.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <Trophy className="h-4 w-4 text-primary" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return "bg-gradient-to-br from-yellow-400/20 to-yellow-500/5 border-yellow-500/30";
      case 2: return "bg-gradient-to-br from-gray-400/20 to-gray-500/5 border-gray-500/30";
      case 3: return "bg-gradient-to-br from-amber-600/20 to-amber-500/5 border-amber-500/30";
      default: return "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du classement...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="Top Artistes - Classement des Meilleurs Talents Musicaux"
        description="Découvrez le classement des meilleurs artistes, DJs et musiciens les mieux notés. Talents émergents et confirmés classés par qualité, professionnalisme et popularité."
      />
      
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Top Artistes</h1>
          </div>
          <p className="text-muted-foreground mb-6">
            Découvrez les artistes les mieux notés et les plus populaires de la plateforme
          </p>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher un artiste, genre, ville..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Music className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrer par genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les genres</SelectItem>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-background to-muted/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-foreground">{filteredArtists.length}</div>
                <div className="text-sm text-muted-foreground">Artistes classés</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-700">
                  {genres.length}
                </div>
                <div className="text-sm text-muted-foreground">Genres musicaux</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-700">
                  {artists.filter(a => a.total_reviews > 0).length}
                </div>
                <div className="text-sm text-muted-foreground">Avec avis</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-700">
                  {artists.filter(a => a.total_plays > 0).length}
                </div>
                <div className="text-sm text-muted-foreground">Avec écoutes</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Artists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtists.map((artist, index) => (
            <Link key={artist.profile_id} to={getProfileUrl({ profile_type: 'artist', id: artist.profile_id })}>
              <Card className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border ${getRankColor(index + 1)}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    {/* Rank */}
                    <div className="flex items-center gap-2 mb-4">
                      {getRankIcon(index + 1)}
                      <span className="text-lg font-bold text-foreground">#{index + 1}</span>
                    </div>

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
                    
                    {/* Scores */}
                    <div className="grid grid-cols-2 gap-2 w-full mb-4">
                      {artist.overall_score > 0 && (
                        <div className="text-center">
                          <div className="text-sm font-medium text-primary">
                            {artist.overall_score.toFixed(1)}/5
                          </div>
                          <div className="text-xs text-muted-foreground">Note moyenne</div>
                        </div>
                      )}
                      {artist.total_plays > 0 && (
                        <div className="text-center">
                          <div className="text-sm font-medium text-green-600">
                            {artist.total_plays}
                          </div>
                          <div className="text-xs text-muted-foreground">Écoutes</div>
                        </div>
                      )}
                    </div>
                    
                    {/* Score breakdown */}
                    {artist.total_reviews > 0 && (
                      <div className="w-full mb-4">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-muted-foreground">Talent</span>
                          <span className="font-medium">{artist.avg_talent_score.toFixed(1)}/5</span>
                        </div>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-muted-foreground">Professionnalisme</span>
                          <span className="font-medium">{artist.avg_professionalism_score.toFixed(1)}/5</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Communication</span>
                          <span className="font-medium">{artist.avg_communication_score.toFixed(1)}/5</span>
                        </div>
                      </div>
                    )}
                    
                    {artist.genres && artist.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1 justify-center mb-4">
                        {artist.genres.slice(0, 2).map((genre) => (
                          <Badge key={genre} variant="secondary" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                        {artist.genres.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{artist.genres.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Reviews count */}
                    {artist.total_reviews > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Basé sur {artist.total_reviews} avis
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
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun artiste trouvé</h3>
            <p className="text-muted-foreground">
              Essayez d'ajuster vos critères de recherche ou de filtrage
            </p>
          </div>
        )}
      </div>
      
      {/* Assistant Vybbi */}
      <VybbiAssistant context="top-artistes" variant="floating" />
    </>
  );
}