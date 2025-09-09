import { Link } from 'react-router-dom';
import { ArrowLeft, Music, Calendar, DollarSign, TrendingUp, Users, Star, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RoleSignupForm from "@/components/RoleSignupForm";

export default function PourArtistes() {
  const benefits = [
    {
      icon: Music,
      title: "Portfolio Professionnel",
      description: "Créez un profil complet avec vos mixes, photos, vidéos et références pour vous démarquer",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Calendar,
      title: "Gestion de Planning",
      description: "Gérez votre agenda, vos disponibilités et acceptez les bookings directement sur la plateforme",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: DollarSign,
      title: "Négociation de Tarifs",
      description: "Fixez vos tarifs, négociez vos contrats et recevez vos paiements de manière sécurisée",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: TrendingUp,
      title: "Analytics de Performance",
      description: "Suivez vos performances, analysez vos statistiques et développez votre fan base",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Users,
      title: "Réseau Professionnel",
      description: "Connectez-vous avec des agents, managers et promoteurs pour développer votre carrière",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: Star,
      title: "Visibilité Maximale",
      description: "Apparaissez dans les recherches des organisateurs d'événements de votre région",
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
            Vybbi vous connecte directement avec les organisateurs d'événements, agents et lieux qui recherchent votre style musical.
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

      {/* Benefits Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Pourquoi choisir Vybbi ?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tous les outils dont vous avez besoin pour développer votre carrière artistique
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
                  <span>Profil vérifié en moins de 24h</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Premier booking garanti sous 30 jours*</span>
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