import { useState } from 'react';
import React from 'react';
import { Play, CheckCircle, ArrowRight, Calendar, Users, FileCheck, MessageCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { useTrialConfig } from "@/hooks/useTrialConfig";

export default function Demo() {
  const [activeDemo, setActiveDemo] = useState(0);
  const { trialDays, isPromotionalActive, isLoading } = useTrialConfig();

  const demoScenarios = [
    {
      title: "Recherche d'Artiste par IA",
      description: "Trouvez l'artiste parfait grâce à notre matching intelligent",
      icon: Users,
      steps: [
        "Définissez vos critères (genre, budget, localisation)",
        "L'IA analyse les profils et performances passées",
        "Recevez des recommandations personnalisées",
        "Contactez directement les artistes sélectionnés"
      ]
    },
    {
      title: "Gestion d'Événement",
      description: "Organisez votre événement de A à Z sur une seule plateforme",
      icon: Calendar,
      steps: [
        "Créez votre événement avec tous les détails",
        "Publiez des annonces pour recruter des artistes",
        "Gérez les candidatures et négociations",
        "Synchronisez les planning et contrats"
      ]
    },
    {
      title: "Collaboration & Communication",
      description: "Centralisez tous vos échanges professionnels",
      icon: MessageCircle,
      steps: [
        "Messagerie intégrée avec historique complet",
        "Partage de documents (contrats, riders, tech sheets)",
        "Notifications en temps réel",
        "Gestion des exclusivités et représentations"
      ]
    },
    {
      title: "Analytics & Performance",
      description: "Suivez vos performances et optimisez vos bookings",
      icon: FileCheck,
      steps: [
        "Dashboard avec métriques personnalisées",
        "Suivi des revenus et commissions",
        "Analyse des tendances du marché",
        "Rapports détaillés pour optimiser votre stratégie"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-16 px-2 sm:px-6 border-b border-border">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 text-sm px-4 py-2">
            <Play className="w-4 h-4 mr-2" />
            DÉMONSTRATION INTERACTIVE
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Découvrez Vybbi
            </span>
            <br />
            <span className="text-foreground">en action</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            Explorez nos fonctionnalités principales à travers des scénarios concrets. 
            Voyez comment Vybbi révolutionne la façon dont les professionnels de la musique 
            collaborent et développent leurs activités.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link to="/auth">
                Essai gratuit {trialDays || 14} jours
                {isPromotionalActive && ' 🎉'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              <Calendar className="mr-2 h-5 w-5" />
              Planifier une démo personnalisée
            </Button>
          </div>
        </div>
      </section>

      {/* Demo Scenarios */}
      <section className="py-16 px-2 sm:px-6">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Scenario Selector */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold mb-8 text-foreground">Scénarios d'utilisation</h2>
              {demoScenarios.map((scenario, index) => (
                <Card 
                  key={index} 
                  className={`cursor-pointer transition-all duration-300 bg-gradient-card border-border ${
                    activeDemo === index ? 'ring-2 ring-primary shadow-glow scale-105' : 'hover:shadow-glow'
                  }`} 
                  onClick={() => setActiveDemo(index)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow">
                        <scenario.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2 text-foreground">{scenario.title}</h3>
                        <p className="text-muted-foreground">{scenario.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Demo Details */}
            <div className="space-y-6">
              <Card className="bg-gradient-card border-border shadow-glow">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                      {React.createElement(demoScenarios[activeDemo].icon, {
                        className: "w-8 h-8 text-primary-foreground"
                      })}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{demoScenarios[activeDemo].title}</h3>
                      <p className="text-muted-foreground">{demoScenarios[activeDemo].description}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground mb-4">Étapes du processus :</h4>
                    {demoScenarios[activeDemo].steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary-foreground">{stepIndex + 1}</span>
                        </div>
                        <p className="text-muted-foreground">{step}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span className="font-semibold text-foreground">Inclus dans l'essai gratuit</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Testez cette fonctionnalité pendant {trialDays || 14} jours sans engagement. 
                      Accès complet à tous les outils et support prioritaire.
                      {isPromotionalActive && (
                        <span className="block mt-1 text-green-600 font-medium">
                          🎉 Offre limitée : {trialDays || 14} jours d'essai pour les premiers inscrits !
                        </span>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 px-2 sm:px-6 bg-muted/30">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-foreground">
            Pourquoi les professionnels choisissent Vybbi ?
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-success flex items-center justify-center mx-auto mb-6 shadow-glow">
                  <CheckCircle className="w-8 h-8 text-success-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground">Gain de temps immédiat</h3>
                <p className="text-muted-foreground">
                  Réduisez de 70% le temps consacré à la recherche d'artistes et à l'organisation d'événements.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
                  <Users className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground">Réseau qualifié</h3>
                <p className="text-muted-foreground">
                  Accédez à un écosystème de +10k professionnels vérifiés et évalués par leurs pairs.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
                  <FileCheck className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground">Tout-en-un</h3>
                <p className="text-muted-foreground">
                  Remplacez 5+ outils par une seule plateforme : recherche, communication, contrats, paiements.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link to="/auth">
                Commencer l'essai gratuit
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Télécharger le guide complet
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}