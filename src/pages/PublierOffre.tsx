import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Zap, BarChart3, Sparkles, ArrowRight, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";

export default function PublierOffre() {
  return (
    <>
      <SEOHead
        title="Publier une offre d'événement - Vybbi"
        description="Publiez votre offre d'événement et recevez des candidatures qualifiées d'artistes, agents et lieux en quelques minutes."
        canonicalUrl="/publier-offre"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-green-500/5">
        <div className="container mx-auto px-4 py-16 text-center">
          <Badge className="mb-4 bg-green-500/20 text-green-700 border-green-500/30">
            GRATUIT - Sans engagement
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Publiez votre offre d'événement
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Recevez des <span className="font-bold text-green-600">candidatures qualifiées</span> en quelques minutes
          </p>

          {/* Preview Section with Icon */}
          <div className="relative max-w-3xl mx-auto mb-12">
            <Card className="blur-sm opacity-70">
              <CardContent className="p-12">
                <PlusCircle className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
                <div className="h-6 bg-muted rounded mb-4 w-3/4 mx-auto" />
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-4 bg-muted rounded w-2/3 mx-auto" />
              </CardContent>
            </Card>
            
            {/* Overlay CTA */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-background/95 backdrop-blur-sm rounded-lg p-8 shadow-2xl border-2 border-green-500/50 animate-pulse">
                <p className="text-lg font-semibold mb-4">
                  Créez votre compte pour publier votre offre
                </p>
                <Button asChild size="lg" className="gap-2 bg-green-600 hover:bg-green-700">
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
                <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Ciblage précis</h3>
                <p className="text-sm text-muted-foreground">
                  Touchez exactement les bons profils
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="p-6 text-center">
                <Zap className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Réponses rapides</h3>
                <p className="text-sm text-muted-foreground">
                  Recevez des candidatures en minutes
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Gestion centralisée</h3>
                <p className="text-sm text-muted-foreground">
                  Toutes vos offres au même endroit
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="p-6 text-center">
                <Sparkles className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Boost de visibilité</h3>
                <p className="text-sm text-muted-foreground">
                  Options de mise en avant disponibles
                </p>
              </CardContent>
            </Card>
          </div>

          {/* How it works */}
          <div className="max-w-4xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-8">Comment ça marche ?</h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <Card>
                <CardContent className="p-6">
                  <Badge className="mb-4 bg-green-600">Étape 1</Badge>
                  <h3 className="font-semibold mb-2">Créez votre compte</h3>
                  <p className="text-sm text-muted-foreground">
                    Inscription gratuite en 30 secondes
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Badge className="mb-4 bg-green-600">Étape 2</Badge>
                  <h3 className="font-semibold mb-2">Publiez votre offre</h3>
                  <p className="text-sm text-muted-foreground">
                    Décrivez votre besoin en détail
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Badge className="mb-4 bg-green-600">Étape 3</Badge>
                  <h3 className="font-semibold mb-2">Recevez des candidatures</h3>
                  <p className="text-sm text-muted-foreground">
                    Sélectionnez le profil idéal
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Final CTA */}
          <div className="bg-green-500/10 rounded-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">
              Prêt à publier votre offre ?
            </h2>
            <p className="text-muted-foreground mb-6">
              L'inscription prend moins de 30 secondes
            </p>
            <Button asChild size="lg" className="mb-4 bg-green-600 hover:bg-green-700">
              <Link to="/auth">
                Créer mon compte gratuit
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              Déjà membre ?{" "}
              <Link to="/auth?tab=signin" className="text-green-600 hover:underline font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
