import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, 
  Users, 
  Building2, 
  Radio, 
  Brain, 
  Calendar, 
  FileCheck, 
  CheckCircle, 
  Target, 
  TrendingUp, 
  Shield, 
  AlertTriangle, 
  Coins,
  Clock,
  Award,
  Download,
  Zap
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Combien de temps pour être visible après signature ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sous 7 jours ouvrés : branding 'Presented by' en place; sous 14 jours : activation planifiée avec vos équipes."
        }
      },
      {
        "@type": "Question",
        "name": "Puis-je avoir l'exclusivité de ma catégorie ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Oui, avec le Pack Flagship (10 000 €), vous bénéficiez d'une exclusivité catégorielle (audio, boisson, média, etc.)."
        }
      },
      {
        "@type": "Question",
        "name": "Quels KPIs recevrons-nous ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Inscriptions, reach, vues, participations, clics UTM, mentions sociales. Reporting hebdomadaire et case study final."
        }
      },
      {
        "@type": "Question",
        "name": "Conditions pour marques alcool ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ciblage 18+, mentions sanitaires obligatoires, inventaires conformes à la loi Evin."
        }
      },
      {
        "@type": "Question",
        "name": "Quelle est la durée du partenariat ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Le partenariat Launch Partner dure 90 jours à partir du lancement de la bêta Vybbi à Paris, prévu le 8 avril 2025."
        }
      },
      {
        "@type": "Question",
        "name": "Peut-on personnaliser l'activation locale ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Oui, vous choisissez entre 3 formats : Vybbi Sessions Paris (3 masterclass), Top 50 Paris sponsorisé, ou concours 'Road to [Lieu]'. Nous pouvons adapter selon vos objectifs."
        }
      }
    ]
  };

  const handleDownload = () => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'onepager_download', {
        event_category: 'Partnership',
        event_label: 'pdf_download',
      });
    }
  };

  // Charger Calendly dynamiquement
  useEffect(() => {
    // Charger le CSS Calendly
    const link = document.createElement('link');
    link.href = 'https://assets.calendly.com/assets/external/widget.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Charger le JS Calendly
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    // Écouter l'événement de planification Calendly
    const handleCalendlyEvent = (e: MessageEvent) => {
      if (e.data?.event === 'calendly.event_scheduled') {
        if (typeof (window as any).gtag === 'function') {
          (window as any).gtag('event', 'calendly_event_scheduled', {
            event_category: 'booking',
            event_label: 'sponsor'
          });
        }
        if (typeof (window as any).fbq === 'function') {
          (window as any).fbq('track', 'Schedule', { content_name: 'sponsor' });
        }
      }
    };

    window.addEventListener('message', handleCalendlyEvent);

    // Cleanup
    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
      window.removeEventListener('message', handleCalendlyEvent);
    };
  }, []);

  return (
    <>
      <SEOHead
        title="Launch Partner Paris – Vybbi (sponsoring exclusif 90 jours)"
        description="Devenez le partenaire exclusif du lancement de Vybbi à Paris. 90 jours d'activation, branding 'Presented by', activations locales, reporting. Réservez un call de 15 min."
        keywords="partnership, sponsoring, marketing, paris, nightlife, music industry, launch partner, brand activation, exclusivité géographique"
        canonicalUrl="https://vybbi.com/partners/launch-paris"
        structuredData={[offerStructuredData, faqStructuredData]}
        type="website"
      />

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
              
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent font-vybbi">
            Launch Partner Paris — Vybbi
          </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Devenez le partenaire exclusif qui propulse le lancement de Vybbi à Paris. 
                <span className="font-semibold text-foreground"> 90 jours d'activation</span>, 
                "Presented by [Marque]" sur tous nos supports, et une audience ultra-ciblée d'artistes et de programmateurs.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
                <PartnershipCTA source="landing-hero" size="lg" />
                <Button variant="outline" size="lg" asChild onClick={handleDownload}>
                  <a href="/docs/vybbi-launch-partner-paris.pdf" download="Vybbi-Launch-Partner-Paris.pdf">
                    <Download className="mr-2 h-5 w-5" />
                    Télécharger le one-pager
                  </a>
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mb-12">
                Problème avec le formulaire ? <a 
                  href="https://calendly.com/vybbiapp/30min" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                  data-event="cta_calendly_fallback"
                >
                  Réservez via ce lien direct Calendly
                </a>
              </p>

              {/* Mockup "Presented by" */}
              <Card className="shadow-2xl border-2 border-primary/20 bg-gradient-to-br from-background to-muted/30">
                <CardContent className="p-0">
                  <div className="aspect-video flex items-center justify-center relative overflow-hidden">
                    <div className="text-center p-8">
                      <img src={vybbiLogo} alt="Vybbi" className="h-12 md:h-16 mx-auto mb-6" />
                      <Badge className="bg-white/90 text-gray-900 text-base md:text-lg px-6 py-2 shadow-lg">
                        Presented by <span className="font-bold ml-2">[VOTRE MARQUE]</span>
                      </Badge>
                      <p className="text-sm md:text-base text-muted-foreground mt-6">
                        Votre logo sur tous nos supports pendant 90 jours
                      </p>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-4 right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
                    <div className="absolute bottom-4 left-4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pourquoi Vybbi */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="container mx-auto">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Pourquoi Vybbi ?</h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  Vybbi est le réseau professionnel dédié aux artistes (DJ, chanteurs, danseurs, magiciens), 
                  aux agents/managers et aux lieux. Nous facilitons la découverte, la mise en relation et le booking 
                  avec des outils pros.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { icon: Users, label: 'Matching IA', color: 'text-blue-500' },
                  { icon: Building2, label: 'Profils vérifiés', color: 'text-green-500' },
                  { icon: Radio, label: 'Radio 24/7', color: 'text-purple-500' },
                  { icon: Brain, label: 'Recommandations IA', color: 'text-pink-500' },
                  { icon: Calendar, label: 'Calendriers intégrés', color: 'text-orange-500' },
                  { icon: FileCheck, label: 'Gestion d\'événements', color: 'text-cyan-500' }
                ].map((item, index) => (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <item.icon className={`w-10 h-10 mx-auto mb-3 ${item.color}`} />
                      <p className="font-semibold text-sm">{item.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Timeline "Ce que vous obtenez en 15 jours" */}
        <section className="py-12 px-6 bg-gradient-to-br from-green-500/10 to-background">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <Card className="border-2 border-green-500/30">
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Zap className="w-8 h-8 text-green-500" />
                    <CardTitle className="text-2xl md:text-3xl">Ce que vous obtenez en 15 jours</CardTitle>
                  </div>
                  <CardDescription>Activation ultra-rapide pour maximiser votre impact</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <Badge variant="outline" className="shrink-0 bg-green-500/20 text-green-700 dark:text-green-400">J+7</Badge>
                      <p className="text-sm md:text-base">
                        <span className="font-semibold">Visibilité "Presented by" en place</span> — Votre branding live sur la plateforme, site web, emails et réseaux sociaux.
                      </p>
                    </div>
                    <div className="flex items-start gap-4">
                      <Badge variant="outline" className="shrink-0 bg-green-500/20 text-green-700 dark:text-green-400">J+14</Badge>
                      <p className="text-sm md:text-base">
                        <span className="font-semibold">Activation planifiée, assets validés</span> — Format défini avec vos équipes, planning détaillé, matériel prêt.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                  Pilote 90 jours — 2 packs au choix
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {/* Pack Launch (5k€) */}
                <Card className="border-2 hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-2xl">Pack Launch</CardTitle>
                      <Badge variant="outline">5 000 €</Badge>
                    </div>
                    <CardDescription>Exclusivité géographique Paris (1 sponsor unique)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-success mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Branding "Presented by [Marque]"</p>
                          <p className="text-sm text-muted-foreground">Sur bêta, site, emails, réseaux</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-success mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">1 activation locale</p>
                          <p className="text-sm text-muted-foreground">Sessions / Top 50 / Concours</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-success mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Page sponsor standard</p>
                          <p className="text-sm text-muted-foreground">Présentation + offres + liens UTM</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-success mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Reporting hebdo + case study final</p>
                          <p className="text-sm text-muted-foreground">KPIs détaillés et recommandations</p>
                        </div>
                      </div>
                    </div>
                    <PartnershipCTA source="pricing-5k" variant="outline" />
                  </CardContent>
                </Card>

                {/* Pack Flagship (10k€) */}
                <Card className="border-2 border-primary/50 hover:shadow-xl transition-all relative">
                  <div className="absolute -top-3 right-6">
                    <Badge className="bg-gradient-to-r from-primary to-purple-500 text-white">
                      <Award className="w-3 h-3 mr-1" />
                      Recommandé
                    </Badge>
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-2xl">Pack Flagship</CardTitle>
                      <Badge variant="default">10 000 €</Badge>
                    </div>
                    <CardDescription>Tout le Pack Launch, plus :</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <Zap className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Exclusivité catégorielle</p>
                          <p className="text-sm text-muted-foreground">Audio / boisson / média / etc. (au choix)</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-success mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">2 activations locales</p>
                          <p className="text-sm text-muted-foreground">Formats combinables selon vos objectifs</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-success mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Page sponsor premium</p>
                          <p className="text-sm text-muted-foreground">Design sur-mesure, vidéo, contenus enrichis</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-success mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Branding renforcé</p>
                          <p className="text-sm text-muted-foreground">Mentions dans vidéos & réseaux</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-success mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Co-RP amplifiée</p>
                          <p className="text-sm text-muted-foreground">Communiqué + médias partenaires</p>
                        </div>
                      </div>
                    </div>
                    <PartnershipCTA source="pricing-10k" />
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
                {[
                  {
                    icon: Calendar,
                    week: 'Semaine 1',
                    title: 'Validation',
                    description: 'Validation du co-branding, choix de l\'activation, plan médias',
                    color: 'text-blue-500'
                  },
                  {
                    icon: Rocket,
                    week: 'Semaines 2-4',
                    title: 'Lancement',
                    description: 'Lancement bêta + mise en avant "Presented by [Marque]"',
                    color: 'text-green-500'
                  },
                  {
                    icon: Zap,
                    week: 'Semaines 5-8',
                    title: 'Activation',
                    description: 'Activation locale (Sessions/Top 50/Concours) + amplification',
                    color: 'text-orange-500'
                  },
                  {
                    icon: FileCheck,
                    week: 'Semaines 9-12',
                    title: 'Wrap-up',
                    description: 'Reporting final, recommandations next steps, case study',
                    color: 'text-purple-500'
                  }
                ].map((step, index) => (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <step.icon className={`w-12 h-12 mx-auto mb-4 ${step.color}`} />
                      <Badge variant="outline" className="mb-3">{step.week}</Badge>
                      <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                ))}
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
                  <AccordionTrigger>Combien de temps pour être visible après signature ?</AccordionTrigger>
                  <AccordionContent>
                    Sous 7 jours ouvrés : branding "Presented by" en place; sous 14 jours : activation planifiée avec vos équipes. 
                    Nous garantissons un démarrage ultra-rapide pour maximiser votre impact dès le lancement.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Puis-je avoir l'exclusivité de ma catégorie ?</AccordionTrigger>
                  <AccordionContent>
                    Oui, avec le Pack Flagship (10 000 €), vous bénéficiez d'une exclusivité catégorielle (audio, boisson, média, etc.). 
                    Cela signifie qu'aucun concurrent direct de votre secteur ne pourra sponsoriser Vybbi Paris pendant 90 jours.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Quels KPIs recevrons-nous ?</AccordionTrigger>
                  <AccordionContent>
                    Inscriptions, reach, vues, participations aux activations, clics UTM vers votre page sponsor, 
                    mentions sociales et engagement. Vous recevrez un reporting hebdomadaire détaillé et un case study final 
                    avec recommandations stratégiques pour la suite.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>Conditions pour marques alcool ?</AccordionTrigger>
                  <AccordionContent>
                    Ciblage strict 18+, mentions sanitaires obligatoires, contenus et inventaires conformes à la loi Evin. 
                    Nous nous assurons que toute publicité pour l'alcool respecte la réglementation française en vigueur.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>Quelle est la durée du partenariat ?</AccordionTrigger>
                  <AccordionContent>
                    Le partenariat Launch Partner dure 90 jours à partir du lancement de la bêta Vybbi à Paris, 
                    prévu le 8 avril 2025. Cette période couvre le lancement, les activations locales et le reporting final.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>Peut-on personnaliser l'activation locale ?</AccordionTrigger>
                  <AccordionContent>
                    Absolument ! Vous choisissez entre 3 formats : <strong>Vybbi Sessions Paris</strong> (3 masterclass courtes), 
                    <strong>Top 50 Paris sponsorisé</strong> (classement des artistes les plus actifs), ou 
                    <strong>concours "Road to [Lieu]"</strong> (gagnant booké dans un lieu partenaire). 
                    Nous pouvons adapter le format selon vos objectifs et votre audience cible.
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
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
                <PartnershipCTA source="landing-footer" size="lg" />
                <Button variant="outline" size="lg" asChild onClick={handleDownload}>
                  <a href="/docs/vybbi-launch-partner-paris.pdf" download="Vybbi-Launch-Partner-Paris.pdf">
                    <Download className="mr-2 h-5 w-5" />
                    Télécharger le one-pager
                  </a>
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Problème avec le formulaire ? <a 
                  href="https://calendly.com/vybbiapp/30min" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                  data-event="cta_calendly_fallback"
                >
                  Réservez via ce lien direct Calendly
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Section Calendly */}
        <section className="py-16 px-6 bg-card border-t">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-center">
                Réservez votre échange Sponsoring avec Vybbi
              </h2>
              <p className="text-lg text-muted-foreground mb-8 text-center max-w-2xl mx-auto">
                Choisissez le créneau qui vous convient. Nous préparerons des idées adaptées à votre audience et vos objectifs.
              </p>

              <div 
                className="calendly-inline-widget calendly-dark-theme rounded-xl overflow-hidden shadow-lg"
                data-url="https://calendly.com/vybbiapp/30min?hide_gdpr_banner=1&utm_source=site&utm_medium=widget&utm_campaign=sponsor"
                style={{ minWidth: '320px', height: '700px' }}
              />
            </div>
          </div>
        </section>

        <style>{`
          /* Force dark theme on Calendly widget */
          .calendly-dark-theme {
            background-color: #14171F !important;
          }
          
          .calendly-dark-theme iframe {
            filter: invert(0.9) hue-rotate(180deg) brightness(0.95);
          }
        `}</style>

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
    </>
  );
}
