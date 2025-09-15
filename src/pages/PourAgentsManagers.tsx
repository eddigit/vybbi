import { Link } from 'react-router-dom';
import { ArrowLeft, Users, BarChart3, DollarSign, Calendar, Shield, TrendingUp, CheckCircle, Star, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RoleSignupForm from "@/components/RoleSignupForm";

export default function PourAgentsManagers() {
  const benefits = [
    {
      icon: Users,
      title: "Catalogue Multi-Profils",
      description: "Vybbi est la seule plateforme qui centralise l'ensemble de l'écosystème artistique pour vos prospections",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Calendar,
      title: "Calendrier Synchronisé",
      description: "Fini les allers-retours interminables ! Disponibilités en temps réel avec synchronisation Google, Outlook, Apple",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Espace Collaboratif",
      description: "Simplifiez la gestion de vos événements comme si vous aviez une équipe dédiée : communication, contrats, riders centralisés",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: DollarSign,
      title: "Gestion Financière Intégrée",
      description: "Sécurisez vos paiements et gagnez en transparence financière avec suivi des commissions automatique",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: BarChart3,
      title: "Outils Agents/Bookers",
      description: "Un cockpit de pilotage pour vos talents : gestion multi-artistes, suivi cachets, tournées",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: TrendingUp,
      title: "Module Promotion",
      description: "Boostez votre visibilité auprès des bonnes audiences avec mise en avant de vos profils et artistes",
      gradient: "from-yellow-500 to-orange-500"
    }
  ];

  const testimonials = [
    {
      name: "Marc Dubois",
      role: "Manager @ TechnoVibes",
      quote: "Vybbi m'a permis de doubler mon chiffre d'affaires en un an. La gestion centralisée est un game-changer.",
      stats: "15 artistes gérés"
    },
    {
      name: "Sophie Laurent",
      role: "Agent @ NightLife Music",
      quote: "Enfin un outil qui comprend les besoins des agents. Suivi des commissions automatique = gain de temps énorme.",
      stats: "200+ événements organisés"
    },
    {
      name: "Alex Martin",
      role: "Manager Indépendant",
      quote: "Les analytics me permettent de prendre des décisions éclairées pour mes artistes. Résultats impressionnants.",
      stats: "50% d'augmentation des bookings"
    }
  ];

  const features = [
    "Dashboard complet avec métriques de performance",
    "Suivi des revenus et commissions en temps réel",
    "Outils de prospection et de networking",
    "Système de notation et reviews clients",
    "API pour connecter vos outils existants",
    "Support prioritaire et formation dédiée"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="sm" asChild className="px-2 sm:px-3">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Retour</span>
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <img src="/lovable-uploads/952ba024-e787-4174-b9bc-50d160e2562a.png" alt="Vybbi Logo" className="w-6 h-6 sm:w-8 sm:h-8" />
                <span className="font-bold text-base sm:text-lg">Vybbi</span>
              </div>
            </div>
            <Button size="sm" asChild className="text-xs sm:text-sm">
              <Link to="/auth">Se connecter</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 text-sm px-4 py-2">
            <Users className="w-4 h-4 mr-2" />
            POUR LES AGENTS & MANAGERS
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Développez vos artistes
            </span>
            <br />
            <span className="text-foreground">comme jamais auparavant</span>
          </h1>
          
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Vybbi vous donne tous les outils pour gérer, développer et monétiser le talent de vos artistes avec une efficacité maximale. Les agents et bookers bénéficient d'outils dédiés pour gérer leurs artistes, trouver de nouveaux talents et organiser des tournées.
            </p>

          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto mb-12">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">2K+</div>
              <div className="text-sm text-muted-foreground">Agents actifs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">€2M+</div>
              <div className="text-sm text-muted-foreground">Chiffre d'affaires géré</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">40%</div>
              <div className="text-sm text-muted-foreground">Augmentation moyenne</div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Arguments Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">5 avantages exclusifs pour les professionnels</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Découvrez pourquoi les meilleurs agents et managers utilisent Vybbi pour développer leurs artistes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Centralisation des artistes</h3>
                <p className="text-muted-foreground">Chaque agent gère son portefeuille depuis la plateforme, avec un profil clair et vérifié.</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Business récurrent</h3>
                <p className="text-muted-foreground">Des lieux du monde entier viennent chercher des artistes → nouvelles opportunités sans prospection sauvage.</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Traçabilité complète</h3>
                <p className="text-muted-foreground">Contrats, échanges et bookings confirmés directement depuis VYBBI.</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Crédibilité renforcée</h3>
                <p className="text-muted-foreground">Être listé comme agent officiel d'un artiste apporte confiance aux établissements.</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Monétisation internationale</h3>
                <p className="text-muted-foreground">Possibilité de représenter des artistes dans plusieurs pays et d'être trouvé localement.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Les fondamentaux Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Aussi inclus : Les fondamentaux</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tous les outils essentiels pour gérer efficacement vos artistes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Gestion de roster</h3>
                <p className="text-muted-foreground">Organisez et gérez tous vos artistes depuis un tableau de bord centralisé.</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Suivi des commissions</h3>
                <p className="text-muted-foreground">Surveillez vos revenus et commissions en temps réel avec des rapports détaillés.</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Analytics de performance</h3>
                <p className="text-muted-foreground">Analysez les performances de vos artistes avec des métriques avancées.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Outils professionnels avancés</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Des outils professionnels conçus spécifiquement pour les agents et managers. Synchronisez les disponibilités de vos artistes, des lieux et coordinateurs pour rendre la planification beaucoup plus simple et transparente.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${benefit.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow`}>
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Tout ce dont vous avez besoin</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Une suite complète d'outils professionnels pour optimiser votre activité
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <Card className="bg-gradient-card border-border shadow-glow">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
                      <BarChart3 className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">Dashboard Analytics</h3>
                    <p className="text-muted-foreground">Suivez les performances en temps réel</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Revenus ce mois</span>
                      <span className="font-semibold text-success">+32%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Nouveaux bookings</span>
                      <span className="font-semibold text-primary">47</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Artistes actifs</span>
                      <span className="font-semibold text-foreground">12/15</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Technology for Agents */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Outils technologiques avancés</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Gérez vos artistes avec l'efficacité de l'IA et des analytics prédictifs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Dashboard Prédictif</h3>
                <p className="text-sm text-muted-foreground">Analysez les tendances du marché et optimisez les tarifs de vos artistes en temps réel</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Gestion Multi-Artistes</h3>
                <p className="text-sm text-muted-foreground">Interface centralisée pour gérer tous vos talents avec suivi automatique des performances</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Commissions Automatisées</h3>
                <p className="text-sm text-muted-foreground">Calcul et suivi automatique des commissions avec blockchain pour la transparence</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button size="lg" variant="outline" asChild>
              <Link to="/technologie">
                Découvrir notre technologie
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Ils nous font confiance</h2>
            <p className="text-xl text-muted-foreground">
              Des professionnels qui ont transformé leur business
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div className="border-t pt-4">
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    <div className="text-sm text-primary mt-1">{testimonial.stats}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Signup Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Prêt à révolutionner votre business ?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Rejoignez les agents et managers qui font déjà confiance à Vybbi pour développer leurs artistes
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Essai gratuit de 30 jours</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Outils dédiés pour gestion multi-artistes</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Calendriers synchronisés pour planification optimale</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Analytics avancés pour décisions éclairées</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Évaluations et scoring transparent</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Services additionnels intégrés</span>
                </div>
              </div>
            </div>
            
            <RoleSignupForm 
              profileType="agent"
              title="Créez votre compte professionnel"
              description="Accédez aux outils réservés aux agents et managers"
            />
          </div>
        </div>
      </section>
    </div>
  );
}