import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Database, Users, Calendar, FileText, Music, RefreshCw, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface KnowledgeStats {
  profiles: { total: number; artists: number; agents: number; managers: number; venues: number };
  events: { total: number; published: number; draft: number };
  annonces: { total: number; published: number; active: number };
  mediaAssets: { total: number; audio: number; image: number; video: number };
  availability: { total: number; available: number };
  reviews: { total: number; avgRating: number };
}

export function VybbiKnowledge() {
  const [stats, setStats] = useState<KnowledgeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    loadKnowledgeStats();
  }, []);

  const loadKnowledgeStats = async () => {
    setLoading(true);
    try {
      // Charger les stats de toutes les tables
      const [
        profilesRes,
        eventsRes, 
        annoncesRes,
        mediaRes,
        availabilityRes,
        reviewsRes
      ] = await Promise.all([
        supabase.from('profiles').select('profile_type, is_public'),
        supabase.from('events').select('status'),
        supabase.from('annonces').select('status'),
        supabase.from('media_assets').select('media_type'),
        supabase.from('availability_slots').select('status'),
        supabase.from('detailed_reviews').select('overall_average')
      ]);

      // Traiter les données profiles
      const profiles = profilesRes.data || [];
      const profileStats = {
        total: profiles.length,
        artists: profiles.filter(p => p.profile_type === 'artist').length,
        agents: profiles.filter(p => p.profile_type === 'agent').length,
        managers: profiles.filter(p => p.profile_type === 'manager').length,
        venues: profiles.filter(p => p.profile_type === 'lieu').length
      };

      // Traiter les données événements
      const events = eventsRes.data || [];
      const eventStats = {
        total: events.length,
        published: events.filter(e => e.status === 'published').length,
        draft: events.filter(e => e.status === 'draft').length
      };

      // Traiter les données annonces
      const annonces = annoncesRes.data || [];
      const annonceStats = {
        total: annonces.length,
        published: annonces.filter(a => a.status === 'published').length,
        active: annonces.filter(a => a.status === 'published').length
      };

      // Traiter les données média
      const media = mediaRes.data || [];
      const mediaStats = {
        total: media.length,
        audio: media.filter(m => m.media_type === 'audio').length,
        image: media.filter(m => m.media_type === 'image').length,
        video: media.filter(m => m.media_type === 'video').length
      };

      // Traiter les disponibilités
      const availability = availabilityRes.data || [];
      const availabilityStats = {
        total: availability.length,
        available: availability.filter(a => a.status === 'available').length
      };

      // Traiter les reviews
      const reviews = reviewsRes.data || [];
      const reviewStats = {
        total: reviews.length,
        avgRating: reviews.length > 0 ? 
          reviews.reduce((acc, r) => acc + (r.overall_average || 0), 0) / reviews.length : 0
      };

      setStats({
        profiles: profileStats,
        events: eventStats,
        annonces: annonceStats,
        mediaAssets: mediaStats,
        availability: availabilityStats,
        reviews: reviewStats
      });

      setLastUpdate(new Date());

    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-48">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const knowledgeAreas = [
    {
      title: 'Profils Utilisateurs',
      icon: Users,
      data: stats.profiles,
      items: [
        { label: 'Artistes', value: stats.profiles.artists, color: 'bg-blue-500' },
        { label: 'Agents', value: stats.profiles.agents, color: 'bg-green-500' },
        { label: 'Managers', value: stats.profiles.managers, color: 'bg-yellow-500' },
        { label: 'Lieux', value: stats.profiles.venues, color: 'bg-purple-500' }
      ]
    },
    {
      title: 'Événements',
      icon: Calendar,
      data: stats.events,
      items: [
        { label: 'Publiés', value: stats.events.published, color: 'bg-green-500' },
        { label: 'Brouillons', value: stats.events.draft, color: 'bg-gray-500' }
      ]
    },
    {
      title: 'Annonces',
      icon: FileText,
      data: stats.annonces,
      items: [
        { label: 'Actives', value: stats.annonces.active, color: 'bg-green-500' },
        { label: 'Total', value: stats.annonces.total, color: 'bg-blue-500' }
      ]
    },
    {
      title: 'Médias',
      icon: Music,
      data: stats.mediaAssets,
      items: [
        { label: 'Audio', value: stats.mediaAssets.audio, color: 'bg-red-500' },
        { label: 'Images', value: stats.mediaAssets.image, color: 'bg-blue-500' },
        { label: 'Vidéos', value: stats.mediaAssets.video, color: 'bg-purple-500' }
      ]
    }
  ];

  const totalKnowledge = Object.values(stats).reduce((acc, category) => acc + category.total, 0);
  const knowledgeCompleteness = Math.min(100, Math.round((totalKnowledge / 1000) * 100)); // Base 1000 éléments pour 100%

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Base de Connaissances de Vybbi
          </CardTitle>
          <Button onClick={loadKnowledgeStats} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Complétude des connaissances</span>
              <span className="text-sm text-muted-foreground">{knowledgeCompleteness}%</span>
            </div>
            <Progress value={knowledgeCompleteness} className="w-full" />
            <div className="text-xs text-muted-foreground">
              {totalKnowledge} éléments de données disponibles pour l'IA
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Areas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {knowledgeAreas.map((area) => (
          <Card key={area.title}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <area.icon className="h-4 w-4 text-primary" />
                {area.title}
                <Badge variant="secondary">{area.data.total}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {area.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <Badge variant="outline">{item.value}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.availability.available}</div>
            <div className="text-sm text-muted-foreground">Créneaux disponibles</div>
            <div className="text-xs text-muted-foreground mt-1">
              Sur {stats.availability.total} au total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.reviews.avgRating.toFixed(1)}/5
            </div>
            <div className="text-sm text-muted-foreground">Note moyenne</div>
            <div className="text-xs text-muted-foreground mt-1">
              Basé sur {stats.reviews.total} avis
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {lastUpdate?.toLocaleTimeString()}
            </div>
            <div className="text-sm text-muted-foreground">Dernière mise à jour</div>
            <div className="text-xs text-muted-foreground mt-1">
              {lastUpdate?.toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vybbi Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle>Capacités d'Analyse de Vybbi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Données Accessibles</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>• Profils complets avec disponibilités et préférences</div>
                <div>• Événements passés et futurs avec critères détaillés</div>
                <div>• Historique des collaborations et évaluations</div>
                <div>• Portfolio média de chaque artiste</div>
                <div>• Géolocalisation et zones de couverture</div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Analyses Possibles</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>• Matching intelligent basé sur critères multiples</div>
                <div>• Recommandations personnalisées par profil</div>
                <div>• Détection d'opportunités en temps réel</div>
                <div>• Analyse prédictive des tendances</div>
                <div>• Optimisation des tarifs et disponibilités</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}