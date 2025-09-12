import { Link } from 'react-router-dom';
import { ArrowLeft, Music, Calendar, DollarSign, TrendingUp, Users, Star, CheckCircle, Search, FileText, ArrowRight, Radio, Globe, Tv } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RoleSignupForm from "@/components/RoleSignupForm";

export default function PourArtistes() {
  const benefits = [
    {
      icon: Users,
      title: "Catalogue Multi-Profils",
      description: "Vybbi est la seule plateforme qui centralise l'ensemble de l'écosystème artistique - artistes, lieux, agents, organisateurs",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Search,
      title: "Moteur de Matching IA",
      description: "Gagnez du temps et trouvez des opportunités adaptées à votre style en quelques clics grâce à nos recommandations personnalisées",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Calendar,
      title: "Calendrier Synchronisé",
      description: "Fini les doubles réservations ! Synchronisation Google, Outlook, Apple pour des disponibilités en temps réel",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: DollarSign,
      title: "Gestion Financière Intégrée",
      description: "Sécurisez vos paiements et gagnez en transparence financière avec devis, paiements sécurisés et factures automatiques",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: TrendingUp,
      title: "Analytics Avancés",
      description: "Prenez des décisions basées sur des données fiables : suivi performances, audience, bookings, ROI",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: Star,
      title: "Évaluations et Scoring",
      description: "Faites vos choix en confiance grâce aux avis certifiés et construisez votre réputation transparente",
      gradient: "from-yellow-500 to-orange-500"
    }
  ];

  const testimonials = [
    {
      name: "DJ Luna",
      quote: "Grâce à Vybbi, j'ai doublé mes bookings en 6 mois. La plateforme me permet de me concentrer sur ma musique.",
      events: "50+ événements cette année"
    },
    {
      name: "MC Storm",
      quote: "Enfin une plateforme qui comprend les besoins des artistes. Gestion simple et paiements rapides.",
      events: "30+ clubs partenaires"
    },
    {
      name: "DJ Neon",
      quote: "Je recommande Vybbi à tous les DJs. C'est devenu indispensable pour gérer ma carrière.",
      events: "100+ fans sur la plateforme"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <img src="/lovable-uploads/952ba024-e787-4174-b9bc-50d160e2562a.png" alt="Vybbi Logo" className="w-8 h-8" />
                <span className="font-bold text-lg">Vybbi</span>
              </div>
            </div>
            <Button asChild>
              <Link to="/auth">Se connecter</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 text-sm px-4 py-2">
            <Music className="w-4 h-4 mr-2" />
            POUR LES ARTISTES
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Votre talent
            </span>
            <br />
            <span className="text-foreground">mérite d'être découvert</span>
          </h1>
          
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Vybbi vous connecte directement avec les organisateurs d'événements, agents et lieux qui recherchent votre style musical. Notre marketplace unifiée permet aux organisateurs de trouver, sur une seule et même plateforme, un DJ, un groupe de rock, des danseurs et le lieu pour leur événement.
            </p>

          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto mb-12">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Lieux partenaires</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Artistes actifs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">98%</div>
              <div className="text-sm text-muted-foreground">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Arguments Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">6 raisons de rejoindre Vybbi dès maintenant</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Découvrez pourquoi des milliers d'artistes développent leur carrière avec Vybbi
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Visibilité mondiale</h3>
                <p className="text-muted-foreground">Un profil accessible par des clubs, agents et managers partout dans le monde.</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Opportunités directes</h3>
                <p className="text-muted-foreground">Être contacté même sans agent, ou rediriger automatiquement vers votre manager.</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Réputation professionnelle</h3>
                <p className="text-muted-foreground">Les reviews renforcent la crédibilité et filtrent les bons profils.</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Outils médias</h3>
                <p className="text-muted-foreground">Mise en avant via le mur d'annonces, diffusion sur Radio Vybbi et possibilité d'être repéré par radios et médias spécialisés.</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Égalité des chances</h3>
                <p className="text-muted-foreground">Petit artiste ou star, la plateforme met tout le monde au même niveau de visibilité dans la recherche.</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <Radio className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Radio Vybbi - Diffusion Mondiale</h3>
                <p className="text-muted-foreground">Soyez diffusé sur notre webradio dédiée exclusivement aux artistes Vybbi et touchez une audience mondiale 24h/24.</p>
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
              Tous les outils essentiels pour gérer votre carrière artistique
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Portfolio multimédia</h3>
                <p className="text-muted-foreground">Présentez votre art avec photos, vidéos et démos audio dans un portfolio professionnel.</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Agenda des disponibilités</h3>
                <p className="text-muted-foreground">Gérez votre planning et vos disponibilités pour faciliter les bookings.</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Gestion des contrats</h3>
                <p className="text-muted-foreground">Négociez et gérez vos contrats directement sur la plateforme.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Outils pour développer votre carrière</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tous les outils dont vous avez besoin pour développer votre carrière artistique. Notre moteur de matching par IA analyse les besoins des organisateurs (ambiance, budget, style) et votre profil pour proposer les meilleures correspondances, y compris des collaborations inattendues.
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

      {/* Technology for Artists */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Technologie au service de votre art</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Notre IA analyse votre style musical et vous connecte avec les opportunités parfaites
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Matching IA Personnalisé</h3>
                <p className="text-sm text-muted-foreground">Notre algorithme analyse votre style, vos influences et votre historique pour vous proposer les meilleures opportunités</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Analytics de Carrière</h3>
                <p className="text-sm text-muted-foreground">Suivez votre progression, analysez vos performances et optimisez votre développement artistique</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Paiements Blockchain</h3>
                <p className="text-sm text-muted-foreground">Sécurisation des droits d'auteur et paiements automatiques via smart contracts</p>
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

      {/* Radio Vybbi Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-6 text-sm px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-500">
              <Radio className="w-4 h-4 mr-2" />
              RADIO VYBBI
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                Radio Vybbi
              </span>
              <br />
              Votre musique diffusée dans le monde entier
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Découvrez Radio Vybbi, la première webradio mondiale entièrement dédiée aux artistes inscrits sur notre plateforme. 
              Une nouvelle manière extraordinaire de faire connaître votre talent et votre son à une audience passionnée.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-glow">
                  <Radio className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Diffusion 24h/24</h3>
                <p className="text-muted-foreground">Votre musique en rotation continue sur une radio mondiale dédiée exclusivement aux talents Vybbi</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-glow">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Audience Mondiale Ciblée</h3>
                <p className="text-muted-foreground">Touchez des auditeurs passionnés d'artistes émergents et de nouveaux talents dans le monde entier</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border relative overflow-hidden">
              <CardContent className="p-6 text-center">
                <Badge className="absolute top-4 right-4 text-xs px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500">
                  BIENTÔT
                </Badge>
                <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-glow">
                  <Tv className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Prochainement Web TV</h3>
                <p className="text-muted-foreground">Très prochainement, showcasez vos performances visuelles : danseurs, chanteurs, magiciens et tous artistes scéniques</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center bg-gradient-to-r from-pink-500/10 to-violet-500/10 rounded-2xl p-8 border border-pink-500/20">
            <h3 className="text-2xl font-bold mb-4 text-foreground">
              Une radio unique au monde
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Radio Vybbi est la première et unique webradio mondiale dédiée exclusivement aux artistes de notre communauté. 
              Chaque morceau diffusé est créé par un talent inscrit sur Vybbi, offrant une découverte musicale authentique et diversifiée.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>100% artistes Vybbi</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Diffusion mondiale</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Tous styles musicaux</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Ce que disent nos artistes</h2>
            <p className="text-xl text-muted-foreground">
              Des milliers d'artistes nous font déjà confiance
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
                    <div className="text-sm text-primary">{testimonial.events}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Signup Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Prêt à faire décoller votre carrière ?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Rejoignez des milliers d'artistes qui développent déjà leur carrière avec Vybbi
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Inscription gratuite et sans engagement</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Espace collaboratif pour chaque événement</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Module promotion pour booster votre visibilité</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Calendriers synchronisés avec vos outils favoris</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Services additionnels : assurance, gestion juridique</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Diffusion sur Radio Vybbi, notre webradio mondiale dédiée aux artistes</span>
                </div>
              </div>
            </div>
            
            <RoleSignupForm 
              profileType="artist"
              title="Créez votre profil d'artiste"
              description="Rejoignez la communauté Vybbi en quelques minutes"
            />
          </div>
        </div>
      </section>
    </div>
  );
}