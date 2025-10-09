import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Users, MessageSquare, Calendar, Shield, ArrowLeft } from "lucide-react";
import { useTrialConfig } from "@/hooks/useTrialConfig";

export default function AccesComplet() {
  const { trialDays, isPromotionalActive, isLoading } = useTrialConfig();
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link to="/nos-artistes">
              <ArrowLeft className="w-4 h-4" />
              Retour à nos artistes
            </Link>
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-8 py-12">
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl mb-6">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Pour voir plus de profils et contacter
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-primary">
              Connectez-vous ou créez votre compte
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Accédez à l'annuaire complet de nos artistes, agents et lieux, 
              et commencez à créer des relations professionnelles dès aujourd'hui.
            </p>
          </div>

          {/* Highlight Banner */}
          <div className="bg-gradient-to-r from-green-500/10 via-primary/10 to-purple-500/10 rounded-2xl p-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Badge variant="secondary" className="bg-green-500/20 text-green-700 border-green-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Offre de lancement
              </Badge>
            </div>
            <p className="text-xl font-semibold text-foreground mb-2">
              Inscription gratuite • {trialDays || 14} jours d'essai offerts
              {isPromotionalActive && (
                <span className="text-sm ml-2 text-muted-foreground">(Offre limitée)</span>
              )}
            </p>
            <p className="text-muted-foreground">
              Pour artistes, agents, managers et lieux d'événements
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-3">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Annuaire Complet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Accédez à tous les profils d'artistes, agents et lieux de notre plateforme
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/10 rounded-lg mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-purple-500" />
              </div>
              <CardTitle className="text-lg">Messagerie Sécurisée</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Contactez directement les professionnels via notre système de messagerie intégré
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500/10 rounded-lg mx-auto mb-3">
                <Calendar className="w-6 h-6 text-orange-500" />
              </div>
              <CardTitle className="text-lg">Gestion d'Annonces</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Créez et gérez vos annonces pour trouver les bons partenaires
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Trust Section */}
        <div className="bg-muted/50 rounded-2xl p-8 mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">Plateforme Sécurisée</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6 text-center">
            <div>
              <p className="font-medium text-foreground mb-2">Profils Vérifiés</p>
              <p className="text-sm text-muted-foreground">
                Tous les profils sont modérés pour garantir la qualité de notre communauté
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-2">Sans Engagement</p>
              <p className="text-sm text-muted-foreground">
                Annulez à tout moment, aucun frais caché ni engagement à long terme
              </p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="text-center space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6 rounded-xl">
              <Link to="/auth?tab=signup">
                Créer mon compte gratuit
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 rounded-xl">
              <Link to="/auth?tab=signup">
                Se connecter
              </Link>
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Déjà membre ? <Link to="/auth?tab=signin" className="text-primary hover:underline font-medium">Connectez-vous ici</Link>
          </p>
        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center">
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
            En créant un compte, vous acceptez nos conditions d'utilisation et notre politique de confidentialité. 
            L'essai gratuit de {trialDays || 14} jours vous permet de découvrir toutes les fonctionnalités sans restriction.
            {isPromotionalActive && (
              <span className="block mt-1 text-green-600">
                🎉 Offre limitée : {trialDays || 14} jours d'essai gratuit pour les premiers inscrits !
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}