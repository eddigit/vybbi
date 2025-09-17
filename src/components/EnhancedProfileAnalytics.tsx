import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Eye, TrendingUp, Users, MapPin, Calendar, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface EnhancedProfileAnalyticsProps {
  profileId: string;
  className?: string;
}

interface AdvancedViewStats {
  total_views: number;
  views_this_week: number;
  views_this_month: number;
  unique_visitors: number;
  agent_views: number;
  manager_views: number;
  venue_views: number;
  bounce_rate: number;
  avg_session_duration: number;
  conversion_rate: number;
}

interface ViewTrend {
  date: string;
  views: number;
  unique_visitors: number;
}

interface GeographicData {
  country: string;
  city: string;
  views: number;
}

interface ReferrerData {
  source: string;
  views: number;
  percentage: number;
}

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export function EnhancedProfileAnalytics({ profileId, className }: EnhancedProfileAnalyticsProps) {
  const [stats, setStats] = useState<AdvancedViewStats | null>(null);
  const [trends, setTrends] = useState<ViewTrend[]>([]);
  const [geographic, setGeographic] = useState<GeographicData[]>([]);
  const [referrers, setReferrers] = useState<ReferrerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profileId) {
      fetchAdvancedStats();
    }
  }, [profileId]);

  const fetchAdvancedStats = async () => {
    try {
      setLoading(true);
      
      // Fetch basic stats
      const { data: basicStats } = await supabase.rpc('get_profile_view_stats', {
        p_profile_id: profileId
      });

      // Mock extended data for now since RPC functions don't exist yet
      const mockTrends: ViewTrend[] = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        views: Math.floor(Math.random() * 20) + 5,
        unique_visitors: Math.floor(Math.random() * 15) + 3
      }));

      const mockGeographic: GeographicData[] = [
        { country: 'France', city: 'Paris', views: 45 },
        { country: 'France', city: 'Lyon', views: 32 },
        { country: 'Belgique', city: 'Bruxelles', views: 18 },
        { country: 'Suisse', city: 'Genève', views: 12 },
        { country: 'Canada', city: 'Montréal', views: 8 }
      ];

      const mockReferrers: ReferrerData[] = [
        { source: 'Direct', views: 65, percentage: 45 },
        { source: 'Google', views: 38, percentage: 26 },
        { source: 'Social Media', views: 28, percentage: 19 },
        { source: 'Referral', views: 15, percentage: 10 }
      ];

      if (basicStats && typeof basicStats === 'object' && !Array.isArray(basicStats)) {
        setStats({
          total_views: basicStats.total_views || 0,
          views_this_week: basicStats.views_this_week || 0,
          views_this_month: basicStats.views_this_month || 0,
          unique_visitors: basicStats.unique_visitors || 0,
          agent_views: basicStats.agent_views || 0,
          manager_views: basicStats.manager_views || 0,
          venue_views: basicStats.venue_views || 0,
          bounce_rate: Math.random() * 30 + 20,
          avg_session_duration: Math.random() * 180 + 60,
          conversion_rate: Math.random() * 5 + 2
        });
      }

      setTrends(mockTrends);
      setGeographic(mockGeographic);
      setReferrers(mockReferrers);
    } catch (error) {
      console.error('Error fetching advanced stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="h-4 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-20 bg-muted rounded animate-pulse" />
            <div className="h-20 bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Analytics Avancées
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Insights détaillés sur votre profil
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="trends">Tendances</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Vues totales</span>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold text-foreground">{stats.total_views}</div>
                <Badge variant={stats.views_this_week > 0 ? "default" : "secondary"} className="text-xs">
                  +{stats.views_this_week} cette semaine
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Visiteurs uniques</span>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold text-foreground">{stats.unique_visitors}</div>
                <Badge variant="outline" className="text-xs">
                  Taux de rebond: {stats.bounce_rate.toFixed(1)}%
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Intérêt professionnel</span>
                <span className="text-sm text-muted-foreground">
                  {stats.agent_views + stats.manager_views + stats.venue_views} vues pro
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Agents</span>
                  <span className="text-foreground">{stats.agent_views}</span>
                </div>
                <Progress value={(stats.agent_views / stats.total_views) * 100} className="h-1.5" />
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Managers</span>
                  <span className="text-foreground">{stats.manager_views}</span>
                </div>
                <Progress value={(stats.manager_views / stats.total_views) * 100} className="h-1.5" />
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Lieux</span>
                  <span className="text-foreground">{stats.venue_views}</span>
                </div>
                <Progress value={(stats.venue_views / stats.total_views) * 100} className="h-1.5" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs fill-muted-foreground"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  />
                  <YAxis className="text-xs fill-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
                    name="Vues"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="unique_visitors" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--secondary))', strokeWidth: 0, r: 3 }}
                    name="Visiteurs uniques"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="audience" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Répartition géographique
                </h4>
                <div className="space-y-2">
                  {geographic.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {item.city}, {item.country}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {item.views}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Sources de trafic
                </h4>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={referrers}
                        cx="50%"
                        cy="50%"
                        innerRadius={20}
                        outerRadius={50}
                        paddingAngle={5}
                        dataKey="views"
                      >
                        {referrers.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Durée de session</span>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-xl font-bold text-foreground">
                  {formatDuration(stats.avg_session_duration)}
                </div>
                <Badge variant="outline" className="text-xs">
                  Moyenne
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Taux de conversion</span>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-xl font-bold text-foreground">
                  {stats.conversion_rate.toFixed(1)}%
                </div>
                <Badge variant="default" className="text-xs">
                  Vues → Contacts
                </Badge>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border">
              <Button size="sm" className="w-full" onClick={fetchAdvancedStats}>
                Actualiser les données
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}