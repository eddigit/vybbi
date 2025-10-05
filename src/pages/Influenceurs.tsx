import { Calculator, Euro, TrendingUp, Users, Calendar, CheckCircle, ArrowRight, Sparkles, Target } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { SEOHead } from '@/components/SEOHead';

export default function Influenceurs() {
  const [referrals, setReferrals] = useState(10);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);

  const calculateEarnings = (referralCount: number) => {
    const oneTimeCommission = referralCount * 2; // 2€ par inscription
    const monthlyRecurring = referralCount * 0.5; // 0,50€ par mois par abonné parrainé
    const yearlyRecurring = monthlyRecurring * 12;
    return {
      oneTime: oneTimeCommission,
      monthly: monthlyRecurring,
      yearly: yearlyRecurring,
      total: oneTimeCommission + yearlyRecurring
    };
  };

  const earnings = calculateEarnings(referrals);

  const advantages = [
    {
      title: "Commission One-Shot",
      description: "2€ par inscription réussie",
      icon: Euro,
      highlight: "2€"
    },
    {
      title: "Revenus Récurrents*",
      description: "0,50€/mois par abonné parrainé jusqu'au 31 janvier 2026*",
      icon: TrendingUp,
      highlight: "0,50€/mois*"
    },
    {
      title: "Exclusivité Limitée",
      description: "Jusqu'au 31 janvier 2026",
      icon: Calendar,
      highlight: "Exclusif"
    },
    {
      title: "Potentiel Élevé",
      description: "Jusqu'à 7000€/an pour les top performers",
      icon: Target,
      highlight: "7000€/an"
    }
  ];

  const steps = [
    {
      step: "1",
      title: "Inscription Gratuite",
      description: "Créez votre compte influenceur avec vos informations SIRET (obligatoire pour les commissions)"
    },
    {
      step: "2", 
      title: "Obtenez Votre Lien",
      description: "Recevez un lien de parrainage unique à partager sur vos réseaux sociaux"
    },
    {
      step: "3",
      title: "Partagez et Gagnez",
      description: "Chaque inscription via votre lien vous rapporte immédiatement 2€ + 0,50€/mois récurrents*"
    }
  ];

  const testimonials = [
    {
      name: "Marie D.",
      role: "Influenceuse Mode • 45K followers",
      quote: "Avec 50 inscriptions par mois via mes liens Vybbi, je génère 325€ mensuels récurrents. C'est un complément de revenus fantastique !",
      monthly_referrals: 50,
      monthly_revenue: 325
    },
    {
      name: "Alex K.", 
      role: "DJ/Producteur • 120K followers",
      quote: "Le programme d'affiliation Vybbi m'a permis de monétiser ma passion. 150 parrainages = 1175€ par mois récurrents !",
      monthly_referrals: 150,
      monthly_revenue: 1175
    },
    {
      name: "Sophie M.",
      role: "Content Creator • 80K followers", 
      quote: "Excellente initiative ! Mes 80 parrainages mensuels me rapportent 640€. Et c'est récurrent chaque mois !",
      monthly_referrals: 80,
      monthly_revenue: 640
    }
  ];

  const proofPoints = [
    "✅ Paiements mensuels garantis",
    "✅ Système de tracking transparent", 
    "✅ Dashboard de suivi en temps réel",
    "✅ Support dédié aux influenceurs",
    "✅ Contrat d'affiliation officiel",
    "✅ Pas de minimum de paiement",
    "✅ Conformité légale française (SIRET)",
    "✅ Exclusivité jusqu'au 31/01/2026"
  ];

  const faqs = [
    {
      question: "Pourquoi le SIRET est-il obligatoire ?",
      answer: "Conformément à la législation française, tout partenariat commercial nécessite un statut légal. Le SIRET garantit la transparence fiscale et la légalité des commissions versées."
    },
    {
      question: "Comment sont calculées les commissions récurrentes ?",
      answer: "0,50€ par mois pour chaque abonné parrainé. Si vous parrainez 100 personnes qui restent abonnées, vous recevez 50€ chaque mois de façon récurrente jusqu'au 31 janvier 2026."
    },
    {
      question: "Que se passe-t-il après le 31 janvier 2026 ?",
      answer: "Après le 31 janvier 2026, le programme devient uniquement une commission par nouveau abonné (plus de revenus récurrents). Les influenceurs déjà inscrits conservent leurs conditions avantageuses actuelles. Rejoignez avant le 31 octobre 2025 pour bénéficier de l'exclusivité !"
    },
    {
      question: "Y a-t-il un minimum de paiement ?",
      answer: "Non, aucun minimum ! Dès le premier euro de commission, vous êtes payé mensuellement sur votre compte bancaire."
    }
  ];

  return (
    <>
      <SEOHead 
        title="Programme Influenceur Vybbi - Gagnez jusqu'à 7000€/an"
        description="Rejoignez le programme d'affiliation exclusif Vybbi : 2€ par inscription + 0,50€/mois récurrents. Exclusivité jusqu'au 31 janvier 2026."
      />
      
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-16 px-2 sm:px-6 border-b border-border">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-6 text-sm px-4 py-2 bg-gradient-primary">
                <Sparkles className="w-4 h-4 mr-2" />
                PROGRAMME EXCLUSIF JUSQU'AU 31/01/2026
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Gagnez jusqu'à 7000€/an
                </span>
                <br />
                <span className="text-foreground">avec Vybbi</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
                Rejoignez notre programme d'affiliation exclusif et générez des revenus récurrents 
                en recommandant la plateforme de référence des professionnels de la musique.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <Link to="/get-started?type=influenceur">
                    Devenir Influenceur Vybbi
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Télécharger le Kit Média
                </Button>
              </div>

              {/* Key Numbers */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                <div className="text-center p-4 bg-gradient-card border border-border rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-1">2€</div>
                  <div className="text-sm text-muted-foreground">Par inscription</div>
                </div>
                 <div className="text-center p-4 bg-gradient-card border border-border rounded-lg">
                   <div className="text-3xl font-bold text-primary mb-1">0,50€*</div>
                   <div className="text-sm text-muted-foreground">Par mois et par abonné parrainé*</div>
                 </div>
                <div className="text-center p-4 bg-gradient-card border border-border rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-1">7000€</div>
                  <div className="text-sm text-muted-foreground">Potentiel annuel maximum</div>
                </div>
                <div className="text-center p-4 bg-gradient-card border border-border rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-1">31/01</div>
                  <div className="text-sm text-muted-foreground">Fin de l'exclusivité 2026</div>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 max-w-2xl mx-auto">
                  <span className="font-medium">* Offre limitée :</span> Les revenus récurrents de 0,50€/mois sont garantis jusqu'au 31 janvier 2026 
                  pour les influenceurs inscrits avant le 31 octobre 2025. Après cette date, seule la commission par nouveau abonné s'applique.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Advantages */}
        <section className="py-16 px-2 sm:px-6">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-foreground">Pourquoi choisir notre programme ?</h2>
              <p className="text-xl text-muted-foreground">Des avantages uniques pour maximiser vos revenus</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {advantages.map((advantage, index) => (
                <Card key={index} className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-border">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow group-hover:scale-110 transition-transform">
                      <advantage.icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div className="text-2xl font-bold text-primary mb-2">{advantage.highlight}</div>
                    <h3 className="text-lg font-bold mb-2 text-foreground">{advantage.title}</h3>
                    <p className="text-muted-foreground text-sm">{advantage.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Calculator */}
        <section className="py-16 px-2 sm:px-6 bg-muted/30">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <Card className="bg-gradient-card border-border shadow-glow">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl font-bold text-foreground">
                    <Calculator className="w-8 h-8 inline-block mr-2" />
                    Calculateur de Revenus
                  </CardTitle>
                  <p className="text-muted-foreground">Découvrez votre potentiel de gains avec Vybbi</p>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="referrals" className="text-lg font-medium">
                          Nombre de parrainages estimés par mois
                        </Label>
                        <Input
                          id="referrals"
                          type="number"
                          value={referrals}
                          onChange={(e) => setReferrals(parseInt(e.target.value) || 0)}
                          className="text-xl p-4 mt-2"
                          min="0"
                          max="1000"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>✅ Commission immédiate: {earnings.oneTime}€</div>
                        <div>✅ Revenus mensuels récurrents*: {earnings.monthly}€</div>
                        <div>✅ Revenus annuels récurrents*: {earnings.yearly}€</div>
                        <div>✅ Total première année: {earnings.total}€</div>
                      </div>
                    </div>

                    <div className="bg-gradient-primary rounded-2xl p-8 text-center text-primary-foreground shadow-glow">
                      <div className="text-sm uppercase tracking-wide opacity-90 mb-2">Vos revenus estimés</div>
                      <div className="text-4xl font-bold mb-4">{earnings.total.toLocaleString()}€</div>
                      <div className="text-sm opacity-90 mb-4">Première année complète</div>
                       <div className="space-y-2 text-sm">
                         <div>+ {earnings.monthly}€/mois récurrents*</div>
                         <div className="text-xs opacity-75">*Basé sur {referrals} parrainages/mois</div>
                         <div className="text-xs opacity-75">*Jusqu'au 31/01/2026 pour les premiers inscrits</div>
                       </div>
                    </div>
                  </div>
                 </CardContent>
               </Card>
               
               <div className="mt-6 text-center">
                 <p className="text-sm text-muted-foreground bg-card border border-border rounded-lg p-4 max-w-3xl mx-auto">
                   <span className="font-medium text-primary">⚡ Offre limitée :</span> Les revenus récurrents de 0,50€/mois par abonné parrainé sont garantis 
                   jusqu'au 31 janvier 2026 pour les influenceurs qui s'inscrivent avant le 31 octobre 2025. 
                   Après cette date, le programme devient uniquement une commission par nouveau abonné.
                 </p>
               </div>
             </div>
           </div>
         </section>

        {/* How It Works */}
        <section className="py-16 px-2 sm:px-6">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-foreground">Comment ça marche ?</h2>
              <p className="text-xl text-muted-foreground">3 étapes simples pour commencer à gagner</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {steps.map((step, index) => (
                <Card key={index} className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border text-center">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow group-hover:scale-110 transition-transform">
                      <span className="text-2xl font-bold text-primary-foreground">{step.step}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-foreground">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 px-2 sm:px-6 bg-muted/30">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-foreground">Ils génèrent déjà des revenus avec Vybbi</h2>
              <p className="text-xl text-muted-foreground">Des influenceurs qui ont rejoint notre programme exclusif</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-gradient-card border-border shadow-glow">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mr-4 shadow-glow">
                        <span className="text-primary-foreground font-bold">{testimonial.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                    <div className="text-center">
                      <Badge className="bg-gradient-primary text-primary-foreground">
                        {testimonial.monthly_revenue}€/mois
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-2 sm:px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-foreground">Questions Fréquentes</h2>
              <p className="text-xl text-muted-foreground">Tout ce que vous devez savoir sur le programme</p>
            </div>

            <div className="space-y-4 mb-12">
              {faqs.map((item, index) => (
                <Card key={index} className="bg-gradient-card border-border">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-3 text-foreground">{item.question}</h3>
                    <p className="text-muted-foreground">{item.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

      {/* Testimonials */}
      <section className="py-16 px-2 sm:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Ils génèrent déjà des revenus avec Vybbi</h2>
            <p className="text-xl text-muted-foreground">Témoignages réels d'early adopters du programme</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div className="bg-primary/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-primary">{testimonial.monthly_revenue}€</div>
                    <div className="text-xs text-muted-foreground">Revenus mensuels récurrents</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {testimonial.monthly_referrals} parrainages/mois
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-2 sm:px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-foreground">Questions Fréquentes</h2>
              <p className="text-xl text-muted-foreground">Tout ce que vous devez savoir sur le programme</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {faqs.map((faq, index) => (
                <Card key={index} className="bg-gradient-card border-border">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-foreground mb-3">{faq.question}</h3>
                    <p className="text-muted-foreground text-sm">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Proof Points */}
      <section className="py-16 px-2 sm:px-6">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-foreground">Pourquoi nous faire confiance ?</h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {proofPoints.map((point, index) => (
                <div key={index} className="flex items-center text-left bg-gradient-card border border-border rounded-lg p-4">
                  <CheckCircle className="w-6 h-6 text-success mr-4 flex-shrink-0" />
                  <span className="text-foreground">{point.replace('✅ ', '')}</span>
                </div>
              ))}
            </div>

              <Card className="bg-gradient-card border-border shadow-glow">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold mb-4 text-foreground">
                    🚨 Exclusivité Limitée dans le Temps 🚨
                  </h3>
                  <p className="text-lg text-muted-foreground mb-6">
                    Les commissions récurrentes de 0,50€/mois sont <strong>EXCLUSIVES</strong> aux influenceurs 
                    qui s'inscrivent avant le <strong>31 janvier 2026</strong>. Après cette date, 
                    le programme sera moins avantageux.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" className="text-lg px-8 py-6" asChild>
                      <Link to="/auth?ref=influencer">
                        Sécuriser ma place maintenant
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                      Poser une question
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Legal Notice */}
        <section className="py-8 px-2 sm:px-6 border-t border-border">
          <div className="container mx-auto text-center">
            <p className="text-sm text-muted-foreground">
              * Un numéro SIRET valide est obligatoire pour recevoir les commissions, conformément à la législation française. 
              Les revenus sont soumis aux cotisations sociales et à l'impôt selon votre statut. Vybbi se réserve le droit de 
              modifier les conditions du programme à tout moment pour les nouveaux inscrits.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}