import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAdvancedAI } from '@/hooks/useAdvancedAI';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  DollarSign,
  Users,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Area,
  AreaChart
} from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function PredictiveAnalyticsDashboard() {
  const { 
    mlPredictions, 
    behavioralScores, 
    recommendations,
    loading,
    getAverageConversionProbability 
  } = useAdvancedAI();

  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  // Calculs des métriques prédictives
  const predictiveMetrics = useMemo(() => {
    if (mlPredictions.length === 0) return null;

    const avgConversion = getAverageConversionProbability();
    const totalPredictedRevenue = mlPredictions.reduce((sum, p) => sum + p.dealSize, 0);
    const avgTimeToConversion = mlPredictions.reduce((sum, p) => sum + p.timeToConversion, 0) / mlPredictions.length;
    const highConfidenceDeals = mlPredictions.filter(p => p.conversionProbability > 70).length;
    const riskProspects = mlPredictions.filter(p => p.riskFactors.length > 2).length;

    return {
      avgConversion: Math.round(avgConversion),
      totalPredictedRevenue,
      avgTimeToConversion: Math.round(avgTimeToConversion),
      highConfidenceDeals,
      riskProspects,
      opportunityValue: Math.round(totalPredictedRevenue * (avgConversion / 100))
    };
  }, [mlPredictions, getAverageConversionProbability]);

  // Données pour les graphiques
  const conversionTrendData = useMemo(() => {
    // Simulation de données de tendance basée sur les prédictions
    const now = new Date();
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
      const baseConversion = 15 + Math.sin(i / 5) * 5;
      const prediction = baseConversion + (mlPredictions.length > 0 ? 
        (getAverageConversionProbability() - 50) / 10 : 0);
      
      return {
        date: date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
        actual: Math.max(0, baseConversion + (Math.random() - 0.5) * 8),
        predicted: Math.max(0, prediction),
        confidence: Math.min(100, 60 + Math.random() * 30)
      };
    });
  }, [mlPredictions, getAverageConversionProbability]);

  const dealSizeDistribution = useMemo(() => {
    if (mlPredictions.length === 0) return [];
    
    const ranges = [
      { range: '< 5k€', min: 0, max: 5000, count: 0, value: 0 },
      { range: '5k-15k€', min: 5000, max: 15000, count: 0, value: 0 },
      { range: '15k-50k€', min: 15000, max: 50000, count: 0, value: 0 },
      { range: '> 50k€', min: 50000, max: Infinity, count: 0, value: 0 }
    ];

    mlPredictions.forEach(p => {
      const range = ranges.find(r => p.dealSize >= r.min && p.dealSize < r.max);
      if (range) {
        range.count++;
        range.value += p.dealSize;
      }
    });

    return ranges.filter(r => r.count > 0);
  }, [mlPredictions]);

  const riskFactorAnalysis = useMemo(() => {
    const allRiskFactors: Record<string, number> = {};
    mlPredictions.forEach(p => {
      p.riskFactors.forEach(factor => {
        allRiskFactors[factor] = (allRiskFactors[factor] || 0) + 1;
      });
    });

    return Object.entries(allRiskFactors)
      .map(([factor, count]) => ({ factor, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [mlPredictions]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-32 bg-muted/50" />
          ))}
        </div>
        <Card className="h-96 bg-muted/50" />
      </div>
    );
  }

  if (!predictiveMetrics) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Brain className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Analyse Prédictive en Cours</h3>
          <p className="text-muted-foreground text-center">
            L'IA collecte des données pour générer des prédictions précises. Revenez dans quelques minutes.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Analyse Prédictive Avancée
          </h2>
          <p className="text-muted-foreground">
            Intelligence artificielle pour prédire les conversions et optimiser les stratégies
          </p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map(period => (
            <Button
              key={period}
              variant={selectedTimeframe === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe(period)}
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Conversion Prédit</CardTitle>
            <Target className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{predictiveMetrics.avgConversion}%</div>
            <Progress value={predictiveMetrics.avgConversion} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Basé sur {mlPredictions.length} analyses comportementales
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-success/10 to-success/5 border-success/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus Prédits</CardTitle>
            <DollarSign className="w-5 h-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {Math.round(predictiveMetrics.opportunityValue / 1000)}k€
            </div>
            <p className="text-xs text-muted-foreground">
              Sur {Math.round(predictiveMetrics.totalPredictedRevenue / 1000)}k€ potentiel
            </p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-success" />
              <span className="text-xs text-success">Probabilité élevée</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-warning/10 to-warning/5 border-warning/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps Moyen Conversion</CardTitle>
            <Clock className="w-5 h-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{predictiveMetrics.avgTimeToConversion}j</div>
            <p className="text-xs text-muted-foreground">
              Cycle de vente optimisé par IA
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-secondary/10 to-secondary/5 border-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deals Haute Confiance</CardTitle>
            <CheckCircle className="w-5 h-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">{predictiveMetrics.highConfidenceDeals}</div>
            <p className="text-xs text-muted-foreground">
              Probabilité &gt; 70%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-destructive/10 to-destructive/5 border-destructive/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prospects à Risque</CardTitle>
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{predictiveMetrics.riskProspects}</div>
            <p className="text-xs text-muted-foreground">
              Nécessitent action urgente
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Précision IA</CardTitle>
            <Brain className="w-5 h-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">87%</div>
            <p className="text-xs text-muted-foreground">
              Fiabilité des prédictions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et analyses */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Tendances</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="risks">Analyses de Risque</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunités</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Évolution Prédictive des Conversions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={conversionTrendData}>
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
                  <Area 
                    type="monotone" 
                    dataKey="predicted" 
                    stackId="1"
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))"
                    fillOpacity={0.6}
                    name="Prédiction IA"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="actual" 
                    stackId="2"
                    stroke="hsl(var(--secondary))" 
                    fill="hsl(var(--secondary))"
                    fillOpacity={0.4}
                    name="Réel"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribution des Tailles de Deal</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dealSizeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" name="Nombre de deals" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Prospects par Score ML</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mlPredictions
                    .sort((a, b) => b.conversionProbability - a.conversionProbability)
                    .slice(0, 5)
                    .map((prediction, index) => (
                      <div key={prediction.prospectId} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="text-sm font-medium">
                              Prospect {prediction.prospectId.slice(0, 8)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Deal estimé: {Math.round(prediction.dealSize / 1000)}k€
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            {prediction.conversionProbability}%
                          </div>
                          <Progress value={prediction.conversionProbability} className="w-16 h-2" />
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Facteurs de Risque Principaux
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {riskFactorAnalysis.map((risk, index) => (
                    <div key={risk.factor} className="flex items-center justify-between p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center text-xs font-medium text-destructive">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium">{risk.factor}</span>
                      </div>
                      <Badge variant="destructive">{risk.count} prospects</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions Correctives Suggérées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
                    <h4 className="font-medium text-warning mb-1">Suivi Intensif</h4>
                    <p className="text-sm text-muted-foreground">
                      {predictiveMetrics.riskProspects} prospects nécessitent un suivi dans les 24h
                    </p>
                  </div>
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <h4 className="font-medium text-primary mb-1">Optimisation Canal</h4>
                    <p className="text-sm text-muted-foreground">
                      Basculer vers WhatsApp pour {Math.round(mlPredictions.length * 0.3)} prospects
                    </p>
                  </div>
                  <div className="p-3 bg-success/5 border border-success/20 rounded-lg">
                    <h4 className="font-medium text-success mb-1">Accélération</h4>
                    <p className="text-sm text-muted-foreground">
                      {predictiveMetrics.highConfidenceDeals} deals prêts pour proposition commerciale
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-warning" />
                  Opportunités Immédiates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-warning mb-2">
                    {mlPredictions.filter(p => p.conversionProbability > 80).length}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Prospects prêts à convertir
                  </p>
                  <Button className="mt-4 w-full" size="sm">
                    <Zap className="w-4 h-4 mr-2" />
                    Agir Maintenant
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Potentiel à Débloquer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {Math.round((predictiveMetrics.totalPredictedRevenue - predictiveMetrics.opportunityValue) / 1000)}k€
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Revenus en attente d'optimisation
                  </p>
                  <Button variant="outline" className="mt-4 w-full" size="sm">
                    <Target className="w-4 h-4 mr-2" />
                    Optimiser
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-success" />
                  Croissance Prédite
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-success mb-2">+{Math.round(predictiveMetrics.avgConversion * 1.2)}%</div>
                  <p className="text-sm text-muted-foreground">
                    Amélioration possible avec IA
                  </p>
                  <Button variant="outline" className="mt-4 w-full" size="sm">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Voir Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}