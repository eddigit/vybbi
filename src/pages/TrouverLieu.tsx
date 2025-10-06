import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, TrendingUp, Calendar, Users, ArrowRight, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SEOHead } from "@/components/SEOHead";

export default function TrouverLieu() {
  const [venueCount, setVenueCount] = useState(0);
  const [previewVenues, setPreviewVenues] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('profile_type', 'lieu')
        .eq('is_public', true);
      setVenueCount(count || 0);

      const { data } = await supabase
        .from('profiles')
        .select('display_name, avatar_url, location, venue_category')
        .eq('profile_type', 'lieu')
        .eq('is_public', true)
        .limit(3);
      setPreviewVenues(data || []);
    };
    fetchData();
  }, []);

  return (
    <>
      <SEOHead
        title="Trouver un lieu pour événement - Vybbi"
        description={`Découvrez ${venueCount}+ lieux et salles de concert vérifiés. Clubs, salles, festivals - Réservez facilement votre prochain événement.`}
        canonicalUrl="/trouver-lieu"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-blue-500/5">
        <div className="container mx-auto px-4 py-16 text-center">
          <Badge className="mb-4 bg-blue-500/20 text-blue-700 border-blue-500/30">
            GRATUIT - Sans engagement
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Trouvez le lieu parfait pour votre événement
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Plus de <span className="font-bold text-blue-600">{venueCount}+ lieux partenaires</span> dans toute la France
          </p>

          {/* Preview Cards (Blurred) */}
          <div className="relative max-w-5xl mx-auto mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {previewVenues.map((venue, i) => (
                <Card key={i} className="blur-sm opacity-70">
                  <CardContent className="p-6">
                    <Avatar className="h-20 w-20 mx-auto mb-4 blur-md">
                      <AvatarImage src={venue.avatar_url} />
                      <AvatarFallback>
                        <MapPin className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded w-2/3 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Overlay CTA */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-background/95 backdrop-blur-sm rounded-lg p-8 shadow-2xl border-2 border-blue-500/50 animate-pulse">
                <p className="text-lg font-semibold mb-4">
                  Créez votre compte pour découvrir tous les lieux
                </p>
                <Button asChild size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Link to="/auth">
                    Inscription gratuite
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Visibilité accrue</h3>
                <p className="text-sm text-muted-foreground">
                  Augmentez la fréquentation de votre lieu
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Réservations simplifiées</h3>
                <p className="text-sm text-muted-foreground">
                  Gérez vos bookings facilement
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Agenda partagé</h3>
                <p className="text-sm text-muted-foreground">
                  Synchronisez vos disponibilités
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Lieux vérifiés</h3>
                <p className="text-sm text-muted-foreground">
                  Tous les profils sont validés
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Final CTA */}
          <div className="bg-blue-500/10 rounded-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">
              Prêt à organiser votre événement ?
            </h2>
            <p className="text-muted-foreground mb-6">
              L'inscription prend moins de 30 secondes
            </p>
            <Button asChild size="lg" className="mb-4 bg-blue-600 hover:bg-blue-700">
              <Link to="/auth">
                Créer mon compte gratuit
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              Déjà membre ?{" "}
              <Link to="/auth?tab=signin" className="text-blue-600 hover:underline font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
