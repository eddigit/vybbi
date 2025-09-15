import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, Users, MapPin, TrendingUp, Zap, Headphones, MessageSquare, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { useState } from "react";

export default function CentreAide() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      title: "Pour les Artistes",
      icon: Users,
      color: "from-purple-500 to-pink-500",
      questions: [
        {
          q: "Comment créer mon profil d'artiste ?",
          a: "Inscrivez-vous sur Vybbi, choisissez 'Artiste' comme type de profil, puis complétez vos informations : nom de scène, genres musicaux, bio, photos, et médias. Votre profil sera votre vitrine professionnelle."
        },
        {
          q: "Comment soumettre ma musique à Radio Vybbi ?",
          a: "Depuis votre dashboard, allez dans 'Ma Musique' > 'Ajouter un titre'. Uploadez votre fichier audio (MP3, WAV), ajoutez les métadonnées et soumettez. Notre équipe vérifie la qualité avant diffusion."
        },
        {
          q: "Comment gérer mon agenda de disponibilités ?",
          a: "Dans votre profil, section 'Disponibilités', marquez vos créneaux libres. Les organisateurs peuvent voir votre planning et vous contacter directement pour des bookings."
        },
        {
          q: "Comment améliorer ma visibilité sur la plateforme ?",
          a: "Complétez entièrement votre profil, uploadez du contenu régulièrement, interagissez avec la communauté, et collectez des avis positifs après vos prestations."
        },
        {
          q: "Que faire si mon profil n'apparaît pas dans les recherches ?",
          a: "Vérifiez que votre profil est public, complet (minimum 80%), et que vos tags/genres sont pertinents. Les profils incomplets ont moins de visibilité."
        }
      ]
    },
    {
      title: "Pour les Lieux & Événements",
      icon: MapPin,
      color: "from-blue-500 to-cyan-500",
      questions: [
        {
          q: "Comment publier un événement ?",
          a: "Dans votre dashboard lieu, cliquez 'Nouvel Événement', remplissez les détails (date, genre recherché, budget), et publiez. Les artistes correspondants recevront une notification."
        },
        {
          q: "Comment rechercher des artistes spécifiques ?",
          a: "Utilisez la recherche avancée avec des filtres : genre, localisation, budget, disponibilité. Vous pouvez aussi parcourir le Top 50 des artistes les plus populaires."
        },
        {
          q: "Comment gérer les demandes de booking ?",
          a: "Les demandes arrivent dans votre messagerie. Vous pouvez accepter, négocier ou refuser. Un système de contrat digital facilite la formalisation."
        },
        {
          q: "Pourquoi créer des partenariats avec d'autres lieux ?",
          a: "Les partenariats augmentent votre visibilité, permettent des échanges d'artistes, et renforcent votre réseau professionnel dans votre région."
        }
      ]
    },
    {
      title: "Pour les Agents & Managers",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
      questions: [
        {
          q: "Comment ajouter des artistes à mon roster ?",
          a: "Envoyez une demande de représentation à l'artiste via son profil. Une fois acceptée, vous pouvez gérer ses bookings, contrats et commissions depuis votre dashboard."
        },
        {
          q: "Comment fonctionne le suivi des commissions ?",
          a: "Chaque booking généré pour vos artistes est tracké automatiquement. Vous définissez votre pourcentage, et le système calcule vos revenus en temps réel."
        },
        {
          q: "Comment organiser une tournée ?",
          a: "Utilisez l'outil 'Tournées' pour planifier les dates, contacter plusieurs lieux simultanément, et coordonner les déplacements de vos artistes."
        },
        {
          q: "Quels outils de prospection sont disponibles ?",
          a: "Accédez aux stats détaillées des lieux (fréquentation, genres programmés), aux contacts décideurs, et aux recommandations IA basées sur vos artistes."
        }
      ]
    },
    {
      title: "Programme Influenceur",
      icon: Zap,
      color: "from-orange-500 to-red-500",
      questions: [
        {
          q: "Comment rejoindre le programme d'affiliation ?",
          a: "Créez un compte Vybbi, allez dans 'Affiliation' > 'Rejoindre le programme'. Vous recevrez vos liens et QR codes personnalisés immédiatement."
        },
        {
          q: "Quand et comment sont payées les commissions ?",
          a: "Les commissions sont calculées automatiquement et payées le 15 de chaque mois par virement bancaire. Minimum de retrait : 50€."
        },
        {
          q: "Comment tracker mes conversions ?",
          a: "Votre dashboard affiche en temps réel : clics, inscriptions, conversions, et revenus générés. Des graphiques détaillés montrent vos performances."
        },
        {
          q: "Quels outils promotionnels sont fournis ?",
          a: "Vous avez accès à des bannières, QR codes, liens personnalisés, templates de posts sociaux, et des visuels exclusifs pour promouvoir Vybbi."
        }
      ]
    }
  ];

  const generalFAQ = [
    {
      q: "Qu'est-ce qui rend Vybbi unique ?",
      a: "Vybbi est le premier écosystème complet pour l'industrie musicale, combinant profils professionnels, radio mondiale, outils de gestion, et intelligence artificielle pour connecter tous les acteurs de la scène musicale."
    },
    {
      q: "Radio Vybbi est-elle vraiment mondiale ?",
      a: "Oui ! Radio Vybbi diffuse 24h/24 et 7j/7 dans le monde entier. Tous les artistes de la plateforme peuvent soumettre leurs titres, et l'audience grandit chaque jour internationalement."
    },
    {
      q: "Comment fonctionne le système de réputation ?",
      a: "Après chaque prestation, lieux et artistes peuvent s'évaluer mutuellement sur la ponctualité, la qualité, et le professionnalisme. Ces notes influencent votre visibilité sur la plateforme."
    },
    {
      q: "Vybbi est-il disponible dans d'autres langues ?",
      a: "Actuellement en français, nous développons des versions anglaise et espagnole pour accompagner notre expansion internationale."
    },
    {
      q: "Comment puis-je supprimer mon compte ?",
      a: "Dans Paramètres > Compte > Supprimer le compte. Cette action est irréversible et supprime toutes vos données conformément au RGPD."
    },
    {
      q: "Qui contacter pour un problème technique ?",
      a: "Utilisez le chat support (bulle en bas à droite) ou envoyez un email à support@vybbi.com. Notre équipe répond en moins de 24h."
    }
  ];

  const filteredContent = searchQuery ? 
    categories.map(cat => ({
      ...cat,
      questions: cat.questions.filter(
        qa => qa.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
              qa.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(cat => cat.questions.length > 0) : categories;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Centre d'aide" 
        description="Trouvez toutes les réponses à vos questions sur Vybbi : guides pour artistes, lieux, agents et influenceurs. Support complet de la plateforme musicale."
        canonicalUrl={`${window.location.origin}/centre-aide`}
      />
      
      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto text-center">
          <Badge className="mb-6" variant="secondary">
            <HelpCircle className="w-4 h-4 mr-2" />
            Support complet
          </Badge>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Centre d'aide Vybbi
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Trouvez rapidement les réponses à toutes vos questions sur l'utilisation de Vybbi,
            que vous soyez artiste, lieu, agent ou influenceur.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans l'aide..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-3 text-lg"
            />
          </div>
        </div>
      </section>

      {/* Quick Access Cards */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Guide Artistes</h3>
                <p className="text-sm text-muted-foreground mb-4">Tout savoir sur la création de profil et Radio Vybbi</p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/pour-artistes">Voir le guide</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Guide Lieux</h3>
                <p className="text-sm text-muted-foreground mb-4">Organisation d'événements et recherche d'artistes</p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/pour-lieux-evenements">Voir le guide</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Guide Agents</h3>
                <p className="text-sm text-muted-foreground mb-4">Gestion d'artistes et outils professionnels</p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/pour-agents-managers">Voir le guide</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Contact Support</h3>
                <p className="text-sm text-muted-foreground mb-4">Une question spécifique ? Contactez-nous</p>
                <Button variant="outline" size="sm" asChild>
                  <a href="mailto:support@vybbi.com">Nous écrire</a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* FAQ by Category */}
          <div className="space-y-12">
            {filteredContent.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <div key={index} className="space-y-6">
                  <div className="flex items-center gap-4 mb-8">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold">{category.title}</h2>
                  </div>

                  <Accordion type="single" collapsible className="space-y-4">
                    {category.questions.map((qa, qaIndex) => (
                      <AccordionItem key={qaIndex} value={`${index}-${qaIndex}`} className="border rounded-lg px-6">
                        <AccordionTrigger className="text-left font-medium hover:no-underline">
                          {qa.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pt-4 pb-6">
                          {qa.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              );
            })}
          </div>

          {/* General FAQ */}
          <div className="mt-16 space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-gray-500 to-slate-500 flex items-center justify-center">
                <HelpCircle className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold">Questions générales</h2>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {generalFAQ.map((qa, index) => (
                <AccordionItem key={index} value={`general-${index}`} className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-medium hover:no-underline">
                    {qa.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pt-4 pb-6">
                    {qa.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Vous ne trouvez pas votre réponse ?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Notre équipe support est là pour vous aider. Contactez-nous et nous vous répondrons rapidement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="mailto:support@vybbi.com">Contacter le support</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth">Commencer avec Vybbi</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}