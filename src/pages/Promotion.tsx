import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Home, Zap, MessageSquare, Crown, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function Promotion() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Star className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">Se mettre en avant</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Boostez votre visibilité et attirez plus de clients en mettant votre profil en avant sur notre plateforme
        </p>
        <Badge variant="secondary" className="mt-4">
          Bientôt disponible
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Homepage Feature */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Home className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Mise en avant Homepage</CardTitle>
                <p className="text-muted-foreground">Apparaître dans la section artistes vedettes</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  Avantages Premium
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground ml-6">
                  <li>• Visibilité maximale sur la page d'accueil</li>
                  <li>• Badge "Artiste Vedette" sur votre profil</li>
                  <li>• Priorité dans les résultats de recherche</li>
                  <li>• Analytics détaillés de votre visibilité</li>
                </ul>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-2">À partir de 49€/mois</div>
                <p className="text-sm text-muted-foreground">
                  Engagement minimum de 3 mois
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Banner Feature */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Zap className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <CardTitle className="text-2xl">Bandeau Promotionnel</CardTitle>
                <p className="text-muted-foreground">Bandeau en haut de toutes les pages</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  Impact Maximum
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground ml-6">
                  <li>• Visibilité sur toutes les pages du site</li>
                  <li>• Design personnalisé de votre bandeau</li>
                  <li>• Lien direct vers votre profil</li>
                  <li>• Statistiques de clics en temps réel</li>
                </ul>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-2">À partir de 99€/semaine</div>
                <p className="text-sm text-muted-foreground">
                  Idéal pour les événements et tournées
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <Card className="text-center">
        <CardContent className="pt-6">
          <h3 className="text-2xl font-semibold mb-4">Intéressé par ces options de promotion ?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Contactez notre équipe pour discuter de vos besoins et obtenir un devis personnalisé. 
            Nous vous accompagnerons dans le choix de la solution la plus adaptée à vos objectifs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg">
              <Link to="/messages" className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Je suis intéressé
              </Link>
            </Button>
            
            <div className="text-sm text-muted-foreground">
              Réponse sous 24h • Devis gratuit
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          Les tarifs sont indicatifs et peuvent varier selon vos besoins spécifiques. 
          Contactez-nous pour une offre personnalisée.
        </p>
      </div>
    </div>
  );
}