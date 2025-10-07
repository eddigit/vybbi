import { useState } from 'react';
import { Link } from 'react-router-dom';
import React from 'react';
import vybbiLogoMobile from "@/assets/vybbi-logo-mobile.png";
import { Music, Users, Building2, Star, MessageCircle, FileCheck, CreditCard, TrendingUp, ArrowRight, Play, CheckCircle, Zap, Globe, Shield, Gift, Brain, BarChart3, Trophy, Menu, X, Coins, Rocket, Search } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { AdSlot } from "@/components/ads/AdSlot";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TickerBanner } from "@/components/TickerBanner";
import { useTrialConfig } from "@/hooks/useTrialConfig";

// Import Token images
import vybbiMemeSpace from '@/assets/vybbi-meme-space.png';
import vybbiDjToken from '@/assets/vybbi-dj-token.png';

// Define Blockchain icon component
const Blockchain = ({
  className
}: {
  className?: string;
}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <path d="m5 15 2-2" />
    <path d="m5 9 2 2" />
    <path d="m15 19 2-2" />
    <path d="m15 5 2 2" />
  </svg>;
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
export default function Landing() {
  const [activeFeature, setActiveFeature] = useState(0);
  const {
    trialDays,
    isPromotionalActive,
    isLoading
  } = useTrialConfig();

  const navigationLinks = [
    { href: "/a-propos", label: "À propos" },
    { href: "/top-artistes", label: "Top Artistes" },
    { href: "/pour-artistes", label: "Pour Artistes" },
    { href: "/pour-agents-managers", label: "Pour Agents" },
    { href: "/pour-lieux-evenements", label: "Pour Lieux" },
    { href: "/technologie", label: "Technologie" },
    { href: "/blog", label: "Blog" }
  ];
  const features = [{
    icon: Users,
    title: "Marketplace Unifiée",
    description: "Trouvez DJ, groupes, danseurs et lieux sur une seule plateforme. Centralisez tout votre écosystème artistique",
    gradient: "from-blue-500 to-cyan-500"
  }, {
    icon: MessageCircle,
    title: "Outils Collaboratifs",
    description: "Espace de travail partagé pour chaque événement : communication, contrats, riders et plannings centralisés",
    gradient: "from-purple-500 to-pink-500"
  }, {
    icon: FileCheck,
    title: "Matching IA Avancé",
    description: "Notre IA analyse besoins (ambiance, budget, style) et profils pour proposer les meilleures correspondances, même inattendues",
    gradient: "from-green-500 to-emerald-500"
  }, {
    icon: CreditCard,
    title: "Calendriers Synchronisés",
    description: "Artistes, lieux et agents synchronisent leurs disponibilités, rendant la planification simple et transparente",
    gradient: "from-orange-500 to-red-500"
  }, {
    icon: Blockchain,
    title: "Certification Blockchain",
    description: "Protégez vos créations avec des certificats blockchain immutables. QR codes de vérification et preuve d'antériorité sur Solana",
    gradient: "from-violet-500 to-purple-500"
  }];
  const testimonials = [{
    name: "Alexandre M.",
    role: "Bêta-testeur • DJ Techno",
    image: "/placeholder.svg",
    quote: "En phase de test depuis 3 mois, l'interface est vraiment pensée pour nous. Hâte du lancement officiel !",
    rating: 5
  }, {
    name: "Sarah L.",
    role: "Early Adopter • Organisatrice événements",
    image: "/placeholder.svg",
    quote: "J'ai eu accès à la preview et c'est exactement ce qu'il nous manquait dans l'industrie. Révolutionnaire.",
    rating: 5
  }, {
    name: "Le Studio 404",
    role: "Partenaire de lancement • Paris",
    image: "/placeholder.svg",
    quote: "Nous avons choisi d'être partenaire fondateur car cette plateforme va changer la donne.",
    rating: 5
  }];
  const stats = [{
    number: "10K+",
    label: "Artistes ciblés"
  }, {
    number: "€2M+",
    label: "Volume d'affaires traité"
  }, {
    number: "5K+",
    label: "Opportunités événementielles"
  }, {
    number: "500+",
    label: "Lieux partenaires"
  }, {
    number: "150+",
    label: "Villes couvertes"
  }, {
    number: "24h/24",
    label: "Radio <span className='font-vybbi'>Vybbi</span>"
  }];
  return <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-24 sm:pt-28 pb-4 px-3 sm:px-6" style={{ paddingTop: `calc(3.5rem + env(safe-area-inset-top))` }}>
        <div className="mx-auto max-w-[1800px] 2xl:max-w-[1920px] px-2 sm:px-4">
        <div className="hidden md:grid md:grid-cols-[180px_minmax(0,1fr)_180px] gap-6 items-start">
            {/* Left Ad Slot - Desktop only */}
            <div className="hidden md:block sticky top-20 -mt-12 2xl:-mt-16 mb-24">
              <AdSlot slotId="ACCUEIL-GAUCHE" width={180} height={800} hideIfEmpty={true} fit="contain" />
            </div>
            
            {/* Main Hero Content */}
            <div className="text-center">
              <div className="max-w-5xl md:max-w-6xl mx-auto">
            <div className="mb-4 sm:mb-6 flex justify-center">
              <TickerBanner />
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 mt-6 sm:mt-8 leading-tight px-2">
              <span className="bg-gradient-primary bg-clip-text text-transparent block sm:inline">
                LE réseau social
              </span>
              <br className="hidden sm:block" />
              <span className="bg-gradient-primary bg-clip-text text-transparent animate-pulse">de la nuit</span> 
              <span className="text-foreground"> et de l'événement</span>
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-3 sm:px-2">
              <span className="font-vybbi">Vybbi</span> devient LA référence sociale pour les artistes, agents et lieux de la nuit. Créez votre carte de visite digitale professionnelle, showcasez votre talent et connectez-vous avec l'écosystème musical mondial. Votre profil devient votre vitrine digitale officielle.
            </p>

            <div className="mb-6 sm:mb-8">
              <Button variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 sm:px-4 py-2 hover:bg-primary/20 text-xs sm:text-sm" asChild>
                <Link to="/get-started">
                  🚀 Accès anticipé • Places limitées • Statut de fondateur
                </Link>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 px-4 sm:px-0">
              <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto touch-target" asChild>
                <Link to="/get-started">
                  Inscription gratuite
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              
              {/* Explorer dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto touch-target">
                    <Search className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Explorer
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-64 bg-background">
                  <DropdownMenuLabel>Que recherchez-vous ?</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/trouver-artiste" className="flex items-center cursor-pointer py-3">
                      <Music className="mr-3 h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Trouver un artiste</div>
                        <div className="text-xs text-muted-foreground">DJs, groupes, performers...</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/trouver-agent" className="flex items-center cursor-pointer py-3">
                      <Users className="mr-3 h-5 w-5 text-purple-500" />
                      <div>
                        <div className="font-medium">Trouver un agent</div>
                        <div className="text-xs text-muted-foreground">Managers, bookers...</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/trouver-lieu" className="flex items-center cursor-pointer py-3">
                      <Building2 className="mr-3 h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-medium">Trouver un lieu</div>
                        <div className="text-xs text-muted-foreground">Clubs, salles, festivals...</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/publier-offre" className="flex items-center cursor-pointer py-3">
                      <Star className="mr-3 h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-medium">Publier une offre</div>
                        <div className="text-xs text-muted-foreground">Postez votre besoin</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button size="lg" variant="ghost" className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto touch-target" asChild>
                <Link to="/demo">
                  <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Voir la démo
                </Link>
              </Button>
            </div>

            {/* Stats - Mobile optimized */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto px-2">
              {stats.map((stat, index) => <div key={index} className="text-center mobile-card p-3 sm:p-4">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mb-1">{stat.number}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground leading-tight">{stat.label}</div>
                </div>)}
            </div>
          </div>
        </div>
        
        {/* Right Ad Slot - Desktop only */}
        <div className="hidden md:block sticky top-20 -mt-12 2xl:-mt-16 mb-24">
          <AdSlot slotId="ACCUEIL-DROITE" width={180} height={800} hideIfEmpty={true} fit="contain" />
        </div>
      </div>
      
      {/* Mobile/Tablet Hero Content (visible when grid is hidden) */}
      <div className="md:hidden text-center">
        <div className="max-w-5xl md:max-w-6xl mx-auto">
            <div className="mb-6 flex justify-center">
              <TickerBanner />
            </div>
            
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 mt-8 leading-tight line-clamp-3 md:line-clamp-2">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Connectez votre
              </span>
              <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent animate-pulse">talent</span> 
              <span className="text-foreground"> au monde</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed px-2">
              <span className="font-vybbi">Vybbi</span> est la plateforme qui met en relation les talents de la nuit avec leur environnement. 
              Découvrez, connectez et développez l'écosystème musical et nocturne. Notre marketplace unifiée permet aux organisateurs de trouver, sur une seule et même plateforme, un DJ, un groupe de rock, des danseurs et le lieu pour leur événement.
            </p>

            <div className="mb-8">
              <Button variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-4 py-1 hover:bg-primary/20" asChild>
                <Link to="/get-started">
                  🚀 Accès anticipé • Places limitées • Statut de fondateur
                </Link>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link to="/get-started">
                  Rejoindre les pionniers
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                <Link to="/demo">
                  <Play className="mr-2 h-5 w-5" />
                  Voir la démo
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{stat.number}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>)}
            </div>
        </div>
      </div>
    </div>
    </section>

      {/* Audiences Section */}
      <section className="py-12 px-2 sm:px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Votre carte de visite digitale professionnelle</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Créez votre profil de référence qui devient votre vitrine officielle dans l'écosystème de la nuit
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-8 text-center">
                <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-glow overflow-hidden">
                  <img src="/images/personas/wolf-dj-artist-light.webp" alt="DJ Wolf Artist" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Artistes</h3>
            <p className="text-muted-foreground mb-6">
              <strong>Votre profil devient votre carte de visite mondiale.</strong> Showcasez vos œuvres, photos professionnelles et créations certifiées blockchain. Votre portfolio devient LA référence pour prouver votre talent et votre authenticité auprès des professionnels.
            </p>
            <ul className="text-left space-y-2 text-sm mb-6">
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-success mr-2" />
                <span className="text-card-foreground">Portfolio multimédia</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-success mr-2" />
                <span className="text-card-foreground">Diffusion Radio <span className="font-vybbi">Vybbi</span> mondiale</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-success mr-2" />
                <span className="text-card-foreground">Agenda des disponibilités</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-success mr-2" />
                <span className="text-card-foreground">Gestion des contrats</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-success mr-2" />
                <span className="text-card-foreground">Visibilité mondiale</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-success mr-2" />
                <span className="text-card-foreground">Classement Top 50</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-success mr-2" />
                <span className="text-card-foreground">Réputation professionnelle</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-success mr-2" />
                <span className="text-card-foreground">Statistiques d'écoute</span>
              </li>
              <li className="flex items-center">
                <Blockchain className="w-4 h-4 text-primary mr-2" />
                <span className="text-card-foreground">Certification blockchain Solana</span>
              </li>
              <li className="flex items-center">
                <Shield className="w-4 h-4 text-primary mr-2" />
                <span className="text-card-foreground">Protection crypto des œuvres</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-primary mr-2" />
                <span className="text-card-foreground">QR codes de vérification</span>
              </li>
              <li className="flex items-center">
                <Star className="w-4 h-4 text-primary mr-2" />
                <span className="text-card-foreground">Portfolio NFT intégré</span>
              </li>
                </ul>
                <div className="flex flex-col gap-2">
                  <Button asChild className="w-full">
                    <Link to="/pour-artistes">En savoir plus</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/pour-artistes">S'inscrire</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-8 text-center">
                <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-glow overflow-hidden">
                  <img src="/images/personas/wolf-agent.webp" alt="Wolf Agent Manager" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Agents & Managers</h3>
                <p className="text-muted-foreground mb-6">
                  <strong>Showcase de votre portefeuille artistique.</strong> Votre profil révèle qui vous gérez, l'ampleur de votre roster et votre crédibilité business. Les artistes et lieux peuvent voir votre expertise et votre réseau pour vous faire confiance.
                </p>
                <ul className="text-left space-y-2 text-sm mb-6">
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
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    <span className="text-card-foreground">Centralisation des artistes</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    <span className="text-card-foreground">Business récurrent</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    <span className="text-card-foreground">Traçabilité</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    <span className="text-card-foreground">Crédibilité renforcée</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    <span className="text-card-foreground">Monétisation internationale</span>
                  </li>
                  <li className="flex items-center">
                    <Blockchain className="w-4 h-4 text-primary mr-2" />
                    <span className="text-card-foreground">Smart contracts automatisés</span>
                  </li>
                  <li className="flex items-center">
                    <CreditCard className="w-4 h-4 text-primary mr-2" />
                    <span className="text-card-foreground">Portefeuille crypto dédié</span>
                  </li>
                  <li className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-primary mr-2" />
                    <span className="text-card-foreground">Commissions blockchain</span>
                  </li>
                  <li className="flex items-center">
                    <Zap className="w-4 h-4 text-primary mr-2" />
                    <span className="text-card-foreground">Paiements décentralisés</span>
                  </li>
                </ul>
                <div className="flex flex-col gap-2">
                  <Button asChild className="w-full">
                    <Link to="/pour-agents-managers">En savoir plus</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                  <Link to="/pour-agents-managers">S'inscrire</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-8 text-center">
                <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-glow overflow-hidden">
                  <img src="/images/personas/club-venue.webp" alt="Club Venue Event" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Lieux d'événements</h3>
                <p className="text-muted-foreground mb-6">
                  <strong>Vitrine digitale de votre établissement.</strong> Votre profil met en avant votre lieu, votre réputation et vos événements. Intégrez billetterie blockchain ou traditionnelle, et montrez pourquoi les artistes doivent jouer chez vous.
                </p>
                <ul className="text-left space-y-2 text-sm mb-6">
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
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    <span className="text-card-foreground">Accès direct aux talents</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    <span className="text-card-foreground">Gain de temps</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    <span className="text-card-foreground">Visibilité accrue</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    <span className="text-card-foreground">Qualité garantie</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    <span className="text-card-foreground">Diversité</span>
                  </li>
                  <li className="flex items-center">
                    <Blockchain className="w-4 h-4 text-primary mr-2" />
                    <span className="text-card-foreground">Billetterie blockchain</span>
                  </li>
                  <li className="flex items-center">
                    <Shield className="w-4 h-4 text-primary mr-2" />
                    <span className="text-card-foreground">Tokens d'accès événements</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-primary mr-2" />
                    <span className="text-card-foreground">Vérification crypto artistes</span>
                  </li>
                  <li className="flex items-center">
                    <Zap className="w-4 h-4 text-primary mr-2" />
                    <span className="text-card-foreground">Paiements instantanés</span>
                  </li>
                </ul>
                <div className="flex flex-col gap-2">
                  <Button asChild className="w-full">
                    <Link to="/pour-lieux-evenements">En savoir plus</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/pour-lieux-evenements">S'inscrire</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Network Section */}
      <section className="py-16 px-2 sm:px-6 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Le premier réseau social de l'écosystème nocturne</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              <span className="font-vybbi">Vybbi</span> révolutionne la découverte et le networking professionnel dans l'industrie de la nuit. 
              Votre profil devient votre référence officielle reconnue par tous les acteurs du secteur.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
                  <Users className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground">Networking Intelligent</h3>
                <p className="text-muted-foreground">
                  Découvrez et connectez-vous avec les professionnels qui correspondent exactement à vos besoins grâce à notre IA de matching avancée.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
                  <Star className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground">Réputation Vérifiée</h3>
                <p className="text-muted-foreground">
                  Système de reviews et certifications blockchain qui garantit l'authenticité des profils et des réalisations professionnelles.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border md:col-span-2 lg:col-span-1">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
                  <Globe className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground">Visibilité Mondiale</h3>
                <p className="text-muted-foreground">
                  Votre profil <span className="font-vybbi">Vybbi</span> devient votre carte de visite officielle, partageable et reconnue dans le monde entier.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link to="/auth?tab=signup">
                Rejoindre le réseau
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-2 sm:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Fonctionnalités puissantes</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour développer votre activité dans l'industrie musicale. Les agents et bookers bénéficient d'outils dédiés pour gérer leurs artistes, trouver de nouveaux talents et organiser des tournées.
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

      {/* Mitigation Strategies Section */}
      <section className="py-16 px-2 sm:px-6 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-6 text-sm px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              DÉCOUVREZ <span className="font-vybbi">VYBBI</span> SANS RISQUE
            </Badge>
            <h2 className="text-4xl font-bold mb-4 text-foreground">Commencez votre essai gratuit</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Nous facilitons votre adoption de <span className="font-vybbi">Vybbi</span> avec des offres de lancement exclusives 
              et un écosystème de partenaires pour vous accompagner dans votre croissance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-success flex items-center justify-center mx-auto mb-4 shadow-glow group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-8 h-8 text-success-foreground" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">
                  {isLoading ? '...' : trialDays} jours gratuits
                  {isPromotionalActive && !isLoading && ' 🎉'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Testez toutes nos fonctionnalités premium sans engagement ni carte bancaire.
                </p>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/auth?tab=signup">Commencer l'essai</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">Démo interactive</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Découvrez <span className="font-vybbi">Vybbi</span> en action avec nos scénarios d'utilisation détaillés.
                </p>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/demo">Voir la démo</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">Écosystème partenaires</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Rejoignez notre réseau d'écoles, labels, radios et plateformes partenaires.
                </p>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/partenariats">Découvrir</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow group-hover:scale-110 transition-transform">
                  <Gift className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">Programme Influenceur</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Gagnez jusqu'à 7000€/an avec notre programme d'affiliation exclusif.
                </p>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/influenceurs">Devenir Influenceur</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-card border-border rounded-2xl p-8 shadow-glow text-center">
            <div className="max-w-2xl mx-auto">
              <Badge className="mb-6 text-sm px-4 py-2 bg-gradient-primary">
                <Gift className="w-4 h-4 mr-2" />
                PROGRAMME EXCLUSIF JUSQU'AU 31/01/2026
              </Badge>
              
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Gagnez jusqu'à 7000€/an
                </span>
                <br />
                avec notre Programme d'Affiliation
              </h3>
              
              <p className="text-muted-foreground mb-6">
                Rejoignez notre programme d'affiliation exclusif : 2€ par inscription + 0,50€/mois récurrents. 
                Exclusivité limitée jusqu'au 31 janvier 2026.
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-6 max-w-lg mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">2€</div>
                  <div className="text-xs text-muted-foreground">Par inscription</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">0,50€</div>
                  <div className="text-xs text-muted-foreground">Par mois</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">7000€</div>
                  <div className="text-xs text-muted-foreground">Potentiel/an</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <Link to="/influenceurs">
                    Découvrir le Programme
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                  <Link to="/auth?ref=influencer">
                    Devenir Influenceur
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-card border-border rounded-2xl p-8 shadow-glow text-center mt-8">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Prêt à transformer votre activité musicale ?
              </h3>
              <p className="text-muted-foreground mb-6">
                Rejoignez plus de 10 000 professionnels qui utilisent déjà <span className="font-vybbi">Vybbi</span> pour développer 
                leur réseau et augmenter leurs bookings. Essai gratuit de {isLoading ? '...' : trialDays} jours, puis seulement 49€/mois.
                {isPromotionalActive && !isLoading && <span className="block mt-2 text-green-600 font-medium">
                    🎉 Offre limitée : {trialDays} jours d'essai pour les premiers inscrits !
                  </span>}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <Link to="/auth">
                    Essai gratuit {isLoading ? '...' : trialDays} jours
                    {isPromotionalActive && !isLoading && ' 🎉'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                  <Link to="/demo">
                    <Play className="mr-2 h-5 w-5" />
                    Voir comment ça marche
                  </Link>
                 </Button>
               </div>
             </div>
           </div>
         </div>
        </section>

        {/* Affiliate Program Section */}
        <section className="py-16 px-2 sm:px-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-y border-border bg-slate-950">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-6 text-sm px-4 py-2 bg-gradient-primary">
                <Gift className="w-4 h-4 mr-2" />
                PROGRAMME EXCLUSIF JUSQU'AU 31/01/2026
              </Badge>
              <h2 className="text-4xl font-bold mb-4 text-foreground">Programme d'Affiliation <span className="font-vybbi">Vybbi.app</span></h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Rejoignez notre programme d'affiliation exclusif et générez des revenus récurrents 
                en recommandant <span className="font-vybbi">Vybbi</span>. 2€ par inscription + 0,50€/mois récurrents.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300 text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-primary mb-2">2€</div>
                  <div className="text-sm text-muted-foreground mb-2">Par inscription</div>
                  <p className="text-xs text-muted-foreground">Commission immédiate</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300 text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-primary mb-2">0,50€</div>
                  <div className="text-sm text-muted-foreground mb-2">Par mois</div>
                  <p className="text-xs text-muted-foreground">Revenus récurrents</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300 text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-primary mb-2">7000€</div>
                  <div className="text-sm text-muted-foreground mb-2">Potentiel annuel</div>
                  <p className="text-xs text-muted-foreground">Top performers</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300 text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-primary mb-2">31/01</div>
                  <div className="text-sm text-muted-foreground mb-2">Fin exclusivité</div>
                  <p className="text-xs text-muted-foreground">Programme 2026</p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gradient-card border-border rounded-2xl p-8 shadow-glow text-center">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  🚨 Exclusivité Limitée dans le Temps 🚨
                </h3>
                <p className="text-lg text-muted-foreground mb-6">
                  Les commissions récurrentes de 0,50€/mois sont <strong>EXCLUSIVES</strong> aux influenceurs 
                  qui s'inscrivent avant le <strong>31 janvier 2026</strong>. Ne manquez pas cette opportunité unique !
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="text-lg px-8 py-6" asChild>
                    <Link to="/influenceurs">
                      Devenir Influenceur <span className="font-vybbi">Vybbi</span>
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                    <Link to="/influenceurs">
                      Calculer mes revenus
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Radio Vybbi Section */}
       <section className="py-16 px-2 sm:px-6 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10">
         <div className="container mx-auto">
           <div className="text-center mb-12">
             <h2 className="text-4xl font-bold mb-4">Radio <span className="font-vybbi">Vybbi</span> 24h/24</h2>
             <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
               Diffusez votre talent au monde entier avec notre radio dédiée aux artistes <span className="font-vybbi">Vybbi</span>. 
               Être écouté partout, à tout moment, et grimper dans notre Top 50.
             </p>
           </div>

           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
             <Card className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
               <CardContent className="p-8 text-center">
                 <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
                   <Music className="w-8 h-8 text-primary-foreground" />
                 </div>
                 <h3 className="text-xl font-bold mb-4 text-foreground">Diffusion Mondiale</h3>
                 <p className="text-muted-foreground">
                   Vos créations diffusées 24h/24 pour toucher une audience internationale 
                   et vous faire découvrir par des agents du monde entier.
                 </p>
               </CardContent>
             </Card>

             <Card className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
               <CardContent className="p-8 text-center">
                 <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
                   <TrendingUp className="w-8 h-8 text-primary-foreground" />
                 </div>
                 <h3 className="text-xl font-bold mb-4 text-foreground">Statistiques Détaillées</h3>
                 <p className="text-muted-foreground">
                   Suivez vos écoutes en temps réel, votre progression dans le classement 
                   et l'évolution de votre popularité.
                 </p>
               </CardContent>
             </Card>

             <Card className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300 md:col-span-2 lg:col-span-1">
               <CardContent className="p-8 text-center">
                 <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
                   <Trophy className="w-8 h-8 text-primary-foreground" />
                 </div>
                 <h3 className="text-xl font-bold mb-4 text-foreground">Top 50 Artistes</h3>
                 <p className="text-muted-foreground">
                   Intégrez notre classement prestigieux des artistes les plus écoutés 
                   et les mieux notés de la plateforme.
                 </p>
               </CardContent>
             </Card>
           </div>

           <div className="text-center mt-12">
             <Button size="lg" asChild className="text-lg px-8 py-6">
               <Link to="/top-artistes">
                 Découvrir le Top 50
                 <TrendingUp className="ml-2 h-5 w-5" />
               </Link>
             </Button>
           </div>
         </div>
       </section>

       {/* Excellence & Reviews */}
       <section className="py-16 px-2 sm:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-6 text-sm px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              TRANSPARENCE & PROFESSIONNALISME
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Avis vérifiés et transparents</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              <span className="font-vybbi">Vybbi</span> promeut la transparence et le professionnalisme en permettant aux lieux, agents et managers 
              de laisser des avis vérifiés sur les artistes. Cette exigence de qualité distingue notre plateforme 
              et garantit le sérieux de tous nos talents.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
                  <CheckCircle className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground">Avis certifiés</h3>
                <p className="text-muted-foreground">
                  Seuls les professionnels ayant travaillé avec les artistes peuvent laisser des avis, 
                  garantissant leur authenticité et leur pertinence.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
                  <Star className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground">Évaluation 5 étoiles</h3>
                <p className="text-muted-foreground">
                  Système de notation transparent qui aide les organisateurs d'événements 
                  à prendre des décisions éclairées sur leurs bookings.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
                  <TrendingUp className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground">Excellence renforcée</h3>
                <p className="text-muted-foreground">
                  Cette exigence de transparence pousse tous les artistes vers l'excellence 
                  et renforce la qualité globale de l'écosystème <span className="font-vybbi">Vybbi</span>.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 px-2 sm:px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Les pionniers témoignent</h2>
            <p className="text-xl text-muted-foreground">
              Découvrez ce que disent nos early adopters et partenaires
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

      {/* VYBBI Token Meme Coin Section */}
      <section className="py-16 px-2 sm:px-6 bg-gradient-to-br from-purple-900/20 via-background to-pink-900/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-pink-500/10"></div>
        <div className="container mx-auto relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4 border border-purple-500/20">
              <Rocket className="w-4 h-4 text-purple-400 animate-bounce" />
              <span className="text-sm font-medium text-purple-300">Nouveau</span>
              <Coins className="w-4 h-4 text-pink-400" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Le <span className="font-vybbi">VYBBI</span> Token 🚀
            </h2>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-2">
              Découvrez le <strong className="text-purple-400">meme coin</strong> qui révolutionne l'économie de la nuit !
            </p>
            
            <p className="text-base text-muted-foreground/80 max-w-2xl mx-auto">
              Plus qu'une cryptomonnaie, le <span className="font-vybbi">VYBBI</span> est le carburant de votre succès dans l'écosystème musical.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-12">
            {/* Left Image - Space Meme */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl p-6 backdrop-blur-sm border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:scale-105">
                <img 
                  src={vybbiMemeSpace} 
                  alt="VYBBI Token Space Meme" 
                  className="w-full h-auto rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
                />
                <div className="absolute top-4 right-4">
                  <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 border border-purple-500/30">
                    <span className="text-xs font-medium text-purple-300">🌌 To the Moon!</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Image - DJ Token */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 animate-pulse"></div>
              <div className="relative bg-gradient-to-bl from-pink-900/30 to-purple-900/30 rounded-2xl p-6 backdrop-blur-sm border border-pink-500/20 hover:border-pink-400/40 transition-all duration-300 hover:scale-105">
                <img 
                  src={vybbiDjToken} 
                  alt="VYBBI DJ Control Token" 
                  className="w-full h-auto rounded-xl shadow-2xl hover:shadow-pink-500/25 transition-all duration-300"
                />
                <div className="absolute top-4 right-4">
                  <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 border border-pink-500/30">
                    <span className="text-xs font-medium text-pink-300">🎧 Music Power</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-gradient-to-br from-purple-900/20 to-transparent border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-6 h-6 text-white animate-bounce" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Meme Power</h3>
                <p className="text-sm text-muted-foreground">Le fun et la viralité au service de votre croissance</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-pink-900/20 to-transparent border-pink-500/20 hover:border-pink-400/40 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Music First</h3>
                <p className="text-sm text-muted-foreground">Conçu par et pour l'industrie musicale</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-900/20 to-transparent border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Community</h3>
                <p className="text-sm text-muted-foreground">Une communauté passionnée qui fait la différence</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-pink-900/20 to-transparent border-pink-500/20 hover:border-pink-400/40 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Early Access</h3>
                <p className="text-sm text-muted-foreground">Rejoignez les pionniers dès maintenant</p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="inline-flex flex-col sm:flex-row gap-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none shadow-lg hover:shadow-purple-500/25 text-lg px-8 py-6 animate-pulse hover:animate-none" 
                asChild
              >
                <Link to="/token">
                  <Coins className="mr-2 h-5 w-5" />
                  Découvrir le <span className="font-vybbi">VYBBI</span> Token
                  <Rocket className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400/50 text-lg px-8 py-6" 
                asChild
              >
                <Link to="/token#roadmap">
                  <Star className="mr-2 h-4 w-4" />
                  Voir la Roadmap
                </Link>
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground/60 mt-4 max-w-lg mx-auto">
              ⚠️ Les cryptomonnaies sont des investissements risqués. Ne jamais investir plus que ce que vous pouvez vous permettre de perdre.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-2 sm:px-6">
        <div className="container mx-auto">
          <Card className="bg-gradient-primary border-border shadow-glow">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl font-bold mb-4 text-primary-foreground">Devenez membre fondateur</h2>
              <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
                Soyez parmi les premiers à façonner l'avenir de l'industrie musicale. Places limitées pour les fondateurs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
                  <Link to="/auth">
                    Réserver ma place
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                  Accès VIP démo
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
                <img src="/images/brand/vybbi-logo.png" alt="Vybbi Logo" className="w-8 h-8" />
                 <span className="font-bold text-xl text-foreground font-vybbi">Vybbi</span>
               </div>
               <p className="text-muted-foreground">
                 Le loup des nuits qui déniche les talents et connecte l'écosystème musical.
               </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/fonctionnalites" className="hover:text-foreground transition-colors">Fonctionnalités</Link></li>
                <li><Link to="/tarifs" className="hover:text-foreground transition-colors">Tarifs</Link></li>
                <li><Link to="/pour-artistes" className="hover:text-foreground transition-colors">Artistes</Link></li>
                <li><Link to="/pour-lieux-evenements" className="hover:text-foreground transition-colors">Lieux</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/centre-aide" className="hover:text-foreground transition-colors">Centre d'aide</Link></li>
                <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/confidentialite" className="hover:text-foreground transition-colors">Confidentialité</Link></li>
                <li><Link to="/conditions" className="hover:text-foreground transition-colors">Conditions</Link></li>
                <li><Link to="/cookies" className="hover:text-foreground transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>© 2025 <span className="font-vybbi">Vybbi</span>. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>;
}