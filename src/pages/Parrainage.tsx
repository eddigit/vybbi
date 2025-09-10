import { Gift, Users, CreditCard, Trophy, ArrowRight, CheckCircle, Star, Zap, Target } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';

export default function Parrainage() {
  const referralTiers = [
    {
      title: "Niveau Bronze",
      description: "Pour débuter votre parcours de parrain",
      requirement: "1-5 parrainages",
      rewards: [
        "10% de commission sur les parrainages",
        "Badge Bronze sur votre profil",
        "Accès au support parrainage",
        "Statistiques basiques"
      ],
      icon: Trophy,
      color: "from-orange-400 to-orange-600"
    },
    {
      title: "Niveau Argent",
      description: "Récompenses améliorées pour les ambassadeurs",
      requirement: "6-15 parrainages",
      rewards: [
        "15% de commission sur les parrainages",
        "Badge Argent premium",
        "Support prioritaire",
        "Analytics avancées",
        "Bonus de fidélité mensuel"
      ],
      icon: Star,
      color: "from-gray-400 to-gray-600"
    },
    {
      title: "Niveau Or",
      description: "Statut élite avec avantages exclusifs",
      requirement: "16+ parrainages",
      rewards: [
        "20% de commission sur les parrainages",
        "Badge Or exclusif",
        "Account manager dédié",
        "Accès aux bêtas",
        "Invitations événements VIP",
        "Commissions à vie sur les parrainages"
      ],
      icon: Zap,
      color: "from-yellow-400 to-yellow-600"
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Partagez votre lien unique",
      description: "Recevez un code de parrainage personnalisé à partager avec votre réseau",
      icon: Users
    },
    {
      step: "2",
      title: "Vos contacts s'inscrivent",
      description: "Ils bénéficient de 30 jours gratuits + 20% de réduction sur leur premier abonnement",
      icon: Gift
    },
    {
      step: "3",
      title: "Vous êtes récompensé",
      description: "Recevez vos commissions et débloquez des avantages exclusifs",
      icon: CreditCard
    }
  ];

  const targetAudiences = [
    {
      title: "Organisateurs d'Événements",
      description: "Festivals, promoteurs, wedding planners",
      potential: "500€/mois",
      icon: Target
    },
    {
      title: "Influenceurs Musique",
      description: "Créateurs de contenu, bloggers, journalistes",
      potential: "300€/mois", 
      icon: Star
    },
    {
      title: "Professionnels de l'Audio",
      description: "Ingénieurs son, producteurs, studios",
      potential: "400€/mois",
      icon: Zap
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-16 px-2 sm:px-6 border-b border-border">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 text-sm px-4 py-2">
            <Gift className="w-4 h-4 mr-2" />
            PROGRAMME DE PARRAINAGE
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Gagnez de l'argent
            </span>
            <br />
            <span className="text-foreground">en partageant Vybbi</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            Transformez votre réseau en source de revenus ! Parrainez des professionnels 
            de la musique et gagnez des commissions récurrentes tout en les aidant à 
            développer leur activité.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link to="/auth">
                Devenir parrain
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Calculer mes gains potentiels
            </Button>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">20%</div>
              <div className="text-sm text-muted-foreground">Commission max</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">500€</div>
              <div className="text-sm text-muted-foreground">Revenus mensuels possibles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">30j</div>
              <div className="text-sm text-muted-foreground">Gratuits pour vos filleuls</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">∞</div>
              <div className="text-sm text-muted-foreground">Commissions à vie</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-2 sm:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Comment ça marche</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Un processus simple en 3 étapes pour commencer à gagner dès aujourd'hui
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {howItWorks.map((step, index) => (
              <Card key={index} className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow group-hover:scale-110 transition-transform">
                    <step.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary-foreground font-bold">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-gradient-card border-border rounded-2xl p-8 shadow-glow text-center">
            <h3 className="text-2xl font-bold mb-4 text-foreground">
              Offre de lancement pour vos filleuls
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-success flex items-center justify-center shadow-glow">
                  <Gift className="w-8 h-8 text-success-foreground" />
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold text-foreground">30 jours gratuits</div>
                  <div className="text-muted-foreground">Accès complet sans engagement</div>
                </div>
              </div>
              <div className="w-px h-16 bg-border hidden sm:block"></div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                  <CreditCard className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold text-foreground">-20% premier abonnement</div>
                  <div className="text-muted-foreground">Réduction exclusive parrainage</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Referral Tiers */}
      <section className="py-16 px-2 sm:px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Niveaux de parrainage</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Plus vous parrainez, plus vos récompenses augmentent
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {referralTiers.map((tier, index) => (
              <Card key={index} className={`group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border ${index === 1 ? 'ring-2 ring-primary scale-105' : ''}`}>
                <CardContent className="p-8 text-center">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center mx-auto mb-6 shadow-glow group-hover:scale-110 transition-transform`}>
                    <tier.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-foreground">{tier.title}</h3>
                  <p className="text-muted-foreground mb-4">{tier.description}</p>
                  <Badge className="mb-6">{tier.requirement}</Badge>
                  
                  <ul className="text-left space-y-3">
                    {tier.rewards.map((reward, rewardIndex) => (
                      <li key={rewardIndex} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-success mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-card-foreground text-sm">{reward}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audiences */}
      <section className="py-16 px-2 sm:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Audiences cibles</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Identifiez les profils les plus rentables à parrainer
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {targetAudiences.map((audience, index) => (
              <Card key={index} className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
                    <audience.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">{audience.title}</h3>
                  <p className="text-muted-foreground mb-4">{audience.description}</p>
                  <div className="text-2xl font-bold text-primary">{audience.potential}</div>
                  <div className="text-sm text-muted-foreground">potentiel mensuel</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <div className="bg-gradient-card border-border rounded-2xl p-8 shadow-glow mb-8">
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Calculez vos gains potentiels
              </h3>
              <p className="text-muted-foreground mb-6">
                Avec 10 parrainages actifs payant 49€/mois chacun, vous gagnez 98€/mois 
                en commissions récurrentes (20% de commission niveau Or).
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-6">
                  Utiliser le calculateur
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Télécharger le guide parrainage
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link to="/auth">
                  Commencer à parrainer
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}