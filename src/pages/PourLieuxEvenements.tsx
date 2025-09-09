import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, Search, Calendar, Users, Star, TrendingUp, CheckCircle, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RoleSignupForm from "@/components/RoleSignupForm";

export default function PourLieuxEvenements() {
  const benefits = [
    {
      icon: Search,
      title: "Découverte d'Artistes",
      description: "Trouvez les artistes parfaits pour vos événements grâce à notre système de recherche avancé",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Calendar,
      title: "Gestion d'Événements",
      description: "Planifiez, organisez et gérez tous vos événements depuis une interface unique et intuitive",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Users,
      title: "Base d'Artistes Qualifiés",
      description: "Accédez à plus de 10,000 artistes vérifiés et qualifiés dans tous les styles musicaux",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Star,
      title: "Système de Reviews",
      description: "Consultez les avis et notes pour choisir les meilleurs artistes pour votre audience",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: TrendingUp,
      title: "Analytics & Insights",
      description: "Analysez les performances de vos événements et optimisez votre programmation",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: MapPin,
      title: "Visibilité Locale",
      description: "Augmentez votre visibilité auprès des artistes et du public de votre région",
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
      image: "/lovable-uploads/bcdf994a-5708-4cfd-8dd9-6fa2614cc766.png"
    },
    {
      title: "Festivals & Événements",
      description: "Créez des line-ups exceptionnels pour vos festivals et événements",
      image: "/lovable-uploads/341ddf13-d369-435e-afa6-45e70902ebf8.png"
    },
    {
      title: "Bars & Restaurants",
      description: "Ambiance musicale parfaite pour vos établissements",
      image: "/lovable-uploads/ffb981ca-4640-4145-8e4a-6436a01f2401.png"
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
            Clubs, festivals, bars, restaurants : Vybbi vous connecte avec les meilleurs talents pour créer des expériences inoubliables.
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

      {/* Venue Types */}
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

      {/* Benefits Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Pourquoi choisir Vybbi ?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Des outils conçus spécifiquement pour optimiser la gestion de vos événements
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
                  <span>Accès immédiat à tous les artistes</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Support dédié aux professionnels</span>
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