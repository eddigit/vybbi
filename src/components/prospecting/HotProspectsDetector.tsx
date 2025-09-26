import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  Flame, 
  Eye, 
  Star,
  Mail,
  Phone,
  MessageCircle,
  Calendar,
  ArrowUp,
  Clock,
  User
} from 'lucide-react';

interface HotProspect {
  id: string;
  contact_name: string;
  company_name?: string;
  prospect_type: string;
  qualification_score: number;
  last_engagement_score: number;
  influence_score: number;
  priority_level: string;
  tags: string[];
  email?: string;
  phone?: string;
  whatsapp_number?: string;
  last_contact_at?: string;
  created_at: string;
  // Métriques d'engagement calculées
  engagement_events?: number;
  score_trend?: 'up' | 'down' | 'stable';
  heat_score?: number;
  recent_activity?: string[];
}

interface HeatMetrics {
  totalHotProspects: number;
  avgHeatScore: number;
  topPerformer: string;
  weeklyGrowth: number;
}

export default function HotProspectsDetector() {
  const { toast } = useToast();
  const [hotProspects, setHotProspects] = useState<HotProspect[]>([]);
  const [metrics, setMetrics] = useState<HeatMetrics>({
    totalHotProspects: 0,
    avgHeatScore: 0,
    topPerformer: '-',
    weeklyGrowth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHotProspects();
  }, []);

  const loadHotProspects = async () => {
    try {
      setLoading(true);

      // Requête complexe pour identifier les prospects "chauds"
      const { data: prospectsData } = await supabase
        .from('prospects')
        .select(`
          *,
          engagement_events:prospect_engagement_events(count),
          scoring_history:prospect_scoring_history(
            previous_score,
            new_score,
            calculated_at
          )
        `)
        .gte('qualification_score', 60) // Score minimum
        .order('last_engagement_score', { ascending: false })
        .limit(20);

      if (prospectsData) {
        // Enrichir les données avec le calcul de heat score
        const enrichedProspects = await Promise.all(
          prospectsData.map(async (prospect) => {
            const heatScore = calculateHeatScore(prospect);
            const scoreTrend = calculateScoreTrend(prospect.scoring_history || []);
            const recentActivity = await getRecentActivity(prospect.id);

            return {
              ...prospect,
              heat_score: heatScore,
              score_trend: scoreTrend,
              recent_activity: recentActivity,
              engagement_events: prospect.engagement_events?.[0]?.count || 0
            };
          })
        );

        // Trier par heat score
        const sortedProspects = enrichedProspects
          .sort((a, b) => (b.heat_score || 0) - (a.heat_score || 0))
          .filter(p => (p.heat_score || 0) >= 70); // Seuil de "chaleur"

        setHotProspects(sortedProspects);

        // Calculer les métriques
        const avgScore = sortedProspects.length > 0 
          ? sortedProspects.reduce((sum, p) => sum + (p.heat_score || 0), 0) / sortedProspects.length
          : 0;

        setMetrics({
          totalHotProspects: sortedProspects.length,
          avgHeatScore: Math.round(avgScore),
          topPerformer: sortedProspects[0]?.contact_name || '-',
          weeklyGrowth: calculateWeeklyGrowth(sortedProspects)
        });
      }

    } catch (error) {
      console.error('Erreur chargement hot prospects:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les prospects chauds",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateHeatScore = (prospect: any): number => {
    let score = 0;

    // Score de qualification (40%)
    score += (prospect.qualification_score || 0) * 0.4;

    // Score d'influence (20%)
    score += (prospect.influence_score || 0) * 0.2;

    // Niveau de priorité (15%)
    const priorityScores = { 'low': 25, 'medium': 50, 'high': 75, 'critical': 100 };
    score += (priorityScores[prospect.priority_level as keyof typeof priorityScores] || 0) * 0.15;

    // Activité récente (15%)
    const daysSinceLastContact = prospect.last_contact_at 
      ? (Date.now() - new Date(prospect.last_contact_at).getTime()) / (1000 * 60 * 60 * 24)
      : 999;
    const recencyScore = Math.max(0, 100 - (daysSinceLastContact * 5)); // Diminue avec le temps
    score += recencyScore * 0.15;

    // Tags VIP/Premium (10%)
    const vipTags = ['VIP', 'Chaud', 'Sponsor Potentiel', 'Influenceur'];
    const hasVipTag = prospect.tags?.some((tag: string) => vipTags.includes(tag));
    score += hasVipTag ? 10 : 0;

    return Math.min(100, Math.round(score));
  };

  const calculateScoreTrend = (scoringHistory: any[]): 'up' | 'down' | 'stable' => {
    if (!scoringHistory || scoringHistory.length < 2) return 'stable';

    const recent = scoringHistory.slice(-3); // 3 derniers changements
    const trend = recent.reduce((acc, curr) => {
      return acc + (curr.new_score - curr.previous_score);
    }, 0);

    if (trend > 5) return 'up';
    if (trend < -5) return 'down';
    return 'stable';
  };

  const getRecentActivity = async (prospectId: string): Promise<string[]> => {
    try {
      const { data } = await supabase
        .from('prospect_engagement_events')
        .select('event_type, occurred_at')
        .eq('prospect_id', prospectId)
        .gte('occurred_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('occurred_at', { ascending: false })
        .limit(5);

      return data?.map(event => event.event_type) || [];
    } catch {
      return [];
    }
  };

  const calculateWeeklyGrowth = (prospects: HotProspect[]): number => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentProspects = prospects.filter(p => 
      new Date(p.created_at) > weekAgo
    ).length;
    
    return recentProspects;
  };

  const getHeatColor = (score: number): string => {
    if (score >= 90) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 80) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const getHeatIcon = (score: number) => {
    if (score >= 90) return <Flame className="h-4 w-4 text-red-500" />;
    if (score >= 80) return <TrendingUp className="h-4 w-4 text-orange-500" />;
    if (score >= 70) return <Star className="h-4 w-4 text-yellow-500" />;
    return <Eye className="h-4 w-4 text-blue-500" />;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-3 w-3 text-green-500" />;
      case 'down': return <ArrowUp className="h-3 w-3 text-red-500 rotate-180" />;
      default: return <Clock className="h-3 w-3 text-gray-500" />;
    }
  };

  const getProspectTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'artist': 'Artiste',
      'venue': 'Organisateur',
      'agent': 'Agent',
      'manager': 'Manager',
      'sponsors': 'Sponsor',
      'media': 'Média',
      'academie': 'École',
      'agence': 'Agence',
      'influenceur': 'Influenceur'
    };
    return labels[type] || type;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Analyse des prospects chauds...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Flame className="h-6 w-6 text-red-500" />
            Détecteur de Prospects Chauds
          </h2>
          <p className="text-muted-foreground">
            Intelligence artificielle pour identifier vos prospects les plus prometteurs
          </p>
        </div>
        <Button onClick={loadHotProspects} variant="outline">
          Actualiser l'analyse
        </Button>
      </div>

      {/* Métriques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prospects Chauds</CardTitle>
            <Flame className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalHotProspects}</div>
            <p className="text-xs text-muted-foreground">
              Score ≥ 70/100
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Moyen</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgHeatScore}/100</div>
            <Progress value={metrics.avgHeatScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{metrics.topPerformer}</div>
            <p className="text-xs text-muted-foreground">
              Prospect le plus prometteur
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nouveaux (7j)</CardTitle>
            <ArrowUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{metrics.weeklyGrowth}</div>
            <p className="text-xs text-muted-foreground">
              Cette semaine
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des prospects chauds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-red-500" />
            Prospects à Prioriser ({hotProspects.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hotProspects.length > 0 ? (
            <div className="space-y-4">
              {hotProspects.map((prospect) => (
                <Card key={prospect.id} className={`border-l-4 ${getHeatColor(prospect.heat_score || 0)}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {prospect.contact_name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{prospect.contact_name}</h3>
                            {getTrendIcon(prospect.score_trend || 'stable')}
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <span>{prospect.company_name}</span>
                            <span>•</span>
                            <span>{getProspectTypeLabel(prospect.prospect_type)}</span>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-2">
                            {prospect.tags?.slice(0, 3).map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Qualification: {prospect.qualification_score}/100</span>
                            <span>Influence: {prospect.influence_score}/100</span>
                            <span>Événements: {prospect.engagement_events}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          {getHeatIcon(prospect.heat_score || 0)}
                          <span className="text-lg font-bold">
                            {prospect.heat_score}/100
                          </span>
                        </div>
                        
                        <div className="flex gap-1">
                          {prospect.email && (
                            <Button variant="outline" size="sm">
                              <Mail className="h-4 w-4" />
                            </Button>
                          )}
                          {prospect.whatsapp_number && (
                            <Button variant="outline" size="sm">
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {prospect.phone && (
                            <Button variant="outline" size="sm">
                              <Phone className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {prospect.recent_activity && prospect.recent_activity.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Activité récente:</p>
                        <div className="flex gap-1">
                          {prospect.recent_activity.slice(0, 3).map((activity, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {activity.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Flame className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Aucun prospect chaud détecté</h3>
              <p className="text-muted-foreground">
                Continuez votre prospection pour identifier des prospects prometteurs
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}