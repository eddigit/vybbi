import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, Users, Building2, Radio, Brain, Calendar, FileCheck, CheckCircle, Target, TrendingUp, Shield, AlertTriangle, Coins, Clock, Award, Download, Zap, X, Heart, Briefcase, MapPin } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PartnershipCTA } from '@/components/PartnershipCTA';
import vybbiLogo from "@/assets/vybbi-wolf-logo.png";
export default function LaunchPartnerParis() {
  // Structured Data pour l'offre
  const offerStructuredData = {
    "@context": "https://schema.org",
    "@type": "Offer",
    "name": "Launch Partner Paris - Vybbi",
    "description": "Partenariat exclusif pour le lancement de Vybbi à Paris",
    "price": "5000",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/LimitedAvailability",
    "url": "https://vybbi.com/partners/launch-paris",
    "seller": {
      "@type": "Organization",
      "name": "Vybbi",
      "url": "https://vybbi.com"
    },
    "validFrom": "2025-01-15",
    "validThrough": "2026-02-28"
  };

  // Structured Data pour les FAQ
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [{
      "@type": "Question",
      "name": "Quelle est la durée du partenariat Launch Partner Paris ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Le partenariat Launch Partner dure 90 jours à partir du lancement de la bêta Vybbi à Paris, prévu début décembre 2025."
      }
    }, {
      "@type": "Question",
      "name": "Qu'est-ce que l'exclusivité géographique ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Vous êtes le seul partenaire de votre catégorie dans la région parisienne pendant 90 jours. Pour le pack 10k€, l'exclusivité s'étend à toutes les catégories."
      }
    }, {
      "@type": "Question",
      "name": "Quelles mesures de performance sont fournies ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Vous recevrez un reporting hebdomadaire incluant : inscriptions, reach, engagement, clics UTM, et conversion. Un case study final complet sera fourni en fin de partenariat."
      }
    }, {
      "@type": "Question",
      "name": "Quelles sont les modalités de paiement ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Paiement en une fois ou en deux versements (50% au lancement, 50% à J+45). Facture conforme, contrat de partenariat fourni."
      }
    }, {
      "@type": "Question",
      "name": "Peut-on personnaliser l'activation locale ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui, vous choisissez entre 3 formats : Vybbi Sessions Paris (3 masterclass), Top 50 Paris sponsorisé, ou concours 'Road to [Lieu]'. Nous pouvons adapter selon vos objectifs."
      }
    }]
  };
  const handleDownload = () => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'onepager_download', {
        event_category: 'Partnership',
        event_label: 'pdf_download'
      });
    }
  };
  return <>
      <SEOHead title="Launch Partner Paris - Devenez le partenaire exclusif de Vybbi" description="Rejoignez Vybbi comme Launch Partner exclusif à Paris. 90 jours d'activation, branding 'Presented by', reporting complet. 1 seul slot disponible." keywords="partnership, sponsoring, marketing, paris, nightlife, music industry, launch partner, brand activation" canonicalUrl="https://vybbi.com/partners/launch-paris" structuredData={[offerStructuredData, faqStructuredData]} type="website" />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 px-6 bg-gradient-to-br from-primary/20 via-purple-500/10 to-background overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="container mx-auto relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <Badge variant="outline" className="text-sm px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 animate-pulse">
                  <Rocket className="w-4 h-4 mr-2" />
                  Exclusif – 1 seul slot disponible
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Launch Partner Paris — Vybbi
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Devenez le partenaire exclusif qui propulse le lancement de Vybbi à Paris. 
                <span className="font-semibold text-foreground"> 90 jours d'activation</span>, 
                "Presented by [Marque]" sur tous nos supports, et une audience ultra-ciblée d'artistes et de programmateurs.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <PartnershipCTA source="landing-hero" size="lg" />
                <Button variant="outline" size="lg" asChild onClick={handleDownload}>
                  <a href="/docs/vybbi-launch-partner-paris.pdf" download="VYBBIapp-La-plateforme-qui-revolutionne-la-decouverte-et-le-booking-des-jeunes-talents.pdf">
                    <Download className="mr-2 h-5 w-5" />
                    Télécharger le one-pager
                  </a>
                </Button>
              </div>

              {/* Mockup "Presented by" */}
              <Card className="shadow-2xl border-2 border-primary/20 bg-gradient-to-br from-background to-muted/30">
                <CardContent className="p-0">
                  
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Durée / Zone / Objectif Banner */}
        <section className="py-8 px-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-y-2 border-orange-400/50">
          <div className="container mx-auto">
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Calendar className="w-8 h-8 text-orange-600" />
                  <h3 className="font-bold text-lg">Durée</h3>
                  <p className="text-muted-foreground">90 jours (Déc-Jan-Fév)</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <MapPin className="w-8 h-8 text-orange-600" />
                  <h3 className="font-bold text-lg">Zone</h3>
                  <p className="text-muted-foreground">Paris IDF (Exclusivité géo)</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Target className="w-8 h-8 text-orange-600" />
                  <h3 className="font-bold text-lg">Objectif</h3>
                  <p className="text-muted-foreground">Impact Max (Lancement premium)</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Notre Mission */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Notre Mission</h2>
              <p className="text-lg text-muted-foreground mb-4">
                Vybbi connecte les <span className="font-semibold text-foreground">jeunes talents artistiques</span> (DJ, 
                chanteurs, danseurs, magiciens) et les <span className="font-semibold text-foreground">professionnels de l'industrie</span> (agents, 
                managers, lieux, festivals).
              </p>
              <p className="text-xl font-semibold text-primary">
                Nous créons l'écosystème manquant pour propulser les talents de demain
              </p>
            </div>
          </div>
        </section>

        {/* Le Problème Actuel */}
        <section className="py-16 px-6">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Le Problème Actuel</h2>
                <p className="text-lg text-muted-foreground">
                  L'industrie musicale et du spectacle souffre d'un manque d'outils adaptés
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Pour les Jeunes Talents */}
                <Card className="border-2 border-red-500/30 bg-red-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <AlertTriangle className="w-6 h-6" />
                      Pour les Jeunes Talents
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">Invisibilité sur les plateformes saturées</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">Absence d'outils pro pour se faire remarquer</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">Difficultés à trouver des dates et des agents</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">Pas de visibilité sur leur progression</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Pour les Professionnels */}
                <Card className="border-2 border-pink-500/30 bg-pink-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-pink-600 dark:text-pink-400">
                      <AlertTriangle className="w-6 h-6" />
                      Pour les Professionnels
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <X className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">Recherche de talents chronophage et inefficace</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <X className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">Bookings gérés par emails/WhatsApp = chaos</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <X className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">Manque de données pour évaluer les artistes</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <X className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">Réseau limité et peu évolutif</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* La Solution Vybbi */}
        <section className="py-16 px-6 bg-gradient-to-br from-primary/5 via-purple-500/5 to-background">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">La Solution Vybbi</h2>
                <p className="text-lg text-muted-foreground">
                  Une plateforme tout-en-un pour révolutionner l'industrie
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Pour les Artistes */}
                <Card className="border-2 border-blue-500/30 hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-8 h-8 text-blue-500" />
                      <CardTitle>Pour les Artistes</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">Profil pro avec portfolio multimédia</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">Visibilité via radio 24/7 et tops</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">Matching IA avec lieux et agents</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">Analytics et progression trackée</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">Calendrier et gestion de dates</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">Networking ciblé et opportunités</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Pour Agents & Lieux */}
                <Card className="border-2 border-green-500/30 hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Building2 className="w-8 h-8 text-green-500" />
                      <CardTitle>Pour Agents & Lieux</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">Recherche intelligente multi-critères</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">Suggestions IA de talents pertinents</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">CRM intégré pour prospection</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">Booking simplifié en quelques clics</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">Gestion d'événements et plannings</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">Analytics et reporting automatisés</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Pour les Marques */}
                <Card className="border-2 border-purple-500/30 hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Coins className="w-8 h-8 text-purple-500" />
                      <CardTitle>Pour les Marques</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">Accès à une audience ultra-ciblée</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">Activations sur-mesure (events, tops)</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">Branding intégré non intrusif</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">Reporting précis et mesurable</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">Co-création de contenus engageants</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">Positionnement d'early supporter</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Ce que vous obtenez en 15 jours */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="container mx-auto">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ce que vous obtenez en 15 jours</h2>
                <p className="text-lg text-muted-foreground">
                  Une mise en place rapide pour maximiser votre visibilité dès le lancement
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-2 border-primary/30">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold">
                        J+7
                      </div>
                      <CardTitle>Visibilité immédiate</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Branding "Presented by [Marque]" en place sur la plateforme, 
                      site web, emails d'activation et communications réseaux sociaux.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary/30">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold">
                        J+14
                      </div>
                      <CardTitle>Activation planifiée</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Activation locale validée avec vos équipes, assets créatifs approuvés, 
                      calendrier de diffusion défini et premiers KPIs établis.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* L'Offre Launch Partner */}
        <section className="py-16 px-6">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">L'offre Launch Partner Paris</h2>
                <p className="text-lg text-muted-foreground">
                  Deux formules pour accompagner votre stratégie de marque lors du lancement de Vybbi à Paris.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Pack SILVER */}
                <Card className="border-2 border-slate-300 hover:border-slate-400 transition-all duration-300 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/30 dark:to-background">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-gradient-to-r from-slate-400 to-slate-500 text-white px-4 py-1 text-sm font-bold">
                        SILVER
                      </Badge>
                    </div>
                    <div className="mb-4">
                      <p className="text-4xl font-bold">5 000 €</p>
                      <p className="text-sm text-muted-foreground mt-1">Engagement 90 jours</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">Visibilité & Branding</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Mention <strong>"Powered by [Marque]"</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Page sponsor dédiée</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Logo emails campagne</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">10+ posts réseaux sociaux</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">Activations</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">1 Session sponsorisée</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Top 50 mensuel</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">1 Concours co-brandé</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">Performance</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Liens UTM personnalisés</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Reporting hebdomadaire</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Case study final</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <PartnershipCTA 
                        variant="outline" 
                        source="pack-silver" 
                        size="default"
                        className="w-full border-slate-400 hover:bg-slate-50"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Pack GOLD */}
                <Card className="border-2 border-orange-400 hover:border-orange-500 transition-all duration-300 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 relative overflow-hidden shadow-lg">
                  <div className="absolute top-0 right-0 bg-gradient-to-bl from-orange-500 to-amber-500 text-white px-4 py-1 text-xs font-semibold">
                    RECOMMANDÉ
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-gradient-to-r from-orange-400 to-amber-500 text-white px-4 py-1 text-sm font-bold">
                        GOLD
                      </Badge>
                    </div>
                    <div className="mb-4">
                      <p className="text-4xl font-bold text-orange-900 dark:text-orange-100">10 000 €</p>
                      <p className="text-sm text-muted-foreground mt-1">Engagement 90 jours</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-300 dark:border-orange-700 rounded-lg p-3">
                      <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                        ✨ Tout Silver, PLUS :
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 text-orange-900 dark:text-orange-100 flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-500" />
                        Exclusivités
                      </h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm"><strong>Exclusivité catégorielle Paris</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Mention <strong>"Presented by"</strong></span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 text-orange-900 dark:text-orange-100 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                        Activations Renforcées
                      </h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">3 Sessions sponsorisées (vs 1)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm"><strong>Top 50 avec vos critères</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">2 Concours (vs 1)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm"><strong>5 talents ambassadeurs</strong></span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 text-orange-900 dark:text-orange-100 flex items-center gap-2">
                        <Radio className="w-4 h-4 text-orange-600" />
                        Contenus Premium
                      </h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">3 vidéos co-créées</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Interview Radio/WebTV</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Newsletter 10K+ abonnés</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 text-orange-900 dark:text-orange-100 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-orange-600" />
                        ROI Garanti
                      </h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm"><strong>500k+ impressions</strong> min</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm"><strong>50k+ interactions</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Reporting bi-hebdo</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="pt-4 border-t border-orange-200 dark:border-orange-800">
                      <PartnershipCTA 
                        variant="default" 
                        source="pack-gold" 
                        size="default"
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Pourquoi maintenant */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <Card className="border-2 border-orange-500/50 bg-gradient-to-br from-orange-500/10 to-background">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="w-8 h-8 text-orange-500" />
                    <CardTitle className="text-3xl">Pourquoi maintenant ?</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-lg">
                    Lancement bêta Paris <span className="font-bold text-orange-500">début décembre 2025</span>. 
                  </p>
                  <p className="text-muted-foreground">
                    Être Launch Partner, c'est devenir l'<span className="font-semibold text-foreground">"early believer" fondateur</span>, 
                    bénéficier d'une <span className="font-semibold text-foreground">exclusivité rare</span> et d'une 
                    <span className="font-semibold text-foreground"> mémorisation durable</span> au moment où tout démarre.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge variant="outline" className="bg-background">
                      <Clock className="w-3 h-3 mr-1" />
                      First mover advantage
                    </Badge>
                    <Badge variant="outline" className="bg-background">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Mémorisation maximale
                    </Badge>
                    <Badge variant="outline" className="bg-background">
                      <Award className="w-3 h-3 mr-1" />
                      Statut fondateur
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Brand Safety & Conformité */}
        <section className="py-16 px-6">
          <div className="container mx-auto">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Brand safety et conformité</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Shield className="w-6 h-6 text-blue-500" />
                      <CardTitle>RGPD</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Collecte minimale, analytics agrégés, pas de revente de données. 
                      Hébergement France (Supabase EU). Conformité totale RGPD.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-6 h-6 text-orange-500" />
                      <CardTitle>UGC / Modération</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Charte stricte, signalement et modération proactive. 
                      Validation des profils, contenus protégés, environnement sécurisé.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Shield className="w-6 h-6 text-green-500" />
                      <CardTitle>Alcool (Loi Evin)</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Conformité loi Evin : ciblage 18+, mentions sanitaires obligatoires, 
                      pas d'incitation excessive. Publicités contrôlées.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Coins className="w-6 h-6 text-purple-500" />
                      <CardTitle>Crypto (optionnel)</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Fonctionnalités blockchain optionnelles, séparées des activations marque. 
                      Aucune obligation d'achat crypto. Transparence totale.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Roadmap d'activation */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="container mx-auto">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Calendrier type (90 jours)</h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[{
                icon: Calendar,
                week: 'Semaine 1',
                title: 'Validation',
                description: 'Validation du co-branding, choix de l\'activation, plan médias',
                color: 'text-blue-500'
              }, {
                icon: Rocket,
                week: 'Semaines 2-4',
                title: 'Lancement',
                description: 'Lancement bêta + mise en avant "Presented by [Marque]"',
                color: 'text-green-500'
              }, {
                icon: Zap,
                week: 'Semaines 5-8',
                title: 'Activation',
                description: 'Activation locale (Sessions/Top 50/Concours) + amplification',
                color: 'text-orange-500'
              }, {
                icon: FileCheck,
                week: 'Semaines 9-12',
                title: 'Wrap-up',
                description: 'Reporting final, recommandations next steps, case study',
                color: 'text-purple-500'
              }].map((step, index) => <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <step.icon className={`w-12 h-12 mx-auto mb-4 ${step.color}`} />
                      <Badge variant="outline" className="mb-3">{step.week}</Badge>
                      <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>)}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-6">
          <div className="container mx-auto">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Questions fréquentes</h2>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Quelle est la durée du partenariat ?</AccordionTrigger>
                  <AccordionContent>
                    Le partenariat Launch Partner dure 90 jours à partir du lancement de la bêta Vybbi à Paris, 
                    prévu le 8 avril 2025. Cette période couvre le lancement, l'activation locale et le reporting final.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Qu'est-ce que l'exclusivité géographique ?</AccordionTrigger>
                  <AccordionContent>
                    Pour le pack Essential (5k€), vous êtes le seul partenaire de votre catégorie (ex: boissons, équipement) 
                    dans la région parisienne pendant 90 jours. Pour le pack Premium (10k€), l'exclusivité s'étend à 
                    <strong> toutes les catégories</strong> : aucun autre sponsor ne peut être associé à Vybbi Paris pendant cette période.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Quelles mesures de performance sont fournies ?</AccordionTrigger>
                  <AccordionContent>
                    Vous recevrez un reporting hebdomadaire incluant : nombre d'inscriptions depuis le lancement, 
                    reach des publications mentionnant votre marque, engagement (likes, partages, commentaires), 
                    clics UTM vers votre page sponsor, et taux de conversion. Un case study final complet sera fourni 
                    en fin de partenariat avec recommandations stratégiques.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>Quelles sont les modalités de paiement ?</AccordionTrigger>
                  <AccordionContent>
                    Paiement en une fois ou en deux versements (50% au lancement, 50% à J+45). 
                    Facture conforme fournie, contrat de partenariat détaillé. Nous acceptons virement bancaire 
                    et paiements CB pour les structures. Devis personnalisé disponible sur demande.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>Peut-on personnaliser l'activation locale ?</AccordionTrigger>
                  <AccordionContent>
                    Absolument ! Vous choisissez entre 3 formats : <strong>Vybbi Sessions Paris</strong> (3 masterclass courtes), 
                    <strong>Top 50 Paris sponsorisé</strong> (classement des artistes les plus actifs), ou 
                    <strong>concours "Road to [Lieu]"</strong> (gagnant booké dans un lieu partenaire). 
                    Nous pouvons adapter le format selon vos objectifs et votre audience cible.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>Quelle audience puis-je toucher ?</AccordionTrigger>
                  <AccordionContent>
                    Vybbi cible les professionnels de la nuit et du spectacle à Paris : DJs, producteurs, 
                    chanteurs, danseurs, magiciens, agents/managers, programmateurs de clubs, festivals et événements. 
                    Une audience premium, ultra-engagée, avec un fort pouvoir de prescription dans l'industrie.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 px-6 bg-gradient-to-br from-primary/10 via-purple-500/5 to-background">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Prenons 15 minutes pour valider Paris
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Discutons de votre positionnement, de vos objectifs, et construisons ensemble 
                une activation sur-mesure pour votre marque.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <PartnershipCTA source="landing-footer" size="lg" />
                <Button variant="outline" size="lg" asChild onClick={handleDownload}>
                  <a href="/docs/vybbi-launch-partner-paris.pdf" download="VYBBIapp-La-plateforme-qui-revolutionne-la-decouverte-et-le-booking-des-jeunes-talents.pdf">
                    <Download className="mr-2 h-5 w-5" />
                    Télécharger le one-pager
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer conformité */}
        <footer className="border-t py-8 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <p className="text-xs text-muted-foreground">
                L'abus d'alcool est dangereux pour la santé. À consommer avec modération. 
                Réservé aux +18 ans. Publicités conformes à la Loi Evin.
              </p>
              
              <p className="text-xs text-muted-foreground">
                Vos données sont collectées conformément au RGPD. 
                <Link to="/confidentialite" className="underline ml-1 hover:text-foreground">
                  Politique de confidentialité
                </Link>
              </p>
              
              <p className="text-xs text-muted-foreground">
                Les fonctionnalités blockchain (tokens VYBBI) sont optionnelles et séparées 
                des activations commerciales. Aucune obligation d'achat crypto.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>;
}