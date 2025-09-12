import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Activity, MessageSquare, Clock, TrendingUp, RefreshCw, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface VybbiInteraction {
  id: string;
  message: string;
  response: string;
  action?: string;
  created_at: string;
  response_time_ms?: number;
}

export function VybbiMonitoring() {
  const { toast } = useToast();
  const [interactions, setInteractions] = useState<VybbiInteraction[]>([]);
  const [stats, setStats] = useState({
    totalInteractions: 0,
    todayInteractions: 0,
    avgResponseTime: 0,
    popularActions: [] as { action: string; count: number }[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger les dernières interactions (simulation - table n'existe pas encore)
      const mockInteractions: VybbiInteraction[] = [
        {
          id: '1',
          message: 'Trouve-moi des DJ techno disponibles ce weekend à Paris',
          response: 'J\'ai trouvé 3 DJs techno disponibles ce weekend à Paris : DJ Alex (électro-techno), Sarah Mix (techno minimale), et Beat Master (hardtek). Tous ont des créneaux libres samedi soir.',
          action: 'search',
          created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          response_time_ms: 850
        },
        {
          id: '2', 
          message: 'Analyse les nouvelles disponibilités d\'artistes',
          response: '5 artistes ont mis à jour leurs disponibilités aujourd\'hui. Je détecte 2 correspondances potentielles avec des événements en attente : Luna Sound pour le festival Electro Night, et Bass Drop pour la soirée club Warehouse.',
          action: 'match',
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          response_time_ms: 1200
        },
        {
          id: '3',
          message: 'Recommande-moi des artistes pour un club de 300 personnes',
          response: 'Pour un club de 300 personnes, je recommande : Artists émergents (50% moins cher, parfait pour débuter), DJs résidents locaux (bien connectés au public), ou artistes confirmés en soirée test. Genre musical souhaité ?',
          action: 'recommend', 
          created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          response_time_ms: 950
        }
      ];

      setInteractions(mockInteractions);

      // Calculer les stats
      const today = new Date().toDateString();
      const todayCount = mockInteractions.filter(i => 
        new Date(i.created_at).toDateString() === today
      ).length;

      const avgTime = mockInteractions.reduce((acc, i) => acc + (i.response_time_ms || 0), 0) / mockInteractions.length;

      const actionCounts = mockInteractions.reduce((acc, i) => {
        if (i.action) {
          acc[i.action] = (acc[i.action] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const popularActions = Object.entries(actionCounts)
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count);

      setStats({
        totalInteractions: mockInteractions.length,
        todayInteractions: todayCount,
        avgResponseTime: avgTime,
        popularActions
      });

    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de monitoring",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const csvContent = interactions.map(i => 
      `${i.created_at},${i.action || ''},${i.message.replace(/,/g, ';')},${i.response.replace(/,/g, ';')},${i.response_time_ms || ''}`
    ).join('\n');

    const blob = new Blob([`Date,Action,Message,Réponse,Temps de réponse (ms)\n${csvContent}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vybbi_interactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const actionLabels: Record<string, string> = {
    search: 'Recherche',
    match: 'Matching',  
    recommend: 'Recommandation',
    analyze: 'Analyse',
    chat: 'Chat général'
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{stats.totalInteractions}</div>
            </div>
            <p className="text-xs text-muted-foreground">Total interactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{stats.todayInteractions}</div>
            </div>
            <p className="text-xs text-muted-foreground">Aujourd'hui</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{Math.round(stats.avgResponseTime)}ms</div>
            </div>
            <p className="text-xs text-muted-foreground">Temps de réponse moyen</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold text-green-600">●</div>
            </div>
            <p className="text-xs text-muted-foreground">Statut Vybbi</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actions populaires */}
        <Card>
          <CardHeader>
            <CardTitle>Actions les plus utilisées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.popularActions.map((item, index) => (
                <div key={item.action} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">#{index + 1}</div>
                    <Badge variant="outline">{actionLabels[item.action] || item.action}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{item.count} fois</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Historique récent */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Interactions récentes</CardTitle>
            <div className="flex gap-2">
              <Button onClick={loadData} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button onClick={exportData} size="sm" variant="outline">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {interactions.map((interaction) => (
                  <div key={interaction.id} className="border-l-2 border-primary pl-3 pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      {interaction.action && (
                        <Badge variant="secondary" className="text-xs">
                          {actionLabels[interaction.action] || interaction.action}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(interaction.created_at).toLocaleString()}
                      </span>
                      {interaction.response_time_ms && (
                        <span className="text-xs text-muted-foreground">
                          {interaction.response_time_ms}ms
                        </span>
                      )}
                    </div>
                    <div className="text-sm mb-1 font-medium">
                      Q: {interaction.message.length > 80 ? 
                        interaction.message.substring(0, 80) + '...' : 
                        interaction.message
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">
                      R: {interaction.response.length > 120 ? 
                        interaction.response.substring(0, 120) + '...' : 
                        interaction.response
                      }
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}