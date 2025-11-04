import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { StandardCard } from "@/components/ui/standard-card";
import { 
  Check, 
  Sparkles, 
  Users, 
  Building2, 
  Heart, 
  Megaphone, 
  ArrowRight, 
  Zap,
  TrendingUp,
  Shield,
  Radio,
  Star,
  Globe,
  MessageSquare,
  Calendar,
  BarChart3,
  FileText,
  Crown,
  Infinity
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { useNavigate } from "react-router-dom";
import { useTrialConfig } from "@/hooks/useTrialConfig";
import { ComparisonTable } from "@/components/pricing/ComparisonTable";
import { ROICalculator } from "@/components/pricing/ROICalculator";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";
import { PricingTestimonials } from "@/components/pricing/PricingTestimonials";

export default function TarificationSpecifique() {
  const navigate = useNavigate();
  const { trialDays } = useTrialConfig();

  return (
    <>
      <SEOHead
        title="Tarification par Profil - Vybbi"
        description="Découvrez nos plans tarifaires adaptés à chaque profil : Artistes, Agents & Managers, Lieux & Événements. Du Freemium au Elite, trouvez l'offre qui propulse votre carrière musicale."
        keywords="tarifs vybbi, abonnement artiste, plan agent musical, prix booking, freemium musique, smart contracts, blockchain musique"
      />

      <PageContainer width="default">
        <SectionContainer spacing="section">
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            <Zap className="h-3 w-3 mr-1" />
            Programme Exclusif jusqu'au 31/01/2026
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Tarification par Profil
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Des plans conçus spécifiquement pour <span className="text-primary font-semibold">votre métier</span> dans l'industrie musicale.
            Du Freemium au Elite, trouvez l'offre qui propulse votre activité.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              <span>Essai gratuit {trialDays} jours</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              <span>Sans engagement</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              <span>Changement de plan flexible</span>
            </div>
          </div>
        </section>

        {/* Main Pricing Tabs */}
        <Tabs defaultValue="artist" className="w-full space-y-12">
          <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-3 h-auto p-2">
            <TabsTrigger value="artist" className="flex flex-col items-center gap-2 py-3">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium">Artistes</span>
            </TabsTrigger>
            <TabsTrigger value="agent" className="flex flex-col items-center gap-2 py-3">
              <Users className="h-5 w-5" />
              <span className="text-sm font-medium">Agents & Managers</span>
            </TabsTrigger>
            <TabsTrigger value="venue" className="flex flex-col items-center gap-2 py-3">
              <Building2 className="h-5 w-5" />
              <span className="text-sm font-medium">Lieux & Événements</span>
            </TabsTrigger>
          </TabsList>

          {/* ARTISTES */}
          <TabsContent value="artist" className="space-y-12">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-center">Comparaison détaillée des fonctionnalités</h2>
              <ComparisonTable profileType="artist" />
            </div>

            <ROICalculator profileType="artist" />

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-center">Ce que disent nos artistes</h2>
              <PricingTestimonials profileType="artist" />
            </div>
          </TabsContent>

          {/* AGENTS & MANAGERS */}
          <TabsContent value="agent" className="space-y-12">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-center">Comparaison détaillée des fonctionnalités</h2>
              <ComparisonTable profileType="agent" />
            </div>

            <ROICalculator profileType="agent" />

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-center">Ce que disent nos agents</h2>
              <PricingTestimonials profileType="agent" />
            </div>
          </TabsContent>

          {/* VENUES & EVENTS */}
          <TabsContent value="venue" className="space-y-12">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-center">Comparaison détaillée des fonctionnalités</h2>
              <ComparisonTable profileType="venue" />
            </div>

            <ROICalculator profileType="venue" />

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-center">Ce que disent nos lieux</h2>
              <PricingTestimonials profileType="venue" />
            </div>
          </TabsContent>
        </Tabs>

        {/* Fans & Influencers Section */}
        <section className="space-y-8 border-t border-border/50 pt-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Et pour les Fans & Influenceurs ?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Vybbi, c'est aussi une communauté. Découvrez comment participer à l'écosystème.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Fans
                </CardTitle>
                <CardDescription>Toujours gratuit 🎁</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Suivi d'artistes favoris</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Vybbi Tokens & tips</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => navigate("/auth")}>
                  Rejoindre en tant que Fan
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-primary/50 bg-gradient-to-br from-background to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-primary" />
                  Influenceurs
                </CardTitle>
                <CardDescription>Programme d'affiliation gratuit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="font-medium">5% par inscription + 0,50€/mois récurrent</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => navigate("/inscription-influenceur")}>
                  Devenir Influenceur
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        <PricingFAQ />

        {/* Final CTA */}
        <section className="text-center space-y-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-12 border border-primary/20">
          <h2 className="text-3xl md:text-4xl font-bold">Prêt à Propulser Votre Carrière Musicale ?</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" onClick={() => navigate("/auth")} className="gap-2">
              Commencer Gratuitement
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </section>
      </SectionContainer>
    </PageContainer>
    </>
  );
}
