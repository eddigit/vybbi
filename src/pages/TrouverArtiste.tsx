import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Music2, MessageSquare, Calendar, Shield, ArrowRight, Users as UsersIcon, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SEOHead } from "@/components/SEOHead";

export default function TrouverArtiste() {
  const [artistCount, setArtistCount] = useState(0);
  const [previewArtists, setPreviewArtists] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('profile_type', 'artist')
        .eq('is_public', true);
      setArtistCount(count || 0);

      const { data } = await supabase
        .from('profiles')
        .select('display_name, avatar_url, location, genres')
        .eq('profile_type', 'artist')
        .eq('is_public', true)
        .limit(3);
      setPreviewArtists(data || []);
    };
    fetchData();
  }, []);

  return (
    <>
      <SEOHead
        title="Trouver un artiste DJ - Vybbi"
        description={`Découvrez plus de ${artistCount}+ artistes DJ vérifiés en France. Messagerie sécurisée, agendas en temps réel, profils vérifiés.`}
        canonicalUrl="/trouver-artiste"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="container mx-auto px-4 py-16 text-center">
          <Badge className="mb-4 bg-green-500/20 text-green-700 border-green-500/30">
            GRATUIT - Sans engagement
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Trouvez l'artiste DJ parfait
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Plus de <span className="font-bold text-primary">{artistCount}+ artistes vérifiés</span> partout en France
          </p>

          {/* Preview Cards (Blurred) */}
          <div className="relative max-w-5xl mx-auto mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {previewArtists.map((artist, i) => (
                <Card key={i} className="blur-sm opacity-70">
                  <CardContent className="p-6">
                    <Avatar className="h-20 w-20 mx-auto mb-4 blur-md">
                      <AvatarImage src={artist.avatar_url} />
                      <AvatarFallback>DJ</AvatarFallback>
                    </Avatar>
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded w-2/3 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Overlay CTA */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-background/95 backdrop-blur-sm rounded-lg p-8 shadow-2xl border-2 border-primary/50 animate-pulse">
                <p className="text-lg font-semibold mb-4">
                  Créez votre compte pour voir tous les profils
                </p>
                <Button asChild size="lg" className="gap-2">
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
                <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Messagerie sécurisée</h3>
                <p className="text-sm text-muted-foreground">
                  Contactez directement les artistes
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Disponibilités en temps réel</h3>
                <p className="text-sm text-muted-foreground">
                  Vérifiez les agendas instantanément
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Profils vérifiés</h3>
                <p className="text-sm text-muted-foreground">
                  Tous les artistes sont validés
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="p-6 text-center">
                <Star className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Avis et notations</h3>
                <p className="text-sm text-muted-foreground">
                  Consultez les retours d'expérience
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Final CTA */}
          <div className="bg-primary/10 rounded-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">
              Prêt à trouver votre artiste ?
            </h2>
            <p className="text-muted-foreground mb-6">
              L'inscription prend moins de 30 secondes
            </p>
            <Button asChild size="lg" className="mb-4">
              <Link to="/auth">
                Créer mon compte gratuit
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              Déjà membre ?{" "}
              <Link to="/auth?tab=signin" className="text-primary hover:underline font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
