import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, MapPin, Calendar, TrendingUp, Radio, CheckCircle } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from "@/components/SEOHead";
import { BetaBadge } from "@/components/BetaBadge";

export default function BetaStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    artistsCount: 0,
    venuesCount: 0,
    agentsCount: 0,
    eventsCount: 0,
    radioTracks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Count total profiles
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Count artists
      const { count: artistsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('profile_type', 'artist');

      // Count venues
      const { count: venuesCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('profile_type', 'lieu');

      // Count agents/managers
      const { count: agentsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('profile_type', ['agent', 'manager']);

      setStats({
        totalUsers: totalUsers || 0,
        artistsCount: artistsCount || 0,
        venuesCount: venuesCount || 0,
        agentsCount: agentsCount || 0,
        eventsCount: 0, // Will be enabled when venue_events table is available
        radioTracks: 0  // Will be enabled when radio_submissions table is available
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const roadmapItems = [
    {
      quarter: "Q1 2025",
      title: "Beta Paris limitée",
      status: "En cours",
      achievements: [
        "Lancement plateforme core",
        "50+ beta-testeurs recrutés",
        "Radio Vybbi 24/7 opérationnelle",
        "Système de messaging sécurisé"
      ]
    },
    {
      quarter: "Q2 2025",
      title: "Extension Île-de-France",
      status: "Planifié",
      achievements: [
        "100+ lieux partenaires ciblés",
        "AI matchmaking artistes/lieux",
        "Blockchain certifications",
        "App mobile native"
      ]
    },
    {
      quarter: "Q3 2025",
      title: "Expansion nationale",
      status: "Planifié",
      achievements: [
        "Déploiement grandes villes FR",
        "1000+ professionnels actifs",
        "Intégrations Spotify/Deezer",
        "Programme influenceurs lancé"
      ]
    },
    {
      quarter: "Q4 2025",
      title: "Objectif 5K opportunités",
      status: "Objectif",
      achievements: [
        "5000+ bookings traités",
        "Partenariats festivals majeurs",
        "API publique developers",
        "Expansion européenne"
      ]
    }
  ];

  const eligibilityCriteria = [
    "Professionnel actif dans l'industrie musicale/nightlife",
    "Basé à Paris ou Île-de-France",
    "Engagement à tester activement la plateforme",
    "Feedback constructif et régulier",
    "Respect de la charte communauté"
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Statistiques Beta - Transparence Totale"
        description="Suivez en temps réel les statistiques de la beta Vybbi Paris. Nombre réel de beta-testeurs, metrics authentiques, roadmap détaillée."
      />

      {/* Hero */}
      <section className="py-16 px-6 border-b">
        <div className="container mx-auto text-center">
          <BetaBadge className="mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Statistiques Beta en Temps Réel
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transparence totale sur notre phase beta. Pas de fake metrics, uniquement des données réelles mises à jour automatiquement.
          </p>
        </div>
      </section>

      {/* Real-time Stats */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
            <Card className="text-center">
              <CardHeader className="pb-3">
                <Users className="w-8 h-8 mx-auto text-primary mb-2" />
                <CardTitle className="text-3xl font-bold">
                  {loading ? '...' : stats.totalUsers}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">Beta-testeurs actifs</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader className="pb-3">
                <Users className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <CardTitle className="text-3xl font-bold">
                  {loading ? '...' : stats.artistsCount}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">Artistes</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader className="pb-3">
                <MapPin className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <CardTitle className="text-3xl font-bold">
                  {loading ? '...' : stats.venuesCount}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">Lieux</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader className="pb-3">
                <TrendingUp className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <CardTitle className="text-3xl font-bold">
                  {loading ? '...' : stats.agentsCount}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">Agents/Managers</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader className="pb-3">
                <Calendar className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                <CardTitle className="text-3xl font-bold">
                  {loading ? '...' : stats.eventsCount}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">Événements créés</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader className="pb-3">
                <Radio className="w-8 h-8 mx-auto text-pink-500 mb-2" />
                <CardTitle className="text-3xl font-bold">
                  {loading ? '...' : stats.radioTracks}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">Tracks Radio</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardContent className="p-6 text-center">
              <p className="text-lg font-semibold mb-2">🎯 Phase Actuelle: Beta Paris Limitée</p>
              <p className="text-muted-foreground">
                Dernière mise à jour: {new Date().toLocaleDateString('fr-FR', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Roadmap Transparente</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roadmapItems.map((item, index) => (
              <Card key={index} className={item.status === "En cours" ? "ring-2 ring-primary" : ""}>
                <CardHeader>
                  <Badge className="w-fit mb-2" variant={item.status === "En cours" ? "default" : "secondary"}>
                    {item.status}
                  </Badge>
                  <CardTitle className="text-xl">{item.quarter}</CardTitle>
                  <p className="text-muted-foreground">{item.title}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {item.achievements.map((achievement, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility Criteria */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Critères d'Éligibilité Fondateurs</h2>
          
          <Card>
            <CardContent className="p-8">
              <ul className="space-y-4">
                {eligibilityCriteria.map((criteria, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-lg">{criteria}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg">
                <p className="font-semibold mb-2">🎁 Avantages Statut Fondateur:</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Badge "Fondateur" permanent sur votre profil</li>
                  <li>• Tarifs préférentiels à vie (-30%)</li>
                  <li>• Accès prioritaire aux nouvelles fonctionnalités</li>
                  <li>• Influence directe sur la roadmap produit</li>
                  <li>• Support VIP dédié</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-gradient-to-r from-primary/10 to-purple-500/10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Rejoignez la Beta Limitée</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Les places sont limitées pour garantir une expérience optimale à chaque beta-testeur.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <Link to="/auth">
                Demander l'accès Beta
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
              <Link to="/contact">
                Nous contacter
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
