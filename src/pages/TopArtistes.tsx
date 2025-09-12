import { useState, useEffect } from 'react';
import { Trophy, Star, Play, TrendingUp, Filter, Music, Users, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

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
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [allGenres, setAllGenres] = useState<string[]>([]);

  useEffect(() => {
    fetchTopArtists();
    fetchGenres();
  }, [selectedGenre]);

  const fetchTopArtists = async () => {
    try {
      const { data, error } = await supabase.rpc('get_top_artists', {
        limit_count: 50,
        genre_filter: selectedGenre === 'all' ? null : selectedGenre
      });

      if (error) throw error;
      setArtists(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement du Top 50:', error);
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

      const genreSet = new Set<string>();
      data?.forEach(profile => {
        profile.genres?.forEach((genre: string) => genreSet.add(genre));
      });

      setAllGenres(Array.from(genreSet).sort());
    } catch (error) {
      console.error('Erreur lors du chargement des genres:', error);
    }
  };

  const getPodiumIcon = (position: number) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return position;
    }
  };

  const getRankingColor = (position: number) => {
    switch (position) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-300 to-gray-500';
      case 3: return 'from-orange-300 to-orange-500';
      default: return 'from-muted to-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Top 50 Artistes
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Découvrez les artistes les plus talentueux et populaires de Radio Vybbi, 
          classés selon leurs écoutes, évaluations professionnelles et activité.
        </p>

        {/* Genre Filter */}
        <div className="flex items-center justify-center gap-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrer par genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les genres</SelectItem>
              {allGenres.map(genre => (
                <SelectItem key={genre} value={genre}>{genre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Top 3 Podium */}
      {artists.length >= 3 && (
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* 2nd Place */}
          <Card className="relative overflow-hidden border-2 border-gray-300 shadow-lg">
            <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${getRankingColor(2)}`}></div>
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">🥈</div>
              <Avatar className="h-20 w-20 mx-auto mb-4 ring-4 ring-gray-300">
                <AvatarImage src={artists[1].avatar_url || ''} />
                <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-primary to-primary-foreground text-white">
                  {artists[1].display_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-lg mb-2">{artists[1].display_name}</h3>
              {artists[1].location && (
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mb-2">
                  <MapPin className="h-3 w-3" />
                  {artists[1].location}
                </p>
              )}
              <div className="flex items-center justify-center gap-2 mb-3">
                <Play className="h-4 w-4 text-primary" />
                <span className="text-sm">{artists[1].total_plays.toLocaleString()} écoutes</span>
              </div>
              {artists[1].overall_score > 0 && (
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{artists[1].overall_score.toFixed(1)}/5</span>
                  <span className="text-xs text-muted-foreground">({artists[1].total_reviews})</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 1st Place - Larger */}
          <Card className="relative overflow-hidden border-2 border-yellow-400 shadow-xl transform md:-translate-y-6">
            <div className={`absolute top-0 left-0 right-0 h-3 bg-gradient-to-r ${getRankingColor(1)}`}></div>
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🥇</div>
              <Avatar className="h-24 w-24 mx-auto mb-4 ring-4 ring-yellow-400">
                <AvatarImage src={artists[0].avatar_url || ''} />
                <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary to-primary-foreground text-white">
                  {artists[0].display_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-xl mb-2">{artists[0].display_name}</h3>
              {artists[0].location && (
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mb-3">
                  <MapPin className="h-3 w-3" />
                  {artists[0].location}
                </p>
              )}
              <div className="flex items-center justify-center gap-2 mb-3">
                <Play className="h-4 w-4 text-primary" />
                <span>{artists[0].total_plays.toLocaleString()} écoutes</span>
              </div>
              {artists[0].overall_score > 0 && (
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{artists[0].overall_score.toFixed(1)}/5</span>
                  <span className="text-sm text-muted-foreground">({artists[0].total_reviews})</span>
                </div>
              )}
              <Badge className="mt-2 bg-yellow-400 text-yellow-900 hover:bg-yellow-500">
                Champion Radio Vybbi
              </Badge>
            </CardContent>
          </Card>

          {/* 3rd Place */}
          <Card className="relative overflow-hidden border-2 border-orange-400 shadow-lg">
            <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${getRankingColor(3)}`}></div>
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">🥉</div>
              <Avatar className="h-20 w-20 mx-auto mb-4 ring-4 ring-orange-300">
                <AvatarImage src={artists[2].avatar_url || ''} />
                <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-primary to-primary-foreground text-white">
                  {artists[2].display_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-lg mb-2">{artists[2].display_name}</h3>
              {artists[2].location && (
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mb-2">
                  <MapPin className="h-3 w-3" />
                  {artists[2].location}
                </p>
              )}
              <div className="flex items-center justify-center gap-2 mb-3">
                <Play className="h-4 w-4 text-primary" />
                <span className="text-sm">{artists[2].total_plays.toLocaleString()} écoutes</span>
              </div>
              {artists[2].overall_score > 0 && (
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{artists[2].overall_score.toFixed(1)}/5</span>
                  <span className="text-xs text-muted-foreground">({artists[2].total_reviews})</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Full Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Classement Complet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {artists.map((artist, index) => (
            <div 
              key={artist.profile_id} 
              className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/30 transition-colors"
            >
              {/* Ranking */}
              <div className="flex-shrink-0 w-12 text-center">
                <span className="text-2xl font-bold text-muted-foreground">
                  {getPodiumIcon(index + 1)}
                </span>
              </div>

              {/* Avatar */}
              <Avatar className="h-12 w-12">
                <AvatarImage src={artist.avatar_url || ''} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary-foreground text-white">
                  {artist.display_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              {/* Artist Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-lg">{artist.display_name}</h4>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {artist.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {artist.location}
                    </span>
                  )}
                  {artist.genres && artist.genres.length > 0 && (
                    <div className="flex gap-1">
                      {artist.genres.slice(0, 3).map(genre => (
                        <Badge key={genre} variant="outline" className="text-xs">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Statistics */}
              <div className="flex flex-col sm:flex-row gap-4 text-sm">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-primary">
                    <Play className="h-3 w-3" />
                    <span className="font-medium">{artist.total_plays.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">écoutes</div>
                </div>
                
                {artist.overall_score > 0 && (
                  <div className="text-center">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{artist.overall_score.toFixed(1)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{artist.total_reviews} avis</div>
                  </div>
                )}
                
                <div className="text-center">
                  <div className="font-medium text-primary">{artist.combined_score.toFixed(0)} pts</div>
                  <div className="text-xs text-muted-foreground">score total</div>
                </div>
              </div>

              {/* View Profile Button */}
              <Button asChild variant="outline" size="sm">
                <Link to={`/artists/${artist.profile_id}`}>
                  Voir profil
                </Link>
              </Button>
            </div>
          ))}

          {artists.length === 0 && (
            <div className="text-center py-12">
              <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun artiste trouvé</h3>
              <p className="text-muted-foreground">
                {selectedGenre === 'all' 
                  ? "Le classement est en cours de construction." 
                  : `Aucun artiste trouvé pour le genre "${selectedGenre}".`
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}