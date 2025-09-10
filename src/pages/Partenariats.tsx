import { CheckCircle, Users, Building2, Radio, GraduationCap, Headphones, ArrowRight, Star, Globe, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';

export default function Partenariats() {
  const partnerTypes = [
    {
      title: "Écoles de Musique & Académies",
      description: "Préparez vos étudiants au monde professionnel",
      icon: GraduationCap,
      benefits: [
        "Plateforme d'apprentissage pour étudiants",
        "Accès aux offres de stages et emplois junior",
        "Formation aux outils professionnels",
        "Réseau d'anciens élèves connecté"
      ],
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Labels & Maisons de Disques",
      description: "Développez vos artistes avec nos outils de booking",
      icon: Building2,
      benefits: [
        "Visibilité accrue pour votre catalogue",
        "Outils de promotion événementielle",
        "Analytics des performances live",
        "Commissions préférentielles"
      ],
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Radios & Médias",
      description: "Enrichissez vos contenus avec notre écosystème",
      icon: Radio,
      benefits: [
        "Accès prioritaire aux nouveaux talents",
        "Contenu exclusif et interviews",
        "Collaboration sur événements",
        "Partage d'audience qualifiée"
      ],
      gradient: "from-green-500 to-emerald-500"
    },
    {
      title: "Plateformes Tech & Audio",
      description: "Intégrez vos services à notre marketplace",
      icon: Headphones,
      benefits: [
        "API d'intégration complète",
        "Co-développement de fonctionnalités",
        "Partage de technologies",
        "Accès aux données anonymisées"
      ],
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const partnershipBenefits = [
    {
      title: "Accès Privilégié",
      description: "Conditions préférentielles et accès anticipé aux nouvelles fonctionnalités",
      icon: Star
    },
    {
      title: "Visibilité Renforcée",
      description: "Mise en avant dans notre écosystème et co-marketing",
      icon: Globe
    },
    {
      title: "Support Dédié",
      description: "Équipe dédiée et support prioritaire pour vos projets",
      icon: Users
    }
  ];

  const successStories = [
    {
      name: "Académie Berklee Paris",
      type: "École de Musique",
      result: "+200 étudiants connectés",
      quote: "Vybbi a transformé la façon dont nos étudiants entrent dans le monde professionnel."
    },
    {
      name: "Wagram Music",
      type: "Label",
      result: "+50% bookings artistes",
      quote: "La plateforme nous a ouvert de nouveaux marchés pour nos artistes émergents."
    },
    {
      name: "Radio FG",
      type: "Média",
      result: "Partenariat événementiel",
      quote: "Une collaboration naturelle qui enrichit notre programmation et nos événements."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-16 px-2 sm:px-6 border-b border-border">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 text-sm px-4 py-2">
            <Users className="w-4 h-4 mr-2" />
            ÉCOSYSTÈME PARTENAIRES
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Construisons ensemble
            </span>
            <br />
            <span className="text-foreground">l'avenir de la musique</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            Rejoignez notre réseau de partenaires stratégiques et participez à la révolution 
            de l'industrie musicale. Ensemble, créons un écosystème plus connecté et plus efficace 
            pour tous les acteurs de la scène.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8 py-6">
              <Users className="mr-2 h-5 w-5" />
              Devenir partenaire
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Télécharger le dossier partenariat
            </Button>
          </div>
        </div>
      </section>

      {/* Partner Types */}
      <section className="py-16 px-2 sm:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Types de partenariats</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez comment votre organisation peut s'intégrer dans l'écosystème Vybbi
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {partnerTypes.map((partner, index) => (
              <Card key={index} className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow group-hover:scale-110 transition-transform">
                      <partner.icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-foreground">{partner.title}</h3>
                      <p className="text-muted-foreground">{partner.description}</p>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {partner.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-success mr-3 flex-shrink-0" />
                        <span className="text-card-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full group-hover:scale-105 transition-transform">
                    En savoir plus
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Benefits */}
      <section className="py-16 px-2 sm:px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Avantages partenaires</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Des conditions exclusives pour développer ensemble de nouveaux marchés
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {partnershipBenefits.map((benefit, index) => (
              <Card key={index} className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300 text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
                    <benefit.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-foreground">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-gradient-card border-border rounded-2xl p-8 shadow-glow">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                  <Badge className="text-sm">NOUVEAU</Badge>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  Programme Partenaire Premium
                </h3>
                <p className="text-muted-foreground mb-6">
                  Rejoignez notre cercle restreint de partenaires stratégiques. Revenue sharing, 
                  co-développement produit, et accès exclusif à nos roadmaps de développement.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-success mr-3" />
                    <span className="text-card-foreground">Commission de 15% sur les références</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-success mr-3" />
                    <span className="text-card-foreground">API prioritaire et support technique dédié</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-success mr-3" />
                    <span className="text-card-foreground">Co-branding sur fonctionnalités développées ensemble</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-4">
                <Button size="lg" className="text-lg px-8 py-4">
                  Candidater au programme
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                  Planifier un RDV
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 px-2 sm:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Nos partenaires témoignent</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez comment nos partenaires développent leur activité avec Vybbi
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {successStories.map((story, index) => (
              <Card key={index} className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="font-bold text-foreground">{story.name}</h3>
                    <p className="text-sm text-muted-foreground">{story.type}</p>
                  </div>
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-primary mb-2">{story.result}</div>
                  </div>
                  <blockquote className="text-muted-foreground italic">
                    "{story.quote}"
                  </blockquote>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6">
                <Users className="mr-2 h-5 w-5" />
                Rejoindre l'écosystème
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                <Link to="/auth">
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}