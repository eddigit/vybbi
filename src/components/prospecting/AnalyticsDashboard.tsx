import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAIScoring } from '@/hooks/useAIScoring';
import { useProspectStats } from '@/hooks/useProspects';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Brain, 
  AlertTriangle,
  Lightbulb,
  Calendar,
  Euro,
  Users,
  Zap,
  Trophy,
  Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export function AnalyticsDashboard() {
  const { scores, insights, loading, getPredictedRevenue, getTopProspects } = useAIScoring();
  const { stats } = useProspectStats();
  const [timeframe, setTimeframe] = useState<'30d' | '90d'>('30d');

  // Données simulées pour les graphiques
  const trendData = [
    { date: '2024-01', prospects: 45, conversions: 8, revenue: 24000 },
    { date: '2024-02', prospects: 52, conversions: 12, revenue: 36000 },
    { date: '2024-03', prospects: 38, conversions: 9, revenue: 27000 },
    { date: '2024-04', prospects: 61, conversions: 15, revenue: 45000 },
    { date: '2024-05', prospects: 73, conversions: 18, revenue: 54000 },
    { date: '2024-06', prospects: 67, conversions: 16, revenue: 48000 }
  ];

  const pipelineHealthData = [
    { name: 'Prospects chauds', value: 25, color: COLORS[0] },
    { name: 'En qualification', value: 40, color: COLORS[1] },
    { name: 'En négociation', value: 20, color: COLORS[2] },
    { name: 'À risque', value: 15, color: COLORS[3] }
  ];

  const performanceData = [
    { agent: 'Marie D.', prospects: 45, conversions: 12, score: 92 },
    { agent: 'Pierre M.', prospects: 38, conversions: 8, score: 78 },
    { agent: 'Sophie L.', prospects: 52, conversions: 14, score: 85 },
    { agent: 'Jean M.', prospects: 33, conversions: 6, score: 71 }
  ];

  const predictedRevenue = getPredictedRevenue(timeframe);
  const topProspects = getTopProspects(5);

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    changeType, 
    icon: Icon,
    prediction 
  }: {
    title: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
    icon: any;
    prediction?: string;
  }) => (
    <Card className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
        <div className="flex items-center gap-2">
          <Badge 
            variant="secondary" 
            className={`text-xs ${
              changeType === 'positive' ? 'text-success' : 
              changeType === 'negative' ? 'text-destructive' : 
              'text-muted-foreground'
            } bg-transparent border-none px-0`}
          >
            {changeType === 'positive' ? <TrendingUp className="w-3 h-3 mr-1" /> : 
             changeType === 'negative' ? <TrendingDown className="w-3 h-3 mr-1" /> : null}
            {change}
          </Badge>
        </div>
        {prediction && (
          <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Brain className="w-3 h-3" />
            Prédiction: {prediction}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="h-32 bg-muted/50" />
          ))}
        </div>
        <Card className="h-96 bg-muted/50" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Métriques Prédictives */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Revenus Prédits"
          value={`${Math.round(predictedRevenue / 1000)}k €`}
          change="+18%"
          changeType="positive"
          icon={Euro}
          prediction={`${Math.round(predictedRevenue * 1.2 / 1000)}k € dans 90j`}
        />
        <MetricCard
          title="Pipeline Health"
          value="87%"
          change="+5%"
          changeType="positive"
          icon={Target}
          prediction="Stabilité prévue"
        />
        <MetricCard
          title="Prospects Chauds"
          value={topProspects.length.toString()}
          change="+12%"
          changeType="positive"
          icon={Zap}
          prediction="3 conversions probables"
        />
        <MetricCard
          title="Score IA Moyen"
          value="74"
          change="+3pts"
          changeType="positive"
          icon={Brain}
          prediction="Amélioration continue"
        />
      </div>

      {/* Insights IA */}
      {insights.length > 0 && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Insights IA - Prédictions Intelligentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border">
                  <div className="mt-1">
                    {insight.type === 'opportunity' && <Lightbulb className="w-4 h-4 text-success" />}
                    {insight.type === 'risk' && <AlertTriangle className="w-4 h-4 text-destructive" />}
                    {insight.type === 'timing' && <Clock className="w-4 h-4 text-warning" />}
                    {insight.type === 'action' && <Target className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        Confiance: {insight.confidence}%
                      </Badge>
                      <Badge 
                        variant={insight.impact === 'high' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        Impact {insight.impact}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Tendances
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Prédictions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des Métriques</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="prospects" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Prospects"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="conversions" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2}
                    name="Conversions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Santé du Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pipelineHealthData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pipelineHealthData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Prospects (Score IA)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topProspects.map((prospect, index) => (
                    <div key={prospect.prospectId} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="text-sm font-medium">Prospect {prospect.prospectId.slice(0, 8)}</div>
                          <div className="text-xs text-muted-foreground">
                            {prospect.preferredChannel} · {prospect.riskLevel} risk
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{prospect.conversionProbability}%</div>
                        <Progress value={prospect.conversionProbability} className="w-16 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Équipe</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="agent" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="prospects" fill="hsl(var(--primary))" name="Prospects" />
                  <Bar dataKey="conversions" fill="hsl(var(--secondary))" name="Conversions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Prévisions de Revenus
                  <div className="flex gap-2">
                    <Button
                      variant={timeframe === '30d' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimeframe('30d')}
                    >
                      30j
                    </Button>
                    <Button
                      variant={timeframe === '90d' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimeframe('90d')}
                    >
                      90j
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round(predictedRevenue / 1000)}k €
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Revenus prédits ({timeframe === '30d' ? '30 jours' : '90 jours'})
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                      <div className="text-lg font-semibold text-success">
                        {Math.round(predictedRevenue * 0.8 / 1000)}k €
                      </div>
                      <div className="text-xs text-muted-foreground">Scénario conservateur</div>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                      <div className="text-lg font-semibold text-warning">
                        {Math.round(predictedRevenue * 1.3 / 1000)}k €
                      </div>
                      <div className="text-xs text-muted-foreground">Scénario optimiste</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Zones d'Attention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                    <div className="flex items-center gap-2 text-destructive font-medium">
                      <AlertTriangle className="w-4 h-4" />
                      Prospects à Risque Élevé
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {scores.filter(s => s.riskLevel === 'high').length} prospects nécessitent une action urgente
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                    <div className="flex items-center gap-2 text-warning font-medium">
                      <Clock className="w-4 h-4" />
                      Timing Critique
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Optimal pour 3 prospects dans les 48h
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                    <div className="flex items-center gap-2 text-success font-medium">
                      <Lightbulb className="w-4 h-4" />
                      Opportunités Cachées
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {scores.filter(s => s.conversionProbability > 75 && s.overallScore < 60).length} prospects sous-évalués détectés
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}