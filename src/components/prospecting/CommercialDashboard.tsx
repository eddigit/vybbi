import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Phone, 
  Mail, 
  Calendar, 
  Euro,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { ProspectNotificationCenter } from './ProspectNotificationCenter';
import { ProspectNotificationBadge } from './ProspectNotificationBadge';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  BarChart,
  Bar
} from 'recharts';

interface DashboardMetrics {
  totalProspects: number;
  activeProspects: number;
  convertedThisMonth: number;
  pipelineValue: number;
  conversionRate: number;
  avgDealSize: number;
  responseRate: number;
  followUpsPending: number;
  revenueThisMonth: number;
  revenueGrowth: number;
  prospectsByStage: { stage: string; count: number; value: number }[];
  prospectsByType: { type: string; count: number; percentage: number }[];
  dailyActivity: { date: string; contacts: number; emails: number; conversions: number }[];
  topPerformers: { agent: string; conversions: number; revenue: number }[];
  hotProspects: number;
  urgentFollowUps: number;
}

interface CommercialDashboardProps {
  refreshInterval?: number;
}

export default function CommercialDashboard({ refreshInterval = 300000 }: CommercialDashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProspects: 0,
    activeProspects: 0,
    convertedThisMonth: 0,
    pipelineValue: 0,
    conversionRate: 0,
    avgDealSize: 0,
    responseRate: 0,
    followUpsPending: 0,
    revenueThisMonth: 0,
    revenueGrowth: 0,
    prospectsByStage: [],
    prospectsByType: [],
    dailyActivity: [],
    topPerformers: [],
    hotProspects: 0,
    urgentFollowUps: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh
    const interval = setInterval(loadDashboardData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load prospects data
      const { data: prospectsData } = await supabase
        .from('prospects')
        .select('*');

      // Load conversions data
      const { data: conversionsData } = await supabase
        .from('conversion_tracking')
        .select('*')
        .gte('created_at', new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString());

      // Load agents data
      const { data: agentsData } = await supabase
        .from('vybbi_agents')
        .select('*')
        .eq('is_active', true);

      if (prospectsData) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        
        // Calculate metrics
        const totalProspects = prospectsData.length;
        const activeProspects = prospectsData.filter(p => 
          !['converted', 'rejected', 'unresponsive'].includes(p.status)
        ).length;
        
        const convertedThisMonth = prospectsData.filter(p => 
          p.status === 'converted' && 
          p.converted_at && 
          new Date(p.converted_at) >= startOfMonth
        ).length;

        const lastMonthConverted = prospectsData.filter(p => 
          p.status === 'converted' && 
          p.converted_at && 
          new Date(p.converted_at) >= lastMonth &&
          new Date(p.converted_at) < startOfMonth
        ).length;

        const pipelineValue = prospectsData
          .filter(p => p.status !== 'rejected' && p.status !== 'converted')
          .reduce((sum, p) => sum + (p.estimated_budget || 0), 0);

        const conversionRate = totalProspects > 0 
          ? (prospectsData.filter(p => p.status === 'converted').length / totalProspects) * 100
          : 0;

        const convertedProspects = prospectsData.filter(p => p.status === 'converted');
        const avgDealSize = convertedProspects.length > 0
          ? convertedProspects.reduce((sum, p) => sum + (p.estimated_budget || 0), 0) / convertedProspects.length
          : 0;

        const contactedProspects = prospectsData.filter(p => p.last_contact_at);
        const respondedProspects = prospectsData.filter(p => p.status === 'qualified' || p.status === 'interested');
        const responseRate = contactedProspects.length > 0
          ? (respondedProspects.length / contactedProspects.length) * 100
          : 0;

        const followUpsPending = prospectsData.filter(p => 
          p.next_follow_up_at && 
          new Date(p.next_follow_up_at) <= now &&
          p.status !== 'converted' &&
          p.status !== 'rejected'
        ).length;

        const revenueThisMonth = convertedThisMonth * avgDealSize;
        const lastMonthRevenue = lastMonthConverted * avgDealSize;
        const revenueGrowth = lastMonthRevenue > 0 
          ? ((revenueThisMonth - lastMonthRevenue) / lastMonthRevenue) * 100
          : 0;

        // Prospects by stage
        const stageMapping = {
          'new': 'Contact',
          'contacted': 'Contact',
          'qualified': 'Qualification',
          'proposition': 'Proposition',
          'negotiation': 'Négociation',
          'converted': 'Signature',
          'follow_up': 'Suivi'
        };

        const prospectsByStage = Object.entries(stageMapping).reduce((acc, [status, stage]) => {
          const stageProspects = prospectsData.filter(p => p.status === status);
          const existing = acc.find(s => s.stage === stage);
          
          if (existing) {
            existing.count += stageProspects.length;
            existing.value += stageProspects.reduce((sum, p) => sum + (p.estimated_budget || 0), 0);
          } else {
            acc.push({
              stage,
              count: stageProspects.length,
              value: stageProspects.reduce((sum, p) => sum + (p.estimated_budget || 0), 0)
            });
          }
          return acc;
        }, [] as { stage: string; count: number; value: number }[]);

        // Prospects by type
        const typeGroups = prospectsData.reduce((acc, p) => {
          acc[p.prospect_type] = (acc[p.prospect_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const prospectsByType = Object.entries(typeGroups).map(([type, count]) => ({
          type,
          count,
          percentage: (count / totalProspects) * 100
        }));

        // Hot prospects (high qualification score + recent activity)
        const hotProspects = prospectsData.filter(p => 
          p.qualification_score >= 70 && 
          p.status !== 'converted' &&
          p.status !== 'rejected' &&
          (p.last_contact_at && (now.getTime() - new Date(p.last_contact_at).getTime()) < 7 * 24 * 60 * 60 * 1000)
        ).length;

        // Urgent follow-ups (overdue by more than 2 days)
        const urgentFollowUps = prospectsData.filter(p => 
          p.next_follow_up_at && 
          new Date(p.next_follow_up_at) < new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) &&
          p.status !== 'converted' &&
          p.status !== 'rejected'
        ).length;

        // Generate daily activity for last 7 days
        const dailyActivity = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const dayProspects = prospectsData.filter(p => 
            p.last_contact_at && 
            p.last_contact_at.startsWith(dateStr)
          );
          
          dailyActivity.push({
            date: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
            contacts: dayProspects.length,
            emails: dayProspects.filter(p => p.email).length,
            conversions: prospectsData.filter(p => 
              p.converted_at && 
              p.converted_at.startsWith(dateStr)
            ).length
          });
        }

        // Top performers
        const topPerformers = agentsData?.map(agent => {
          const agentProspects = prospectsData.filter(p => p.assigned_agent_id === agent.id);
          const conversions = agentProspects.filter(p => p.status === 'converted').length;
          const revenue = conversions * avgDealSize;
          
          return {
            agent: agent.agent_name,
            conversions,
            revenue
          };
        }).sort((a, b) => b.conversions - a.conversions).slice(0, 5) || [];

        setMetrics({
          totalProspects,
          activeProspects,
          convertedThisMonth,
          pipelineValue,
          conversionRate,
          avgDealSize,
          responseRate,
          followUpsPending,
          revenueThisMonth,
          revenueGrowth,
          prospectsByStage,
          prospectsByType,
          dailyActivity,
          topPerformers,
          hotProspects,
          urgentFollowUps
        });
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff0000'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Chargement du dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Dashboard Commercial</h2>
            <p className="text-muted-foreground">
              Dernière mise à jour: {lastUpdated.toLocaleTimeString('fr-FR')}
            </p>
          </div>
          <ProspectNotificationBadge />
        </div>
        <div className="flex items-center gap-2">
          <ProspectNotificationCenter />
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="border-l-4 border-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Prospects Actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeProspects}</div>
            <div className="text-xs text-muted-foreground">sur {metrics.totalProspects} total</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="mr-2 h-4 w-4" />
              Conversions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.convertedThisMonth}</div>
            <div className="text-xs text-muted-foreground">ce mois</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Euro className="mr-2 h-4 w-4" />
              Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.pipelineValue)}</div>
            <div className="text-xs text-muted-foreground">valeur totale</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              Taux Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">global</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertCircle className="mr-2 h-4 w-4" />
              Prospects Chauds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.hotProspects}</div>
            <div className="text-xs text-muted-foreground">à prioriser</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              Relances Urgentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.urgentFollowUps}</div>
            <div className="text-xs text-muted-foreground">en retard</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Activité des 7 derniers jours</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics.dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="contacts" 
                  stackId="1" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  name="Contacts"
                />
                <Area 
                  type="monotone" 
                  dataKey="emails" 
                  stackId="1" 
                  stroke="#82ca9d" 
                  fill="#82ca9d" 
                  name="Emails"
                />
                <Area 
                  type="monotone" 
                  dataKey="conversions" 
                  stackId="1" 
                  stroke="#ffc658" 
                  fill="#ffc658" 
                  name="Conversions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pipeline by Stage */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition du Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.prospectsByStage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'count' ? value : formatCurrency(value as number),
                  name === 'count' ? 'Prospects' : 'Valeur'
                ]} />
                <Bar dataKey="count" fill="#8884d8" name="count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Euro className="mr-2 h-5 w-5" />
              Revenus ce Mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(metrics.revenueThisMonth)}</div>
            <div className={`flex items-center mt-2 ${metrics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.revenueGrowth >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              <span>{metrics.revenueGrowth.toFixed(1)}% vs mois dernier</span>
            </div>
          </CardContent>
        </Card>

        {/* Response Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Taux de Réponse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.responseRate.toFixed(1)}%</div>
            <Progress value={metrics.responseRate} className="mt-2" />
            <div className="text-sm text-muted-foreground mt-2">
              Taux de réponse aux emails
            </div>
          </CardContent>
        </Card>

        {/* Average Deal Size */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5" />
              Panier Moyen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(metrics.avgDealSize)}</div>
            <div className="text-sm text-muted-foreground mt-2">
              Par conversion
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      {metrics.topPerformers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="mr-2 h-5 w-5" />
              Top Performers ce Mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topPerformers.map((performer, index) => (
                <div key={performer.agent} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-3">#{index + 1}</Badge>
                    <div>
                      <div className="font-medium">{performer.agent}</div>
                      <div className="text-sm text-muted-foreground">{performer.conversions} conversions</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{formatCurrency(performer.revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}