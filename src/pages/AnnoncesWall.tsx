import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Search, MapPin, Calendar, Euro, MessageCircle, FileText, Plus, Filter, LayoutGrid, List } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";


interface AnnonceWithProfile {
  id: string;
  title: string;
  description: string;
  location: string | null;
  event_date: string | null;
  deadline: string | null;
  budget_min: number | null;
  budget_max: number | null;
  requirements: string | null;
  genres: string[] | null;
  status: string;
  created_at: string;
  image_url: string | null;
  image_position_y: number | null;
  profiles: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    profile_type: string;
  } | null;
}

export function AnnoncesWall() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const [annonces, setAnnonces] = useState<AnnonceWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [budgetFilter, setBudgetFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [selectedAnnonce, setSelectedAnnonce] = useState<string | null>(null);
  const [applicationMessage, setApplicationMessage] = useState("");

  const { isLoading } = useQuery({
    queryKey: ["annonces-wall"],
    queryFn: async ({ signal }) => {
      try {
      const { data, error } = await supabase
        .from("annonces")
        .select(`
          id,
          title,
          description,
          location,
          event_date,
          deadline,
          budget_min,
          budget_max,
          requirements,
          genres,
          status,
          created_at,
          user_id,
          image_url,
          image_position_y
        `)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .abortSignal(signal as AbortSignal);

      if (error) throw error;

      if (!data) {
        setAnnonces([] as AnnonceWithProfile[]);
        return [] as AnnonceWithProfile[];
      }

      // Fetch profiles for each announcement
      const userIds = data.map(annonce => annonce.user_id);
      
      if (userIds.length === 0) {
        setAnnonces([] as AnnonceWithProfile[]);
        return [] as AnnonceWithProfile[];
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, profile_type, user_id")
        .in("user_id", userIds)
        .abortSignal(signal as AbortSignal);

      if (profilesError) throw profilesError;

      // Combine announcements with their profiles
      const annoncesWithProfiles = data.map(annonce => {
        const profile = profilesData?.find(p => p.user_id === annonce.user_id);
        return {
          ...annonce,
          profiles: profile || null
        };
      });
      
      setAnnonces(annoncesWithProfiles as AnnonceWithProfile[]);
      return annoncesWithProfiles as AnnonceWithProfile[];
    } catch (error) {
      console.error("Error fetching annonces:", error);
      toast.error("Erreur lors du chargement des annonces");
      return [] as AnnonceWithProfile[];
    } finally {
      setLoading(false);
    }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  // Synchronise l’état local de loading avec React Query
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  const handleStartConversation = async (targetUserId: string) => {
    if (!profile) {
      toast.error("Vous devez être connecté pour contacter quelqu'un");
      return;
    }

    try {
      const { data, error } = await supabase.rpc("start_direct_conversation", {
        target_user_id: targetUserId
      });

      if (error) throw error;
      navigate(`/messages?conversation=${data}`);
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error("Erreur lors de la création de la conversation");
    }
  };

  const handleApplication = async () => {
    if (!profile || !selectedAnnonce) return;

    try {
      const { error } = await supabase
        .from("applications")
        .insert({
          annonce_id: selectedAnnonce,
          applicant_id: profile.id,
          message: applicationMessage || null
        });

      if (error) throw error;
      toast.success("Candidature envoyée avec succès !");
      setShowApplicationDialog(false);
      setApplicationMessage("");
      setSelectedAnnonce(null);
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Erreur lors de l'envoi de la candidature");
    }
  };

  const filteredAnnonces = annonces.filter((annonce) => {
    const matchesSearch = !searchTerm || 
      annonce.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      annonce.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = !locationFilter || 
      (annonce.location && annonce.location.toLowerCase().includes(locationFilter.toLowerCase()));
    
    const matchesBudget = budgetFilter === "all" || 
      (budgetFilter === "low" && annonce.budget_max && annonce.budget_max <= 1000) ||
      (budgetFilter === "medium" && annonce.budget_min && annonce.budget_min > 1000 && annonce.budget_max && annonce.budget_max <= 5000) ||
      (budgetFilter === "high" && annonce.budget_min && annonce.budget_min > 5000);
    
    const matchesType = typeFilter === "all" || annonce.profiles?.profile_type === typeFilter;

    return matchesSearch && matchesLocation && matchesBudget && matchesType;
  });

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return "Budget non précisé";
    if (min && max) return `${min}€ - ${max}€`;
    if (min) return `À partir de ${min}€`;
    if (max) return `Jusqu'à ${max}€`;
    return "Budget non précisé";
  };

  const getProfileTypeLabel = (type: string) => {
    switch (type) {
      case "artist": return "Artiste";
      case "agent": return "Agent";
      case "manager": return "Manager";
      case "lieu": return "Lieu/Événement";
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-full sm:w-32" />
            <Skeleton className="h-10 w-full sm:w-32" />
          </div>
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Mur des Annonces</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Découvrez toutes les opportunités disponibles
            </p>
          </div>
          
          {profile && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Button asChild size="sm" className="w-full sm:w-auto">
                <Link to="/annonces/manager">
                  <FileText className="h-4 w-4 mr-2" />
                  Mes annonces
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                <Link to="/annonces/manager">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une annonce
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une annonce..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Ville ou région..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="flex-1"
            />
            
            <Select value={budgetFilter} onValueChange={setBudgetFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tout budget</SelectItem>
                <SelectItem value="low">Jusqu'à 1000€</SelectItem>
                <SelectItem value="medium">1000€ - 5000€</SelectItem>
                <SelectItem value="high">Plus de 5000€</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="artist">Artistes</SelectItem>
                <SelectItem value="agent">Agents</SelectItem>
                <SelectItem value="manager">Managers</SelectItem>
                <SelectItem value="lieu">Lieux</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="flex justify-end">
        <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
          <Button
            size="sm"
            variant={viewMode === "cards" ? "default" : "ghost"}
            onClick={() => setViewMode("cards")}
            className="h-8 px-3"
          >
            <LayoutGrid className="h-4 w-4 mr-1" />
            Cards
          </Button>
          <Button
            size="sm"
            variant={viewMode === "list" ? "default" : "ghost"}
            onClick={() => setViewMode("list")}
            className="h-8 px-3"
          >
            <List className="h-4 w-4 mr-1" />
            Liste
          </Button>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredAnnonces.length} annonce{filteredAnnonces.length !== 1 ? 's' : ''} trouvée{filteredAnnonces.length !== 1 ? 's' : ''}
      </div>

      {/* Announcements Display */}
      {viewMode === "cards" ? (
        // Cards view with grid layout
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnnonces.map((annonce) => (
            <Card key={annonce.id} className="hover:shadow-lg transition-all duration-300 overflow-hidden">
              {/* Image */}
              {annonce.image_url && (
                <div className="relative h-48 bg-muted overflow-hidden">
                  <img
                    src={annonce.image_url}
                    alt={annonce.title}
                    className="w-full h-full object-cover"
                    style={{
                      objectPosition: `center ${annonce.image_position_y || 50}%`
                    }}
                  />
                </div>
              )}
              
              <CardHeader className="pb-3">
                <CardTitle className="text-lg mb-2 line-clamp-2">{annonce.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <img
                    src={annonce.profiles?.avatar_url || "/placeholder.svg"}
                    alt={annonce.profiles?.display_name || "User"}
                    className="w-5 h-5 rounded-full"
                  />
                  <span className="font-medium">{annonce.profiles?.display_name || "Utilisateur"}</span>
                  <Badge variant="outline" className="text-xs">
                    {getProfileTypeLabel(annonce.profiles?.profile_type || "artist")}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {annonce.description}
                </p>
                
                <div className="space-y-2 text-sm">
                  {annonce.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{annonce.location}</span>
                    </div>
                  )}
                  
                  {annonce.event_date && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span>{new Date(annonce.event_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Euro className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{formatBudget(annonce.budget_min, annonce.budget_max)}</span>
                  </div>
                </div>
                
                {annonce.genres && annonce.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {annonce.genres.slice(0, 2).map((genre, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                    {annonce.genres.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{annonce.genres.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  {profile && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => annonce.profiles?.id && handleStartConversation(annonce.profiles.id)}
                        disabled={!annonce.profiles?.id}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedAnnonce(annonce.id);
                          setShowApplicationDialog(true);
                        }}
                      >
                        Postuler
                      </Button>
                    </>
                  )}
                  
                  {!profile && (
                    <Button asChild size="sm" className="w-full">
                      <Link to="/auth">
                        Se connecter pour postuler
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // List view with horizontal layout
        <div className="space-y-4">
          {filteredAnnonces.map((annonce) => (
            <Card key={annonce.id} className="hover:shadow-md transition-shadow">
              <div className="flex">
                {/* Image */}
                {annonce.image_url && (
                  <div className="relative w-48 h-32 bg-muted flex-shrink-0 overflow-hidden">
                    <img
                      src={annonce.image_url}
                      alt={annonce.title}
                      className="w-full h-full object-cover"
                      style={{
                        objectPosition: `center ${annonce.image_position_y || 50}%`
                      }}
                    />
                  </div>
                )}
                
                <div className="flex-1 p-6">
                  <CardHeader className="p-0">
                    <CardTitle className="text-lg sm:text-xl mb-2">{annonce.title}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <img
                          src={annonce.profiles?.avatar_url || "/placeholder.svg"}
                          alt={annonce.profiles?.display_name || "User"}
                          className="w-5 h-5 rounded-full"
                        />
                        <span className="font-medium">{annonce.profiles?.display_name || "Utilisateur"}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {getProfileTypeLabel(annonce.profiles?.profile_type || "artist")}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-0 mt-4 space-y-4">
                    <p className="text-sm sm:text-base text-muted-foreground line-clamp-2">
                      {annonce.description}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      {annonce.location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{annonce.location}</span>
                        </div>
                      )}
                      
                      {annonce.event_date && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span>{new Date(annonce.event_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Euro className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{formatBudget(annonce.budget_min, annonce.budget_max)}</span>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Publié le {new Date(annonce.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {annonce.genres && annonce.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {annonce.genres.slice(0, 3).map((genre, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                        {annonce.genres.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{annonce.genres.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      {profile && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 sm:flex-none"
                            onClick={() => annonce.profiles?.id && handleStartConversation(annonce.profiles.id)}
                            disabled={!annonce.profiles?.id}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Écrire dans l'app
                          </Button>
                          
                          <Button
                            size="sm"
                            className="flex-1 sm:flex-none"
                            onClick={() => {
                              setSelectedAnnonce(annonce.id);
                              setShowApplicationDialog(true);
                            }}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Postuler/Proposer
                          </Button>
                        </>
                      )}
                      
                      {!profile && (
                        <Button asChild size="sm" className="w-full sm:w-auto">
                          <Link to="/auth">
                            Se connecter pour postuler
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {filteredAnnonces.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Aucune annonce ne correspond à vos critères
            </p>
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setLocationFilter("");
              setBudgetFilter("all");
              setTypeFilter("all");
            }}>
              Réinitialiser les filtres
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Application Dialog */}
      <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer une candidature</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Message de motivation (optionnel)
              </label>
              <Textarea
                placeholder="Expliquez pourquoi vous êtes intéressé par cette opportunité..."
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowApplicationDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleApplication}>
                Envoyer la candidature
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
    </div>
  );
}

export default AnnoncesWall;