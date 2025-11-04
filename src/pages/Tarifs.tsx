import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Users, Sparkles, Gem, Heart, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { useTrialConfig } from "@/hooks/useTrialConfig";

export default function Tarifs() {
  const { trialDays, isPromotionalActive } = useTrialConfig();

  // Plans professionnels
  const professionalPlans = [
    {
      name: "Solo",
      price: "9,90",
      period: "/mois",
      description: "Pour démarrer et tester la plateforme",
      subtitle: "Artistes • Agents & Managers • Lieux",
      icon: Users,
      features: [
        "Visibilité de base",
        "Outils essentiels",
        "Portfolio/Profil complet",
        "Messagerie intégrée",
        "Accès Radio Vybbi",
        "Système de réputation"
      ],
      popular: false
    },
    {
      name: "Pro",
      price: "29,90",
      period: "/mois",
      description: "Pour les professionnels actifs",
      subtitle: "Artistes • Agents & Managers • Lieux",
      icon: Sparkles,
      features: [
        "Toutes fonctionnalités Solo",
        "Visibilité maximale",
        "Outils de gestion avancés",
        "Gestion des contrats",
        "Statistiques détaillées",
        "Accès opportunités premium",
        "Support prioritaire"
      ],
      popular: true
    },
    {
      name: "Elite",
      price: "99,90",
      period: "/mois",
      description: "Pour les acteurs établis",
      subtitle: "Artistes • Agents & Managers • Lieux",
      icon: Gem,
      features: [
        "Toutes fonctionnalités Pro",
        "Mise en avant maximale",
        "Support dédié personnel",
        "Analytics complets",
        "Blockchain & Smart Contracts",
        "Optimisation maximale",
        "Accès anticipé nouveautés"
      ],
      popular: false
    }
  ];

  // Plan Fans (gratuit)
  const fansProgram = {
    name: "Fans",
    price: "Gratuit",
    description: "Soutenez vos artistes préférés",
    icon: Heart,
    features: [
      "Profil personnel gratuit",
      "Suivez vos artistes favoris",
      "Laissez des avis vérifiés",
      "Participez à l'économie VYBBI Token",
      "Tips & micro-transactions",
      "Accès aux NFT exclusifs"
    ]
  };

  // Programme influenceur
  const influencerStandard = {
    name: "Influenceur",
    price: "Gratuit",
    description: "Programme d'affiliation",
    subtitle: "Apportez de nouveaux utilisateurs",
    icon: TrendingUp,
    features: [
      "5% commission sur inscription",
      "0,50€/mois commission récurrente",
      "Lien affiliation personnalisé",
      "Dashboard temps réel",
      "Paiements automatiques mensuels",
      "100% gratuit"
    ]
  };

  const influencerPremium = {
    name: "Influenceur Premium",
    price: "49",
    period: "/mois",
    badge: "Optionnel",
    description: "Outils avancés pour influenceurs pros",
    icon: Gem,
    features: [
      "Toutes fonctionnalités Influenceur",
      "Analytics sophistiqués",
      "Support dédié personnalisé",
      "Bonus de commission",
      "Accès anticipé fonctionnalités",
      "Outils optimisation campagnes"
    ]
  };


  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Tarifs Vybbi - Plans Solo, Pro & Elite" 
        description={`Plans adaptés à tous : Solo 9,90€/mois, Pro 29,90€/mois, Elite 99,90€/mois. Fans gratuit, Programme Influenceur avec commissions. ${trialDays} jours d'essai gratuit.`}
        canonicalUrl={`${window.location.origin}/tarifs`}
      />
      
      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto text-center">
          <Badge className="mb-6" variant="secondary">
            {isPromotionalActive ? "🔥 Offre limitée" : "Tarification transparente"}
          </Badge>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Tarifs Transparents & Flexibles
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Du débutant au professionnel établi, une offre adaptée à chaque profil. {trialDays || 30} jours d'essai gratuit pour tous les plans professionnels.
            {isPromotionalActive && (
              <span className="block mt-2 text-primary font-semibold">🎉 Offre promotionnelle active !</span>
            )}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Check className="h-4 w-4 text-green-500" />
            <span>Sans engagement • Annulation à tout moment • Changement de plan possible</span>
          </div>
        </div>
      </section>

      {/* Plans Professionnels */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Plans Professionnels</h2>
            <p className="text-muted-foreground">Pour Artistes, Agents & Managers, Lieux d'événements</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {professionalPlans.map((plan, index) => {
              const IconComponent = plan.icon;
              return (
                <Card 
                  key={index} 
                  className={`relative ${
                    plan.popular ? 'border-primary shadow-xl scale-105' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary">Le plus populaire</Badge>
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <IconComponent className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl text-center">{plan.name}</CardTitle>
                    <p className="text-xs text-center text-muted-foreground font-medium">{plan.subtitle}</p>
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
                      <Link to="/auth">
                        Commencer {trialDays || 30} jours gratuits
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Plan Fans */}
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Pour les Fans</h2>
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Heart className="h-8 w-8 text-red-500" />
                      <CardTitle className="text-2xl">{fansProgram.name}</CardTitle>
                    </div>
                    <CardDescription className="text-base">{fansProgram.description}</CardDescription>
                  </div>
                  <Badge className="text-lg px-4 py-2 bg-green-500">{fansProgram.price}</Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="grid md:grid-cols-2 gap-3">
                  {fansProgram.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link to="/auth?role=fan">Créer mon compte gratuit</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Programmes Influenceur */}
          <div>
            <h2 className="text-3xl font-bold text-center mb-8">Pour les Influenceurs</h2>
            <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Influenceur Standard */}
              <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-200 dark:border-orange-800">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Badge className="bg-green-500">100% Gratuit</Badge>
                    <TrendingUp className="h-8 w-8 text-orange-500" />
                  </div>
                  <CardTitle className="text-2xl">{influencerStandard.name}</CardTitle>
                  <p className="text-sm text-muted-foreground font-medium">{influencerStandard.subtitle}</p>
                  <CardDescription className="text-base">{influencerStandard.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{influencerStandard.price}</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3">
                    {influencerStandard.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button size="lg" className="w-full" asChild>
                    <Link to="/inscription-influenceur">Devenir Influenceur</Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Influenceur Premium */}
              <Card className="relative border-2 border-primary/50">
                {influencerPremium.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge variant="secondary">{influencerPremium.badge}</Badge>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <Gem className="h-12 w-12 text-primary" />
                  </div>
                  <CardTitle className="text-2xl text-center">{influencerPremium.name}</CardTitle>
                  <CardDescription className="text-center">{influencerPremium.description}</CardDescription>
                  <div className="mt-4 text-center">
                    <span className="text-4xl font-bold">{influencerPremium.price}€</span>
                    <span className="text-muted-foreground">{influencerPremium.period}</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3">
                    {influencerPremium.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button className="w-full" variant="outline" asChild>
                    <Link to="/auth?plan=influencer-premium">Passer Premium</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
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
              Commencer {trialDays || 30} jours gratuits
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}