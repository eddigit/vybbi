import { useState } from 'react';
import { Link } from 'react-router-dom';
import React from 'react';
import { Music, Users, Building2, Star, MessageCircle, FileCheck, CreditCard, TrendingUp, ArrowRight, Play, CheckCircle, Zap, Globe, Shield } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
export default function Landing() {
  const [activeFeature, setActiveFeature] = useState(0);
  const features = [{
    icon: Users,
    title: "Réseau Professionnel",
    description: "Connectez-vous avec des artistes, agents et lieux d'événements dans votre région",
    gradient: "from-blue-500 to-cyan-500"
  }, {
    icon: MessageCircle,
    title: "Messagerie Temps Réel",
    description: "Échangez instantanément avec vos contacts et négociez vos contrats",
    gradient: "from-purple-500 to-pink-500"
  }, {
    icon: FileCheck,
    title: "Contrats Numériques",
    description: "Créez, signez et gérez vos contrats d'événements en toute sécurité",
    gradient: "from-green-500 to-emerald-500"
  }, {
    icon: CreditCard,
    title: "Paiements Sécurisés",
    description: "Système de paiement intégré avec gestion automatique des commissions",
    gradient: "from-orange-500 to-red-500"
  }];
  const testimonials = [{
    name: "DJ Luna",
    role: "DJ / Producer",
    image: "/placeholder.svg",
    quote: "Vybbi a révolutionné ma façon de trouver des bookings. Plus de 50 événements cette année !",
    rating: 5
  }, {
    name: "Marc Dubois",
    role: "Manager @ TechnoVibes",
    image: "/placeholder.svg",
    quote: "La gestion de mes artistes n'a jamais été aussi simple. Un gain de temps énorme.",
    rating: 5
  }, {
    name: "Le Warehouse",
    role: "Club - Paris",
    image: "/placeholder.svg",
    quote: "Nous trouvons maintenant les meilleurs DJs en quelques clics. Interface intuitive et efficace.",
    rating: 5
  }];
  const stats = [{
    number: "10K+",
    label: "Artistes"
  }, {
    number: "5K+",
    label: "Événements"
  }, {
    number: "500+",
    label: "Lieux"
  }, {
    number: "98%",
    label: "Satisfaction"
  }];
  return <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/lovable-uploads/952ba024-e787-4174-b9bc-50d160e2562a.png" alt="Vybbi Logo" className="w-12 h-12" />
                <span className="font-bold text-xl text-foreground">Vybbi</span>
              </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Fonctionnalités
              </a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Tarifs
              </a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
                Témoignages
              </a>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link to="/auth">Connexion</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">Commencer</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 text-sm px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              THE HYPE OF THE NIGHT
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Connectez votre
              </span>
              <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent animate-pulse">talent</span> 
              <span className="text-foreground"> au monde</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Vybbi est la plateforme qui met en relation les talents de la nuit avec leur environnement. 
              Découvrez, connectez et développez l'écosystème musical et nocturne.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link to="/auth">
                  Rejoindre la communauté
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                <Play className="mr-2 h-5 w-5" />
                Voir la démo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              {stats.map((stat, index) => <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{stat.number}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>)}
            </div>
          </div>
        </div>
      </section>

      {/* Audiences Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Pour tous les acteurs de la scène</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Que vous soyez artiste, agent ou gérant de lieu, Vybbi s'adapte à vos besoins
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-glow">
                  <Music className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Artistes</h3>
                <p className="text-muted-foreground mb-6">
                  DJs, musiciens, danseurs, performers. Créez votre profil, partagez votre art et trouvez vos prochains bookings.
                </p>
                <ul className="text-left space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    <span className="text-card-foreground">Portfolio multimédia</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    <span className="text-card-foreground">Agenda des disponibilités</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    <span className="text-card-foreground">Gestion des contrats</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-glow">
                  <Users className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Agents & Managers</h3>
                <p className="text-muted-foreground mb-6">
                  Gérez vos artistes, développez leurs carrières et maximisez leurs opportunités de bookings.
                </p>
                <ul className="text-left space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    <span className="text-card-foreground">Gestion de roster</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    <span className="text-card-foreground">Suivi des commissions</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    <span className="text-card-foreground">Analytics de performance</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-success rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-glow">
                  <Building2 className="w-8 h-8 text-success-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Lieux d'événements</h3>
                <p className="text-muted-foreground mb-6">
                  Clubs, festivals, bars, restaurants. Trouvez les talents parfaits pour vos événements.
                </p>
                <ul className="text-left space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    <span className="text-card-foreground">Recherche d'artistes</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    <span className="text-card-foreground">Gestion d'événements</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    <span className="text-card-foreground">Planning automatisé</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Fonctionnalités puissantes</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour développer votre activité dans l'industrie musicale
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {features.map((feature, index) => <Card key={index} className={`cursor-pointer transition-all duration-300 bg-gradient-card border-border ${activeFeature === index ? 'ring-2 ring-primary shadow-glow scale-105' : 'hover:shadow-glow'}`} onClick={() => setActiveFeature(index)}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow">
                        <feature.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>)}
            </div>

            <div className="relative">
              <Card className="aspect-video bg-gradient-card border-border shadow-glow flex items-center justify-center">
                <CardContent className="text-center p-8">
                  <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 animate-pulse shadow-glow">
                    {features[activeFeature].icon && React.createElement(features[activeFeature].icon, {
                      className: "w-12 h-12 text-primary-foreground"
                    })}
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-foreground">{features[activeFeature].title}</h3>
                  <p className="text-muted-foreground max-w-xs">{features[activeFeature].description}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Ils nous font confiance</h2>
            <p className="text-xl text-muted-foreground">
              Découvrez ce que disent nos utilisateurs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => <Card key={index} className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-warning text-warning" />)}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={testimonial.image} />
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <Card className="bg-gradient-primary border-border shadow-glow">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl font-bold mb-4 text-primary-foreground">Prêt à transformer votre carrière ?</h2>
              <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
                Rejoignez des milliers de professionnels qui utilisent déjà Vybbi pour développer leur activité
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
                  <Link to="/auth">
                    Commencer gratuitement
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                  Planifier une démo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/lovable-uploads/952ba024-e787-4174-b9bc-50d160e2562a.png" alt="Vybbi Logo" className="w-8 h-8" />
                 <span className="font-bold text-xl text-foreground">Vybbi</span>
               </div>
               <p className="text-muted-foreground">
                 Le loup des nuits qui déniche les talents et connecte l'écosystème musical.
               </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Tarifs</a></li>
                <li><Link to="/artists" className="hover:text-foreground transition-colors">Artistes</Link></li>
                <li><Link to="/lieux" className="hover:text-foreground transition-colors">Lieux</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Conditions</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Vybbi. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>;
}