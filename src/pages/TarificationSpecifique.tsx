import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Music, Users, Building2, Heart, TrendingUp, Crown, Zap, Shield, Infinity } from "lucide-react";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { useTrialConfig } from "@/hooks/useTrialConfig";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TarificationSpecifique() {
  const { trialDays } = useTrialConfig();

  // Plans pour Artistes
  const artistPlans = [
    {
      name: "Freemium",
      price: "Gratuit",
      description: "Pour démarrer et se faire découvrir",
      icon: Music,
      features: [
        "Profil artiste complet",
        "Publication de contenu illimitée",
        "Accès à 5 offres de booking/mois",
        "Messagerie de base",
        "Accès Radio Vybbi",
        "Visibilité communautaire"
      ],
      limitations: [
        "Réponses limitées aux offres (5/mois)",
        "Statistiques basiques uniquement",
        "Support standard"
      ],
      cta: "Créer mon profil gratuit",
      popular: false
    },
    {
      name: "Solo Artiste",
      price: "9,90",
      period: "/mois",
      description: "Pour les artistes qui se lancent",
      icon: Music,
      features: [
        "Toutes fonctionnalités Freemium",
        "Réponses illimitées aux offres",
        "Mises en avant mensuelles",
        "Statistiques de profil détaillées",
        "Gestion de calendrier basique",
        "Support prioritaire"
      ],
      cta: `Essayer ${trialDays || 30} jours gratuits`,
      popular: false
    },
    {
      name: "Pro Artiste",
      price: "29,90",
      period: "/mois",
      description: "Pour les artistes professionnels actifs",
      icon: Zap,
      features: [
        "Toutes fonctionnalités Solo",
        "Accès offres confidentielles premium",
        "Mise en avant maximale prioritaire",
        "Analytics avancés (écoutes, vues, engagement)",
        "Gestion contrats intelligente",
        "Protection blockchain des œuvres",
        "Calendrier de tournées avancé"
      ],
      cta: `Essayer ${trialDays || 30} jours gratuits`,
      popular: true
    },
    {
      name: "Elite Artiste",
      price: "99,90",
      period: "/mois",
      description: "Pour les artistes établis",
      icon: Crown,
      features: [
        "Toutes fonctionnalités Pro",
        "Mise en avant VIP exclusive",
        "Manager de compte personnel dédié",
        "Smart Contracts automatisés",
        "NFT et monétisation avancée",
        "Analytics prédictifs IA",
        "Accès anticipé à toutes nouveautés",
        "Support 24/7 prioritaire"
      ],
      cta: `Essayer ${trialDays || 30} jours gratuits`,
      popular: false
    }
  ];

  // Plans pour Agents & Managers
  const agentPlans = [
    {
      name: "Solo Agent",
      price: "19,90",
      period: "/mois",
      description: "Pour agents indépendants",
      icon: Users,
      features: [
        "Gestion jusqu'à 5 artistes",
        "Accès base de données artistes complète",
        "Recherche avancée avec filtres IA",
        "Suivi basique des commissions",
        "Messagerie professionnelle",
        "Tableau de bord simplifié"
      ],
      cta: `Essayer ${trialDays || 30} jours gratuits`,
      popular: false
    },
    {
      name: "Pro Agent",
      price: "49,90",
      period: "/mois",
      description: "Pour agences professionnelles",
      icon: Users,
      features: [
        "Gestion illimitée d'artistes",
        "CRM complet multi-artistes",
        "Pipeline de bookings avancé",
        "Suivi automatique des commissions",
        "Facturation et comptabilité intégrée",
        "Analytics de performance du roster",
        "Smart Contracts agence/artiste",
        "Outils de prospection avancés"
      ],
      cta: `Essayer ${trialDays || 30} jours gratuits`,
      popular: true
    },
    {
      name: "Elite Agent",
      price: "149,90",
      period: "/mois",
      description: "Pour grandes agences établies",
      icon: Crown,
      features: [
        "Toutes fonctionnalités Pro",
        "Gestion multi-bureaux/équipes",
        "BI et analytics prédictifs complets",
        "API et intégrations personnalisées",
        "White-label partiel disponible",
        "Formation dédiée de l'équipe",
        "Account manager personnel",
        "Support 24/7 premium"
      ],
      cta: `Essayer ${trialDays || 30} jours gratuits`,
      popular: false
    }
  ];

  // Plans pour Lieux & Événements
  const venuePlans = [
    {
      name: "Solo Lieu",
      price: "19,90",
      period: "/mois",
      description: "Pour petits lieux ou bars",
      icon: Building2,
      features: [
        "Profil lieu complet avec galerie",
        "Publication de 10 événements/mois",
        "Recherche d'artistes dans la base",
        "Gestion basique des candidatures",
        "Calendrier événementiel",
        "Statistiques de fréquentation basiques"
      ],
      cta: `Essayer ${trialDays || 30} jours gratuits`,
      popular: false
    },
    {
      name: "Pro Lieu",
      price: "49,90",
      period: "/mois",
      description: "Pour lieux établis et actifs",
      icon: Building2,
      features: [
        "Événements illimités",
        "Appels d'offres publics/privés illimités",
        "Accès artistes vérifiés premium",
        "Gestion de projet événementiel complète",
        "Suivi candidatures multi-événements",
        "Intégration billetterie",
        "Gestion partenaires/sponsors",
        "Analytics d'impact événements"
      ],
      cta: `Essayer ${trialDays || 30} jours gratuits`,
      popular: true
    },
    {
      name: "Elite Lieu",
      price: "149,90",
      period: "/mois",
      description: "Pour grands lieux et festivals",
      icon: Crown,
      features: [
        "Toutes fonctionnalités Pro",
        "Gestion multi-sites",
        "Billetterie NFT exclusive",
        "Smart Contracts automatisés",
        "BI et analytics prédictifs complets",
        "Outils de promotion événements avancés",
        "API et intégrations personnalisées",
        "Account manager dédié",
        "Support 24/7 VIP"
      ],
      cta: `Essayer ${trialDays || 30} jours gratuits`,
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Tarification Spécifique par Profil - Vybbi" 
        description="Plans adaptés à chaque profil : Artistes (Freemium à Elite), Agents & Managers, Lieux & Événements. Tarifs transparents avec essai gratuit."
        canonicalUrl={`${window.location.origin}/tarification-specifique`}
      />
      
      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto text-center">
          <Badge className="mb-6" variant="secondary">
            <Shield className="h-3 w-3 mr-1" />
            Tarification sur mesure
          </Badge>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Tarifs Adaptés à Votre Profil
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Des offres spécifiquement conçues pour chaque acteur de l'industrie musicale. 
            De l'artiste débutant au grand festival, trouvez le plan qui correspond à vos ambitions.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Check className="h-4 w-4 text-green-500" />
            <span>{trialDays || 30} jours d'essai gratuit • Sans engagement • Changement de plan à tout moment</span>
          </div>
        </div>
      </section>

      {/* Tabs par profil */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <Tabs defaultValue="artists" className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-12">
              <TabsTrigger value="artists" className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                <span className="hidden sm:inline">Artistes</span>
              </TabsTrigger>
              <TabsTrigger value="agents" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Agents</span>
              </TabsTrigger>
              <TabsTrigger value="venues" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Lieux</span>
              </TabsTrigger>
            </TabsList>

            {/* Plans Artistes */}
            <TabsContent value="artists" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-3">Plans pour Artistes</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Du freemium robuste pour démarrer aux fonctionnalités premium pour les artistes établis. 
                  Focus sur la visibilité, les opportunités et la protection de votre art.
                </p>
              </div>

              <div className="grid lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {artistPlans.map((plan, index) => {
                  const IconComponent = plan.icon;
                  return (
                    <Card 
                      key={index} 
                      className={`relative ${
                        plan.popular ? 'border-primary shadow-xl scale-105' : ''
                      } ${plan.price === "Gratuit" ? 'border-green-500/50' : ''}`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-primary">⭐ Populaire</Badge>
                        </div>
                      )}
                      {plan.price === "Gratuit" && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-green-500">🎁 Gratuit</Badge>
                        </div>
                      )}
                      
                      <CardHeader>
                        <div className="flex justify-center mb-4">
                          <IconComponent className="h-10 w-10 text-primary" />
                        </div>
                        <CardTitle className="text-xl text-center">{plan.name}</CardTitle>
                        <CardDescription className="text-center text-xs">{plan.description}</CardDescription>
                        <div className="mt-4 text-center">
                          <span className="text-3xl font-bold">{plan.price}{plan.period ? '€' : ''}</span>
                          {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <ul className="space-y-2">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                              <span className="text-xs">{feature}</span>
                            </li>
                          ))}
                          {plan.limitations && plan.limitations.map((limitation, idx) => (
                            <li key={`lim-${idx}`} className="flex items-start gap-2 text-muted-foreground">
                              <span className="text-xs">⚠️ {limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      
                      <CardFooter>
                        <Button 
                          className="w-full" 
                          variant={plan.popular ? "default" : "outline"}
                          asChild
                        >
                          <Link to="/auth?role=artist">
                            {plan.cta}
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Plans Agents */}
            <TabsContent value="agents" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-3">Plans pour Agents & Managers</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Outils professionnels de CRM, gestion de roster, suivi des commissions et analytics. 
                  Tarifs justifiés par le ROI direct sur votre activité.
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {agentPlans.map((plan, index) => {
                  const IconComponent = plan.icon;
                  return (
                    <Card 
                      key={index} 
                      className={`relative ${plan.popular ? 'border-primary shadow-xl scale-105' : ''}`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-primary">⭐ Populaire</Badge>
                        </div>
                      )}
                      
                      <CardHeader>
                        <div className="flex justify-center mb-4">
                          <IconComponent className="h-12 w-12 text-primary" />
                        </div>
                        <CardTitle className="text-2xl text-center">{plan.name}</CardTitle>
                        <CardDescription className="text-center">{plan.description}</CardDescription>
                        <div className="mt-4 text-center">
                          <span className="text-4xl font-bold">{plan.price}€</span>
                          <span className="text-muted-foreground">{plan.period}</span>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <ul className="space-y-3">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      
                      <CardFooter>
                        <Button 
                          className="w-full" 
                          variant={plan.popular ? "default" : "outline"}
                          asChild
                        >
                          <Link to="/auth?role=agent">
                            {plan.cta}
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Plans Lieux */}
            <TabsContent value="venues" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-3">Plans pour Lieux & Événements</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  De la petite salle au grand festival. Gestion d'événements, booking d'artistes, 
                  billetterie et analytics pour optimiser vos événements.
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {venuePlans.map((plan, index) => {
                  const IconComponent = plan.icon;
                  return (
                    <Card 
                      key={index} 
                      className={`relative ${plan.popular ? 'border-primary shadow-xl scale-105' : ''}`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-primary">⭐ Populaire</Badge>
                        </div>
                      )}
                      
                      <CardHeader>
                        <div className="flex justify-center mb-4">
                          <IconComponent className="h-12 w-12 text-primary" />
                        </div>
                        <CardTitle className="text-2xl text-center">{plan.name}</CardTitle>
                        <CardDescription className="text-center">{plan.description}</CardDescription>
                        <div className="mt-4 text-center">
                          <span className="text-4xl font-bold">{plan.price}€</span>
                          <span className="text-muted-foreground">{plan.period}</span>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <ul className="space-y-3">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      
                      <CardFooter>
                        <Button 
                          className="w-full" 
                          variant={plan.popular ? "default" : "outline"}
                          asChild
                        >
                          <Link to="/auth?role=lieu">
                            {plan.cta}
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Section Fans & Influenceurs */}
      <section className="py-16 px-6 bg-gradient-to-br from-secondary/5 to-primary/5">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Pour la Communauté</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Fans et Influenceurs : rejoignez l'écosystème Vybbi gratuitement
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Fans */}
            <Card className="border-2 border-green-500/30">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Heart className="h-10 w-10 text-red-500" />
                  <Badge className="bg-green-500">Gratuit</Badge>
                </div>
                <CardTitle className="text-2xl">Fans</CardTitle>
                <CardDescription>Soutenez vos artistes préférés</CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Profil personnel gratuit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Suivez vos artistes favoris</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Laissez des avis vérifiés</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Tips VYBBI Token aux artistes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Accès NFT exclusifs et billetterie</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Expériences VIP à la carte</span>
                  </li>
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link to="/auth?role=fan">Créer mon compte Fan</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Influenceurs */}
            <Card className="border-2 border-orange-500/30">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="h-10 w-10 text-orange-500" />
                  <Badge className="bg-green-500">Gratuit</Badge>
                </div>
                <CardTitle className="text-2xl">Influenceurs</CardTitle>
                <CardDescription>Programme d'affiliation avec commissions</CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">5% commission sur chaque inscription</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">0,50€/mois de commission récurrente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Lien d'affiliation personnalisé</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Dashboard temps réel</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Paiements automatiques mensuels</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Infinity className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold text-primary">Potentiel de revenus illimité</span>
                  </li>
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link to="/inscription-influenceur">Devenir Influenceur</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparaison et Justification */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Pourquoi des Tarifs Différenciés ?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Chaque profil a des besoins et une capacité d'investissement différents
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Music className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Artistes</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p><strong>Contrainte :</strong> Budget souvent limité en début de carrière</p>
                <p><strong>Solution :</strong> Freemium robuste + plans accessibles</p>
                <p><strong>Objectif :</strong> Maximiser l'acquisition de talents et leur visibilité</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Agents & Managers</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p><strong>Besoin :</strong> Outils professionnels générateurs de revenus</p>
                <p><strong>Valeur :</strong> ROI direct via optimisation et commissions</p>
                <p><strong>Justification :</strong> Tarifs professionnels = Investissement rentable</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Building2 className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Lieux & Événements</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p><strong>Besoin :</strong> Simplification du booking et gestion</p>
                <p><strong>Valeur :</strong> Gain de temps + optimisation des coûts</p>
                <p><strong>Justification :</strong> Plans adaptés à la taille et l'activité</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Trouvez le Plan Fait Pour Vous</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Que vous soyez artiste, agent, lieu ou fan, Vybbi a l'offre adaptée à vos besoins. 
            Commencez gratuitement ou essayez {trialDays || 30} jours sans engagement.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <Link to="/auth">
                Commencer maintenant
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
              <Link to="/contact">
                Nous contacter
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
