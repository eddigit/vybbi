import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Building2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/lib/types';
import { getProfileUrl } from '@/hooks/useProfileResolver';

export default function Lieux() {
  const [lieux, setLieux] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLieux();
  }, []);

  const fetchLieux = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('profile_type', 'lieu')
        .eq('is_public', true);

      if (error) throw error;
      setLieux(data || []);
    } catch (error) {
      console.error('Error fetching lieux:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLieux = lieux.filter(lieu =>
    lieu.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lieu.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lieu.genres?.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des lieux...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Nos Lieux</h1>
        <p className="text-muted-foreground mb-6">
          Découvrez clubs, festivals, bars, restaurants et espaces événementiels
        </p>
        
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher lieux, événements ou localisations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredLieux.map((lieu) => (
          <Link key={lieu.id} to={getProfileUrl(lieu)}>
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card/95 backdrop-blur-sm border border-border/50">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 mb-4 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                    <AvatarImage src={lieu.avatar_url || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-semibold text-lg">
                      {lieu.display_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {lieu.display_name}
                  </h3>
                  
                  {lieu.location && (
                    <div className="flex items-center text-muted-foreground text-sm mb-3">
                      <MapPin className="h-3 w-3 mr-1" />
                      {lieu.location}
                    </div>
                  )}
                  
                  {lieu.bio && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {lieu.bio}
                    </p>
                  )}
                  
                  {lieu.genres && lieu.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {lieu.genres.slice(0, 3).map((genre) => (
                        <Badge key={genre} variant="secondary" className="text-xs">
                          {genre}
                        </Badge>
                      ))}
                      {lieu.genres.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{lieu.genres.length - 3}
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

      {filteredLieux.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun lieu trouvé</h3>
          <p className="text-muted-foreground">
            Essayez d'ajuster vos termes de recherche
          </p>
        </div>
      )}
    </div>
  );
}