import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users, MapPin, Headphones, TrendingUp, Calendar, MessageSquare, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";

export default function Fonctionnalites() {
  const features = [
    {
      category: "Artistes",
      icon: Users,
      color: "bg-gradient-to-br from-purple-500 to-pink-500",
      features: [
        "Portfolio multimédia complet",
        "Diffusion Radio Vybbi 24h/24",
        "Agenda des disponibilités intelligent",
        "Gestion des contrats digitaux",
        "Statistiques d'écoute détaillées",
        "Système de réputation professionnel",
        "Classement Top 50 artistes"
      ]
    },
    {
      category: "Lieux & Événements",
      icon: MapPin,
      color: "bg-gradient-to-br from-blue-500 to-cyan-500",
      features: [
        "Calendrier événementiel interactif",
        "Galerie photos et vidéos",
        "Historique des talents passés",
        "Gestion des réservations",
        "Partenariats avec autres lieux",
        "Analytics de fréquentation",
        "Système de recommandations IA"
      ]
    },
    {
      category: "Agents & Managers",
      icon: TrendingUp,
      color: "bg-gradient-to-br from-green-500 to-emerald-500",
      features: [
        "Gestion de roster d'artistes",
        "Suivi des commissions automatisé",
        "Organisation de tournées",
        "Négociation de contrats",
        "Reporting financier détaillé",
        "Réseau professionnel étendu",
        "Outils de prospection avancés"
      ]
    },
    {
      category: "Influenceurs",
      icon: Zap,
      color: "bg-gradient-to-br from-orange-500 to-red-500",
      features: [
        "Liens d'affiliation personnalisés",
        "QR codes dynamiques",
        "Tracking des conversions",
        "Commissions automatiques",
        "Dashboard analytique",
        "Outils de promotion intégrés",
        "Programme de parrainage"
      ]
    }
  ];

  const globalFeatures = [
    {
      icon: Headphones,
      title: "Radio Vybbi",
      description: "Radio mondiale 24h/24 diffusant les talents de la plateforme"
    },
    {
      icon: MessageSquare,
      title: "Messagerie intégrée",
      description: "Communication directe entre tous les acteurs de l'écosystème"
    },
    {
      icon: Calendar,
      title: "Agenda unifié",
      description: "Synchronisation des disponibilités et événements"
    },
    {
      icon: CheckCircle,
      title: "Système de réputation",
      description: "Évaluations et avis pour garantir la qualité des prestations"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Fonctionnalités" 
        description="Découvrez toutes les fonctionnalités de Vybbi : portfolio d'artistes, radio mondiale, gestion d'événements, outils d'agents et programme d'affiliation."
        canonicalUrl={`${window.location.origin}/fonctionnalites`}
      />
      
      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto text-center">
          <Badge className="mb-6" variant="secondary">
            Écosystème complet
          </Badge>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Toutes les fonctionnalités pour l'industrie musicale
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Vybbi rassemble tous les outils nécessaires aux artistes, lieux, agents et influenceurs 
            pour développer leurs carrières et créer des connexions professionnelles durables.
          </p>
          <Button size="lg" asChild>
            <Link to="/auth">
              Commencer gratuitement
            </Link>
          </Button>
        </div>
      </section>

      {/* Features by Category */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Fonctionnalités par profil</h2>
            <p className="text-xl text-muted-foreground">
              Des outils spécialisés pour chaque acteur de l'industrie musicale
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {features.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${category.color}`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-2xl">{category.category}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {category.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-success shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Global Features */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Fonctionnalités transversales</h2>
            <p className="text-xl text-muted-foreground">
              Des outils puissants qui connectent tout l'écosystème
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {globalFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Prêt à rejoindre l'écosystème Vybbi ?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Profitez de toutes ces fonctionnalités dès maintenant et développez votre présence dans l'industrie musicale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/auth">Créer mon compte</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/demo">Voir la démo</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}