import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, Search, Calendar, Users, Star, TrendingUp, CheckCircle, MapPin, Shield, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RoleSignupForm from "@/components/RoleSignupForm";

export default function PourLieuxEvenements() {
  const benefits = [
    {
      icon: Users,
      title: "Catalogue Multi-Profils",
      description: "Vybbi est la seule plateforme qui centralise l'ensemble de l'écosystème artistique en un seul point d'entrée",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Search,
      title: "Moteur de Matching IA",
      description: "Gagnez du temps et trouvez des talents adaptés à vos besoins en quelques clics avec recommandations personnalisées",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Calendar,
      title: "Calendrier Synchronisé",
      description: "Fini les doubles réservations et les allers-retours interminables avec disponibilités en temps réel",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Shield,
      title: "Espace Collaboratif",
      description: "Simplifiez la gestion de vos événements comme si vous aviez une équipe dédiée pour chaque projet",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: MapPin,
      title: "Marketplace Services",
      description: "Un écosystème complet sans chercher ailleurs : accès rapide à techniciens, assureurs, graphistes",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: TrendingUp,
      title: "Services Clé en Main",
      description: "Vybbi va au-delà du booking : assurance, gestion juridique, communication - une solution complète",
      gradient: "from-yellow-500 to-orange-500"
    }
  ];

  const testimonials = [
    {
      name: "Le Warehouse",
      type: "Club - Paris",
      quote: "Vybbi nous a permis de découvrir des talents incroyables. Notre programmation n'a jamais été aussi forte.",
      stats: "150+ événements organisés"
    },
    {
      name: "Festival Neon",
      type: "Festival - Lyon",
      quote: "La plateforme nous fait gagner énormément de temps dans la recherche d'artistes. Booking en 1 clic !",
      stats: "50 artistes bookés cette année"
    },
    {
      name: "Bar Le Groove",
      type: "Bar - Marseille",
      quote: "Enfin un outil adapté aux petits lieux. Interface simple, artistes de qualité, que demander de plus ?",
      stats: "98% de satisfaction client"
    }
  ];

  const venueTypes = [
    {
      title: "Clubs & Discothèques",
      description: "Programmez vos soirées avec les meilleurs DJs et artistes électro",
      image: "/images/personas/wolf-festival.png"
    },
    {
      title: "Festivals & Événements",
      description: "Créez des line-ups exceptionnels pour vos festivals et événements",
      image: "/images/brand/vybbi-logo-alt.png"
    },
    {
      title: "Bars & Restaurants",
      description: "Ambiance musicale parfaite pour vos établissements",
      image: "/images/personas/wolf-dj-artist.png"
    }
  ];

  const features = [
    "Recherche par style musical, localisation et budget",
    "Système de booking et contrats intégrés",
    "Calendrier partagé et gestion des disponibilités",
    "Paiements sécurisés avec historique complet",
    "Outils de promotion pour vos événements",
    "Support technique dédié 24h/24"
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
                <img src="/images/brand/vybbi-logo.png" alt="Vybbi Logo" className="w-6 h-6 sm:w-8 sm:h-8" />
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
            <Building2 className="w-4 h-4 mr-2" />
            POUR LES LIEUX D'ÉVÉNEMENTS
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Trouvez les artistes
            </span>
            <br />
            <span className="text-foreground">qui feront vibrer votre lieu</span>
          </h1>
          
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Clubs, festivals, bars, restaurants : Vybbi vous connecte avec les meilleurs talents pour créer des expériences inoubliables. Notre marketplace unifiée vous permet de trouver, sur une seule et même plateforme, un DJ, un groupe de rock, des danseurs et organiser votre événement complet.
            </p>

          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto mb-12">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Lieux partenaires</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Artistes disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">24h</div>
              <div className="text-sm text-muted-foreground">Temps de réponse moyen</div>
            </div>
          </div>
        </div>
      </section>

      {/* Types d'Organisateurs */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Pour tous types de lieux</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Que vous soyez un petit bar ou un grand festival, nous avons les artistes qu'il vous faut
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {venueTypes.map((venue, index) => (
              <Card key={index} className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border overflow-hidden">
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={venue.image} 
                    alt={venue.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{venue.title}</h3>
                  <p className="text-muted-foreground">{venue.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key Arguments Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">5 raisons de choisir Vybbi pour vos événements</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Découvrez pourquoi des centaines de lieux nous font confiance pour transformer leur programmation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Accès direct aux talents</h3>
                <p className="text-muted-foreground">Recherche instantanée par style, ville, budget. Plus besoin de passer par des intermédiaires coûteux.</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Gain de temps</h3>
                <p className="text-muted-foreground">Un seul espace central pour trouver, contacter et confirmer un artiste.</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Visibilité accrue</h3>
                <p className="text-muted-foreground">Vos événements apparaissent sur le mur d'annonces et touchent la communauté mondiale d'artistes.</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Qualité garantie</h3>
                <p className="text-muted-foreground">Reviews sur les artistes, avec notes et commentaires laissés par d'autres établissements.</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Diversité complète</h3>
                <p className="text-muted-foreground">DJs, musiciens, danseurs, performers, magiciens, tout au même endroit.</p>
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
              Tous les outils essentiels pour gérer vos événements et votre programmation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Recherche d'artistes</h3>
                <p className="text-muted-foreground">Moteur de recherche avancé pour trouver l'artiste parfait selon vos critères.</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Gestion d'événements</h3>
                <p className="text-muted-foreground">Créez, organisez et gérez tous vos événements depuis une interface unifiée.</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Planning automatisé</h3>
                <p className="text-muted-foreground">Planification intelligente qui évite les conflits et optimise votre programmation.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Outils professionnels intégrés</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Des outils conçus spécifiquement pour optimiser la gestion de vos événements. Bénéficiez d'un espace de travail partagé pour chaque événement, centralisant la communication, les contrats, les riders techniques et les plannings entre toutes les parties.
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
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Tout pour réussir vos événements</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Une suite complète d'outils pour gérer vos bookings et événements
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
                      <Search className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">Recherche Avancée</h3>
                    <p className="text-muted-foreground">Trouvez l'artiste parfait en quelques clics</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="text-sm">Style: House, Techno</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="text-sm">Budget: 500€ - 2000€</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="text-sm">Localisation: 50km</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Ils organisent déjà avec Vybbi</h2>
            <p className="text-xl text-muted-foreground">
              Des lieux qui ont révolutionné leur programmation
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
                    <div className="text-sm text-muted-foreground">{testimonial.type}</div>
                    <div className="text-sm text-primary mt-1">{testimonial.stats}</div>
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
              <h2 className="text-4xl font-bold mb-6">Prêt à transformer vos événements ?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Rejoignez les centaines de lieux qui utilisent déjà Vybbi pour créer des expériences mémorables
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Inscription gratuite et rapide</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Marketplace unifiée : DJ, groupes, danseurs sur une plateforme</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Espace de travail partagé pour chaque événement</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Gestion financière intégrée sécurisée</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Analytics pour optimiser vos événements</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Évaluations certifiées pour choix éclairés</span>
                </div>
              </div>
            </div>
            
            <RoleSignupForm 
              profileType="lieu"
              title="Créez votre profil de lieu"
              description="Commencez à organiser des événements exceptionnels"
            />
          </div>
        </div>
      </section>
    </div>
  );
}