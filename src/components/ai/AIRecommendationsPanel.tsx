import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdvancedAI } from '@/hooks/useAdvancedAI';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  Zap, 
  Target, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  MessageSquare,
  Calendar,
  Users,
  Filter,
  Sparkles
} from 'lucide-react';

export default function AIRecommendationsPanel() {
  const { 
    recommendations, 
    behavioralScores, 
    mlPredictions, 
    loading,
    getHighPriorityRecommendations,
    runAdvancedAIAnalysis 
  } = useAdvancedAI();
  
  const { toast } = useToast();
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const highPriorityRecs = getHighPriorityRecommendations();
  
  const filteredRecommendations = recommendations.filter(rec => {
    const priorityMatch = selectedPriority === 'all' || rec.priority === selectedPriority;
    const typeMatch = selectedType === 'all' || rec.type === selectedType;
    return priorityMatch && typeMatch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive text-destructive-foreground border-destructive';
      case 'high': return 'bg-warning text-warning-foreground border-warning';
      case 'medium': return 'bg-primary text-primary-foreground border-primary';
      default: return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'timing': return <Clock className="w-4 h-4" />;
      case 'channel': return <MessageSquare className="w-4 h-4" />;
      case 'content': return <Lightbulb className="w-4 h-4" />;
      case 'approach': return <Target className="w-4 h-4" />;
      case 'follow-up': return <ArrowRight className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const handleActionTaken = async (recommendationId: string) => {
    // Marquer la recommandation comme traitée
    toast({
      title: "Action prise en compte",
      description: "La recommandation a été marquée comme traitée",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Card className="h-32 bg-muted/50" />
        <Card className="h-96 bg-muted/50" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec métriques globales */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Assistant IA - Recommandations Personnalisées
          </h2>
          <p className="text-muted-foreground">
            Conseils intelligents basés sur l'analyse comportementale en temps réel
          </p>
        </div>
        <Button onClick={runAdvancedAIAnalysis} className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Actualiser l'IA
        </Button>
      </div>

      {/* Métriques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recommandations Actives</CardTitle>
            <Brain className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recommendations.length}</div>
            <p className="text-xs text-muted-foreground">
              {highPriorityRecs.length} prioritaires
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-warning/10 to-warning/5 border-warning/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actions Urgentes</CardTitle>
            <AlertTriangle className="w-4 h-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {recommendations.filter(r => r.priority === 'urgent').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Nécessitent attention immédiate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-success/10 to-success/5 border-success/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confiance Moyenne</CardTitle>
            <Target className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {recommendations.length > 0 
                ? Math.round(recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length)
                : 0}%
            </div>
            <Progress 
              value={recommendations.length > 0 
                ? recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length
                : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-secondary/10 to-secondary/5 border-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impact Potentiel</CardTitle>
            <TrendingUp className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">+{
              Math.round(recommendations.filter(r => r.priority === 'high' || r.priority === 'urgent').length * 15)
            }%</div>
            <p className="text-xs text-muted-foreground">
              Conversion estimée
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres Intelligents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Priorité:</label>
              <select 
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-1 rounded-md border border-border bg-background text-sm"
              >
                <option value="all">Toutes</option>
                <option value="urgent">Urgent</option>
                <option value="high">Élevé</option>
                <option value="medium">Moyen</option>
                <option value="low">Faible</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Type:</label>
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-1 rounded-md border border-border bg-background text-sm"
              >
                <option value="all">Tous</option>
                <option value="timing">Timing</option>
                <option value="channel">Canal</option>
                <option value="content">Contenu</option>
                <option value="approach">Approche</option>
                <option value="follow-up">Suivi</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommandations */}
      <Tabs defaultValue="priority" className="space-y-4">
        <TabsList>
          <TabsTrigger value="priority">Par Priorité</TabsTrigger>
          <TabsTrigger value="type">Par Type</TabsTrigger>
          <TabsTrigger value="timing">Par Timing</TabsTrigger>
        </TabsList>

        <TabsContent value="priority" className="space-y-4">
          {filteredRecommendations.length > 0 ? (
            <div className="space-y-4">
              {filteredRecommendations
                .sort((a, b) => {
                  const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
                  return priorityOrder[b.priority as keyof typeof priorityOrder] - 
                         priorityOrder[a.priority as keyof typeof priorityOrder];
                })
                .map((rec) => (
                  <Card key={rec.id} className={`border-l-4 hover:shadow-glow transition-all duration-300 ${
                    rec.priority === 'urgent' ? 'border-l-destructive bg-destructive/5' :
                    rec.priority === 'high' ? 'border-l-warning bg-warning/5' :
                    rec.priority === 'medium' ? 'border-l-primary bg-primary/5' :
                    'border-l-muted bg-muted/5'
                  }`}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getTypeIcon(rec.type)}
                            <h3 className="font-semibold text-foreground">{rec.title}</h3>
                            <Badge className={getPriorityColor(rec.priority)}>
                              {rec.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {rec.confidence}% confiance
                            </Badge>
                          </div>
                          
                          <p className="text-muted-foreground mb-3">{rec.description}</p>
                          
                          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-3">
                            <h4 className="font-medium text-primary flex items-center gap-2 mb-1">
                              <Zap className="w-4 h-4" />
                              Action Recommandée
                            </h4>
                            <p className="text-sm">{rec.suggestedAction}</p>
                          </div>
                          
                          <div className="bg-success/5 border border-success/20 rounded-lg p-3 mb-3">
                            <h4 className="font-medium text-success flex items-center gap-2 mb-1">
                              <TrendingUp className="w-4 h-4" />
                              Résultat Attendu
                            </h4>
                            <p className="text-sm">{rec.expectedOutcome}</p>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {rec.timeframe}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              Prospect {rec.prospectId.slice(0, 8)}
                            </span>
                          </div>
                          
                          <details className="mt-2">
                            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                              Voir le raisonnement IA
                            </summary>
                            <p className="text-xs text-muted-foreground mt-2 pl-4 border-l-2 border-muted">
                              {rec.reasoning}
                            </p>
                          </details>
                        </div>
                        
                        <div className="flex flex-col gap-2 ml-4">
                          <Button 
                            onClick={() => handleActionTaken(rec.id)}
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Action Prise
                          </Button>
                          <Button variant="outline" size="sm">
                            <Calendar className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune recommandation active</h3>
                <p className="text-muted-foreground text-center">
                  L'IA analyse en continu vos prospects. Les recommandations apparaîtront ici dès qu'elles seront prêtes.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="type" className="space-y-4">
          {['timing', 'channel', 'content', 'approach', 'follow-up'].map(type => {
            const typeRecs = filteredRecommendations.filter(r => r.type === type);
            if (typeRecs.length === 0) return null;
            
            return (
              <Card key={type}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 capitalize">
                    {getTypeIcon(type)}
                    {type === 'timing' ? 'Recommandations de Timing' :
                     type === 'channel' ? 'Recommandations de Canal' :
                     type === 'content' ? 'Recommandations de Contenu' :
                     type === 'approach' ? 'Recommandations d\'Approche' :
                     'Recommandations de Suivi'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {typeRecs.map(rec => (
                      <div key={rec.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{rec.title}</h4>
                          <p className="text-sm text-muted-foreground">{rec.suggestedAction}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getPriorityColor(rec.priority)} variant="secondary">
                              {rec.priority}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{rec.confidence}% confiance</span>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => handleActionTaken(rec.id)}>
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="timing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions Immédiates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredRecommendations
                    .filter(r => r.timeframe.includes('immédiat') || r.timeframe.includes('heure'))
                    .map(rec => (
                      <div key={rec.id} className="flex items-center gap-3 p-2 bg-warning/10 border border-warning/20 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-warning" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{rec.title}</p>
                          <p className="text-xs text-muted-foreground">{rec.timeframe}</p>
                        </div>
                        <Button size="sm" variant="outline">Action</Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>À Planifier</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredRecommendations
                    .filter(r => !r.timeframe.includes('immédiat') && !r.timeframe.includes('heure'))
                    .map(rec => (
                      <div key={rec.id} className="flex items-center gap-3 p-2 bg-primary/10 border border-primary/20 rounded-lg">
                        <Calendar className="w-4 h-4 text-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{rec.title}</p>
                          <p className="text-xs text-muted-foreground">{rec.timeframe}</p>
                        </div>
                        <Button size="sm" variant="outline">Planifier</Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}