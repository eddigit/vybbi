import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Filter, Bot, MapPin, Calendar, DollarSign, Star, Music, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { SEOHead } from '@/components/SEOHead';

interface SearchResult {
  id: string;
  type: 'profile' | 'event' | 'annonce';
  title: string;
  description: string;
  avatar?: string;
  location?: string;
  genres?: string[];
  score?: number;
  metadata?: any;
}

export default function RechercheAvancee() {
  const { toast } = useToast();
  const [naturalQuery, setNaturalQuery] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    genre: '',
    location: '',
    dateFrom: '',
    dateTo: '',
    budgetMin: '',
    budgetMax: ''
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [vybbiResponse, setVybbiResponse] = useState('');

  const genres = [
    'Électro', 'Techno', 'House', 'Trance', 'Dubstep', 'Drum & Bass',
    'Hip-Hop', 'Rap', 'R&B', 'Pop', 'Rock', 'Jazz', 'Reggae', 'Afrobeat'
  ];

  const searchTypes = [
    { value: 'artist', label: 'Artistes' },
    { value: 'agent', label: 'Agents' },
    { value: 'manager', label: 'Managers' },
    { value: 'lieu', label: 'Lieux' },
    { value: 'event', label: 'Événements' },
    { value: 'annonce', label: 'Annonces' }
  ];

  const handleVybbiSearch = async () => {
    if (!naturalQuery.trim()) {
      toast({
        title: "Erreur",
        description: "Merci de saisir une recherche",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    setResults([]);
    setVybbiResponse('');

    try {
      const searchQuery = naturalQuery + (Object.values(filters).some(f => f) ? 
        ` | Filtres: ${JSON.stringify(filters)}` : '');

      const { data, error } = await supabase.functions.invoke('vybbi-ai', {
        body: {
          message: searchQuery,
          action: 'search',
          filters
        }
      });

      if (error) throw error;

      setVybbiResponse(data.reply);

      // Simuler des résultats basés sur la réponse de Vybbi
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'profile',
          title: 'DJ Alex',
          description: 'Spécialiste électro-techno, 5 ans d\'expérience clubs',
          avatar: '/placeholder.svg',
          location: 'Paris',
          genres: ['Électro', 'Techno'],
          score: 95,
          metadata: { experience: '5 ans', rating: 4.8 }
        },
        {
          id: '2',
          type: 'profile',
          title: 'Sarah Mix',
          description: 'Artiste techno minimale, résidente Warehouse Club',
          avatar: '/placeholder.svg',
          location: 'Lyon',
          genres: ['Techno'],
          score: 88,
          metadata: { experience: '3 ans', rating: 4.6 }
        },
        {
          id: '3',
          type: 'event',
          title: 'Electro Night Festival',
          description: 'Festival électro recherche headliner weekend prochain',
          location: 'Marseille',
          genres: ['Électro', 'House'],
          score: 92,
          metadata: { budget: '3000-8000€', capacity: 2000 }
        }
      ];

      // Filtrer selon les critères
      let filteredResults = mockResults;
      if (filters.type) {
        filteredResults = filteredResults.filter(r => 
          (filters.type === 'event' && r.type === 'event') ||
          (filters.type !== 'event' && r.type === 'profile')
        );
      }
      if (filters.genre) {
        filteredResults = filteredResults.filter(r => 
          r.genres?.includes(filters.genre)
        );
      }
      if (filters.location) {
        filteredResults = filteredResults.filter(r => 
          r.location?.toLowerCase().includes(filters.location.toLowerCase())
        );
      }

      setResults(filteredResults);

      if (filteredResults.length === 0) {
        toast({
          title: "Aucun résultat",
          description: "Essaie de modifier tes critères de recherche",
        });
      }

    } catch (error) {
      console.error('Erreur recherche:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'effectuer la recherche avec Vybbi",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleVybbiSearch();
    }
  };

  const getResultIcon = (type: string) => {
    switch(type) {
      case 'profile': return '👤';
      case 'event': return '🎉';
      case 'annonce': return '📢';
      default: return '📄';
    }
  };

  return (
    <>
      <SEOHead 
        title="Recherche Avancée avec IA - Vybbi"
        description="Utilise l'intelligence artificielle Vybbi pour effectuer des recherches complexes et trouver les artistes, événements et opportunités parfaites."
      />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Recherche Avancée avec Vybbi
          </h1>
          <p className="text-muted-foreground">
            Utilise l'intelligence artificielle pour des recherches complexes en langage naturel
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panneau de recherche */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  Recherche Naturelle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Textarea
                    placeholder="Ex: Trouve-moi des DJ techno disponibles ce weekend à Paris pour un budget de 2000-5000€"
                    value={naturalQuery}
                    onChange={(e) => setNaturalQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="min-h-[100px]"
                  />
                </div>
                <Button 
                  onClick={handleVybbiSearch} 
                  className="w-full"
                  disabled={isSearching || !naturalQuery.trim()}
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Vybbi analyse...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Rechercher avec Vybbi
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  Filtres Avancés
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tout type" />
                    </SelectTrigger>
                    <SelectContent>
                      {searchTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Genre musical</label>
                  <Select value={filters.genre} onValueChange={(value) => setFilters(prev => ({ ...prev, genre: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous genres" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map(genre => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Localisation</label>
                  <Input
                    placeholder="Paris, Lyon, Marseille..."
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium">Date début</label>
                    <Input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date fin</label>
                    <Input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium">Budget min (€)</label>
                    <Input
                      type="number"
                      placeholder="1000"
                      value={filters.budgetMin}
                      onChange={(e) => setFilters(prev => ({ ...prev, budgetMin: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Budget max (€)</label>
                    <Input
                      type="number"
                      placeholder="5000"
                      value={filters.budgetMax}
                      onChange={(e) => setFilters(prev => ({ ...prev, budgetMax: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Résultats */}
          <div className="lg:col-span-2 space-y-4">
            {vybbiResponse && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    Analyse de Vybbi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{vybbiResponse}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Résultats ({results.length})</span>
                  {results.length > 0 && (
                    <Button size="sm" variant="outline">
                      Exporter
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {results.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Utilise Vybbi pour effectuer une recherche intelligente</p>
                        <p className="text-sm">Décris ce que tu cherches en langage naturel</p>
                      </div>
                    ) : (
                      results.map((result) => (
                        <Card key={result.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              {result.avatar && (
                                <Avatar>
                                  <AvatarImage src={result.avatar} />
                                  <AvatarFallback>{result.title[0]}</AvatarFallback>
                                </Avatar>
                              )}
                              
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{getResultIcon(result.type)}</span>
                                  <h3 className="font-semibold">{result.title}</h3>
                                  {result.score && (
                                    <Badge variant="secondary" className="ml-auto">
                                      {result.score}% match
                                    </Badge>
                                  )}
                                </div>
                                
                                <p className="text-sm text-muted-foreground">{result.description}</p>
                                
                                <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
                                  {result.location && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {result.location}
                                    </div>
                                  )}
                                  {result.metadata?.rating && (
                                    <div className="flex items-center gap-1">
                                      <Star className="h-3 w-3 fill-current text-yellow-400" />
                                      {result.metadata.rating}
                                    </div>
                                  )}
                                  {result.metadata?.budget && (
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="h-3 w-3" />
                                      {result.metadata.budget}
                                    </div>
                                  )}
                                </div>
                                
                                {result.genres && result.genres.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {result.genres.map(genre => (
                                      <Badge key={genre} variant="outline" className="text-xs">
                                        <Music className="h-3 w-3 mr-1" />
                                        {genre}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}