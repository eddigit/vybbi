import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Crown, Music, Building2, Users, Star, CheckCircle, Globe, Calendar, MessageCircle, Trophy, Zap, ArrowRight, Mail, Phone, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Fondateurs() {
  const [remainingPlaces] = useState(347);
  const [weeklyApplications] = useState(89);
  const [acceptanceRate] = useState(73);

  const artistBenefits = [
    "Abonnement gratuit à vie (valeur : 144€/an)",
    "Badge \"Membre Fondateur\" sur votre profil",
    "Mise en avant prioritaire dans les recommandations",
    "Accès bêta à toutes les nouvelles fonctionnalités",
    "Commission réduite : 3% au lieu de 5% à vie",
    "Support VIP avec ligne directe dédiée"
  ];

  const organisateurBenefits = [
    "6 mois gratuits puis 50% de réduction à vie",
    "Accès prioritaire aux nouveaux talents",
    "Fonctionnalités premium incluses (analytics, CRM)",
    "Invitation événements exclusifs Vybbi",
    "Consultation gratuite avec nos experts",
    "Partenariats préférentiels avec nos services"
  ];

  const agentBenefits = [
    "Tarif fondateur : 15€/mois au lieu de 25€ à vie",
    "Outils avancés en avant-première",
    "Réseau privilégié avec autres professionnels",
    "Formation gratuite aux nouvelles technologies",
    "Accès VIP aux événements industrie",
    "Programme de parrainage avec commissions"
  ];

  const exclusiveEvents = [
    "Soirées networking dans les plus beaux lieux",
    "Masterclass avec les plus grands artistes",
    "Avant-premières et showcases exclusifs",
    "Voyages découverte dans les capitales musicales"
  ];

  const successStories = [
    {
      quote: "Être membre fondateur m'a ouvert des portes que je n'imaginais même pas. En 6 mois, j'ai décroché plus de gigs que dans toute ma carrière.",
      author: "Alex",
      role: "DJ Berlin"
    },
    {
      quote: "Le réseau Vybbi m'a permis de découvrir des artistes incroyables avant tout le monde. Mon club est devenu LA référence.",
      author: "Marina",
      role: "Propriétaire Club Barcelona"
    },
    {
      quote: "Grâce au statut fondateur, j'ai pu développer mon agence à l'international en un temps record.",
      author: "Thomas",
      role: "Agent Paris"
    }
  ];

  const teamTestimonials = [
    {
      quote: "Les membres fondateurs ne sont pas que des utilisateurs, ce sont nos partenaires. Ils construisent Vybbi avec nous.",
      role: "CEO & Fondateur"
    },
    {
      quote: "Chaque feedback de nos fondateurs nous aide à créer la plateforme parfaite pour l'industrie.",
      role: "Head of Product"
    },
    {
      quote: "La communauté fondateur est notre plus grande fierté. C'est là que naissent les plus belles collaborations.",
      role: "Community Manager"
    }
  ];

  const roadmapItems = [
    { quarter: "Q1 2026", event: "Sortie officielle de la plateforme Vybbi le 1er janvier 2026 avec événement fondateurs VIP" },
    { quarter: "Q2 2026", event: "Expansion européenne (accès prioritaire nouveaux marchés)" },
    { quarter: "Q3 2026", event: "Fonctionnalités IA avancées (bêta exclusive)" },
    { quarter: "Q4 2026", event: "Vybbi Festival - événement annuel fondateurs" }
  ];

  const faqItems = [
    {
      question: "Que se passe-t-il si Vybbi change ses tarifs ?",
      answer: "Vos avantages fondateurs sont garantis à vie, quoi qu'il arrive."
    },
    {
      question: "Puis-je parrainer d'autres professionnels ?",
      answer: "Oui ! Chaque parrainage validé vous donne des crédits sur la plateforme."
    },
    {
      question: "Les avantages sont-ils transférables ?",
      answer: "Non, le statut fondateur est personnel et non cessible."
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
                <img src="/images/brand/vybbi-logo.png" alt="Vybbi Logo" className="w-8 h-8" />
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
            <Crown className="w-4 h-4 mr-2" />
            MEMBRES FONDATEURS
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              L'Histoire se Écrit
            </span>
            <br />
            <span className="text-foreground">Maintenant</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Il y a des moments dans l'histoire où tout bascule. Où une innovation change à jamais la façon dont une industrie fonctionne. 
            Vybbi.app est ce moment pour l'entertainment nocturne. Et vous pouvez en faire partie dès le premier jour.
          </p>

          <Card className="bg-gradient-card border-border shadow-glow mb-8">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Membres Fondateurs : Les Privilégiés de l'Aventure</h2>
              <p className="text-muted-foreground">
                Être membre fondateur de Vybbi.app, ce n'est pas seulement rejoindre une plateforme. 
                C'est intégrer une communauté exclusive de visionnaires qui façonnent l'avenir de la musique mondiale.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Avantages Exclusifs Membres Fondateurs</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Des privilèges uniques pour chaque type de professionnel de l'industrie
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Artists */}
            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-glow">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">Pour les Artistes</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {artistBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Organisateurs */}
            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-glow">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">Pour les Lieux & Organisateurs</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {organisateurBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Agents */}
            <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-glow">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">Pour les Agents & Managers</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {agentBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">La Communauté qui Change Tout</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Rejoignez un réseau exclusif de professionnels visionnaires
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-3xl font-bold mb-6">Réseau Mondial Exclusif</h3>
              <p className="text-xl text-muted-foreground mb-8">
                Connectez-vous avec des professionnels de 34 pays, partagez vos expériences, 
                découvrez les tendances avant tout le monde.
              </p>
              
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">34</div>
                  <div className="text-sm text-muted-foreground">Pays</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">1K+</div>
                  <div className="text-sm text-muted-foreground">Professionnels</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">Support</div>
                </div>
              </div>
            </div>
            
            <Card className="bg-gradient-card border-border shadow-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Événements Privés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {exclusiveEvents.map((event, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-warning" />
                      <span className="text-sm text-muted-foreground">{event}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-card border-border shadow-glow">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Influence sur le Produit</CardTitle>
              <p className="text-center text-muted-foreground">
                Votre voix compte ! Les membres fondateurs participent activement au développement de Vybbi
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-3 shadow-glow">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold mb-2">Votes sur les nouvelles fonctionnalités</h4>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-3 shadow-glow">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold mb-2">Tests bêta en avant-première</h4>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-3 shadow-glow">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold mb-2">Feedback direct avec l'équipe produit</h4>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-3 shadow-glow">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold mb-2">Roadmap co-construite avec la communauté</h4>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Success Stories Membres Fondateurs</h2>
            <p className="text-xl text-muted-foreground">
              Des témoignages qui parlent d'eux-mêmes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <Card key={index} className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{story.quote}"</p>
                  <div className="border-t pt-4">
                    <div className="font-semibold text-foreground">{story.author}</div>
                    <div className="text-sm text-primary">{story.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Comment Devenir Membre Fondateur</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Un processus simple pour rejoindre l'élite de l'industrie
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <Card className="bg-gradient-card border-border shadow-glow">
              <CardHeader>
                <CardTitle>Conditions d'Éligibilité</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span>Professionnel actif de l'industrie musicale/événementielle</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span>Recommandation d'un membre existant OU</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span>Validation de votre profil par notre équipe</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border shadow-glow">
              <CardHeader>
                <CardTitle>Processus de Candidature</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">1</div>
                    <span>Inscription sur vybbi.app/fondateurs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">2</div>
                    <span>Soumission de votre dossier professionnel</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">3</div>
                    <span>Entretien avec notre équipe (15 min)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">4</div>
                    <span>Validation et accès immédiat aux privilèges</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Limited Places */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Places Limitées : Seulement 1000 Membres Fondateurs</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Pour préserver l'exclusivité et la qualité de notre communauté, nous limitons le statut de membre fondateur 
              aux 1000 premiers professionnels qui nous rejoignent.
            </p>
          </div>

          <Card className="bg-gradient-card border-border shadow-glow max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Compteur en Temps Réel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">{remainingPlaces}/1000</div>
                  <div className="text-sm text-muted-foreground">Places restantes</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-warning mb-2">{weeklyApplications}</div>
                  <div className="text-sm text-muted-foreground">Candidatures cette semaine</div>
                </div>
                <div>  
                  <div className="text-4xl font-bold text-success mb-2">{acceptanceRate}%</div>
                  <div className="text-sm text-muted-foreground">Taux d'acceptation</div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="bg-gradient-primary h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${((1000 - remainingPlaces) / 1000) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>0</span>
                <span>{1000 - remainingPlaces} membres acceptés</span>
                <span>1000</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Team Testimonials */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Témoignages de l'Équipe</h2>
            <p className="text-xl text-muted-foreground">
              Ce que pense notre équipe des membres fondateurs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {teamTestimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <Trophy className="w-12 h-12 text-warning mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div className="font-semibold text-primary">{testimonial.role}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Roadmap Exclusive 2026</h2>
            <p className="text-xl text-muted-foreground">
              Les étapes clés qui vous attendent en tant que membre fondateur
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {roadmapItems.map((item, index) => (
              <Card key={index} className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Badge className="text-lg px-3 py-1">{item.quarter}</Badge>
                    <div className="flex-1">
                      <p className="text-foreground font-medium">{item.event}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Engagement */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">L'Engagement Vybbi</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              En devenant membre fondateur, vous ne rejoignez pas seulement une plateforme. 
              Vous intégrez une famille de passionnés qui partagent la même vision : révolutionner l'industrie musicale 
              pour qu'elle soit plus juste, plus transparente, plus connectée.
            </p>
          </div>

          <Card className="bg-gradient-card border-border shadow-glow max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Notre Promesse</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-primary flex-shrink-0" />
                  <span>Innovation constante guidée par vos besoins</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="w-6 h-6 text-primary flex-shrink-0" />
                  <span>Transparence totale sur nos développements</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                  <span>Respect absolu de vos données et votre vie privée</span>
                </div>
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-primary flex-shrink-0" />
                  <span>Support inconditionnel de votre réussite</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">FAQ Membres Fondateurs</h2>
            <p className="text-xl text-muted-foreground">
              Les réponses à vos questions les plus fréquentes
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible>
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">Rejoignez-Nous Maintenant</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            L'opportunité de façonner l'avenir de l'entertainment ne se représentera pas. 
            Dans 5 ans, quand Vybbi.app sera devenu le standard mondial, vous pourrez dire : 
            <strong className="text-foreground"> "J'étais là dès le début."</strong>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link to="/auth">
                <Crown className="mr-2 h-5 w-5" />
                Candidature Membre Fondateur
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
              <a href="https://vybbi.app/fondateurs" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-5 w-5" />
                vybbi.app/fondateurs
              </a>
            </Button>
          </div>

          <Card className="bg-gradient-card border-border shadow-glow max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Contact Direct Gilles</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <a href="mailto:vybbiapp@gmail.com" className="text-primary hover:underline">
                  vybbiapp@gmail.com
                </a>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <a href="tel:+33652345180" className="text-primary hover:underline">
                  +33 6 52 34 51 80
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}