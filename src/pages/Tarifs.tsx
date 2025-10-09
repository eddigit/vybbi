import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star, Zap, Crown, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { useTrialConfig } from "@/hooks/useTrialConfig";

export default function Tarifs() {
  const { trialDays, isPromotionalActive } = useTrialConfig();

  const plans = [
    {
      name: "Artiste",
      price: "8€",
      period: "/mois",
      description: "Parfait pour les artistes solo et DJ",
      icon: Users,
      color: "from-purple-500 to-pink-500",
      features: [
        "Portfolio multimédia illimité",
        "Diffusion Radio Vybbi 24h/24",
        "Agenda des disponibilités",
        "Gestion des contrats",
        "Statistiques d'écoute détaillées",
        "Système de réputation",
        "Classement Top 50",
        "Messagerie professionnelle",
        "Support email"
      ],
      popular: false
    },
    {
      name: "Établissement",
      price: "18€",
      period: "/mois",
      description: "Pour les lieux et organisateurs d'événements",
      icon: Crown,
      color: "from-blue-500 to-cyan-500",
      features: [
        "Calendrier événementiel illimité",
        "Galerie photos et vidéos",
        "Historique des talents",
        "Gestion des réservations",
        "Partenariats avec autres lieux",
        "Analytics de fréquentation",
        "Recommandations IA",
        "Outils de promotion",
        "Support prioritaire"
      ],
      popular: true
    },
    {
      name: "Agent",
      price: "25€",
      period: "/mois",
      description: "Pour les agents et managers professionnels",
      icon: Star,
      color: "from-green-500 to-emerald-500",
      features: [
        "Gestion de roster illimitée",
        "Suivi des commissions automatisé",
        "Organisation de tournées",
        "Négociation de contrats",
        "Reporting financier détaillé",
        "Réseau professionnel étendu",
        "Outils de prospection avancés",
        "Dashboard analytics",
        "Support VIP"
      ],
      popular: false
    }
  ];

  const influencerProgram = {
    name: "Programme Influenceur",
    description: "Gagnez des commissions en recommandant Vybbi",
    features: [
      "Liens d'affiliation personnalisés",
      "QR codes dynamiques", 
      "Tracking des conversions en temps réel",
      "Commissions automatiques de 5%",
      "Commissions récurrentes de 0,50€/mois",
      "Dashboard analytique complet",
      "Outils de promotion intégrés",
      "Programme de parrainage",
      "Paiements mensuels automatiques"
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Tarifs" 
        description={`Découvrez nos tarifs : Artistes ${trialDays} jours gratuits puis 8€/mois, Établissements 18€/mois, Agents 25€/mois. Programme influenceur avec commissions automatiques.`}
        canonicalUrl={`${window.location.origin}/tarifs`}
      />
      
      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto text-center">
          <Badge className="mb-6" variant="secondary">
            {isPromotionalActive ? "🔥 Offre limitée" : "Tarification transparente"}
          </Badge>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Des tarifs adaptés à chaque profil
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Choisissez l'abonnement qui correspond à vos besoins. Tous les plans incluent {trialDays || 14} jours d'essai gratuit 
            {isPromotionalActive && " (offre limitée)"}.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-success" />
            <span>Sans engagement • Annulation à tout moment</span>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => {
              const IconComponent = plan.icon;
              return (
                <Card 
                  key={index} 
                  className={`relative group hover:shadow-xl transition-all duration-300 ${
                    plan.popular ? 'ring-2 ring-primary scale-105' : 'hover:-translate-y-2'
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                      Le plus populaire
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <p className="text-muted-foreground">{plan.description}</p>
                    <div className="flex items-center justify-center gap-1 mt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="text-sm text-success font-medium">
                      {trialDays || 14} jours gratuits{isPromotionalActive && " (offre limitée)"}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                      asChild
                    >
                      <Link to="/auth">
                        Commencer {trialDays || 14} jours gratuits
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Influencer Program */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-200 dark:border-orange-800">
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-3xl">{influencerProgram.name}</CardTitle>
                <p className="text-xl text-muted-foreground">{influencerProgram.description}</p>
              </CardHeader>
              
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-lg mb-4">Ce qui est inclus :</h4>
                    <ul className="space-y-3">
                      {influencerProgram.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-card p-6 rounded-lg border">
                      <h4 className="font-semibold text-lg mb-2">Commission par conversion</h4>
                      <div className="text-3xl font-bold text-primary mb-2">5%</div>
                      <p className="text-sm text-muted-foreground">
                        Sur chaque nouvelle inscription que vous parrainez
                      </p>
                    </div>
                    
                    <div className="bg-card p-6 rounded-lg border">
                      <h4 className="font-semibold text-lg mb-2">Commission récurrente</h4>
                      <div className="text-3xl font-bold text-primary mb-2">0,50€</div>
                      <p className="text-sm text-muted-foreground">
                        Chaque mois tant que votre filleul reste abonné
                      </p>
                    </div>
                    
                    <Button size="lg" className="w-full" asChild>
                      <Link to="/affiliation">
                        Rejoindre le programme
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-12">Questions fréquentes</h2>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Puis-je changer d'abonnement à tout moment ?</h3>
                <p className="text-muted-foreground">
                  Oui, vous pouvez passer d'un plan à l'autre à tout moment. Les changements prennent effet immédiatement 
                  et vous ne payez que la différence au prorata.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Comment fonctionne l'essai gratuit ?</h3>
                <p className="text-muted-foreground">
                  Vous bénéficiez de {trialDays || 14} jours d'accès complet à toutes les fonctionnalités, sans aucun engagement. 
                  Vous pouvez annuler à tout moment pendant cette période.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Quels sont les moyens de paiement acceptés ?</h3>
                <p className="text-muted-foreground">
                  Nous acceptons toutes les cartes bancaires (Visa, Mastercard, American Express) ainsi que les virements SEPA.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Prêt à commencer votre aventure Vybbi ?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'artistes, lieux et professionnels qui font confiance à Vybbi 
            pour développer leur carrière musicale.
          </p>
          <Button size="lg" asChild className="text-lg px-8 py-6">
            <Link to="/auth">
              Commencer {trialDays || 14} jours gratuits
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}