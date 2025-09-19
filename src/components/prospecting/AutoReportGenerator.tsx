import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAIScoring } from '@/hooks/useAIScoring';
import { useProspectStats } from '@/hooks/useProspects';
import { 
  FileText, 
  Download, 
  Mail, 
  Calendar, 
  Settings, 
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

interface ReportConfig {
  frequency: 'daily' | 'weekly' | 'monthly';
  format: 'pdf' | 'excel' | 'email';
  sections: {
    executive_summary: boolean;
    performance_metrics: boolean;
    ai_insights: boolean;
    prospect_analysis: boolean;
    recommendations: boolean;
    charts: boolean;
  };
  recipients: string[];
  autoSend: boolean;
}

export function AutoReportGenerator() {
  const { insights, getPredictedRevenue, getTopProspects } = useAIScoring();
  const { stats } = useProspectStats();
  const [config, setConfig] = useState<ReportConfig>({
    frequency: 'weekly',
    format: 'pdf',
    sections: {
      executive_summary: true,
      performance_metrics: true,
      ai_insights: true,
      prospect_analysis: true,
      recommendations: true,
      charts: true
    },
    recipients: [],
    autoSend: false
  });
  const [generating, setGenerating] = useState(false);

  const generateReport = async () => {
    setGenerating(true);
    
    try {
      // Simulation de génération de rapport
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const reportData = {
        generatedAt: new Date().toISOString(),
        period: config.frequency,
        metrics: {
          totalProspects: stats?.totalProspects || 0,
          conversionRate: ((stats?.byStatus?.converted || 0) / (stats?.totalProspects || 1) * 100).toFixed(1),
          predictedRevenue: getPredictedRevenue('30d'),
          topProspects: getTopProspects(5).map(p => ({
            id: p.prospectId,
            score: p.overallScore,
            probability: p.conversionProbability
          }))
        },
        insights: insights.map(insight => ({
          type: insight.type,
          title: insight.title,
          description: insight.description,
          confidence: insight.confidence,
          impact: insight.impact
        })),
        recommendations: [
          "Prioriser les 5 prospects avec le plus haut score de conversion",
          "Implémenter les recommandations IA pour améliorer l'efficacité",
          "Planifier des relances pour les prospects à risque élevé",
          "Exploiter les opportunités cachées identifiées par l'IA"
        ]
      };

      // Simuler le téléchargement
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-crm-${config.frequency}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Rapport généré et téléchargé avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la génération du rapport');
      console.error('Report generation error:', error);
    } finally {
      setGenerating(false);
    }
  };

  const scheduleAutoReport = async () => {
    try {
      // Simulation de programmation automatique
      toast.success(`Rapport ${config.frequency} programmé avec succès !`);
    } catch (error) {
      toast.error('Erreur lors de la programmation');
    }
  };

  const reportPreview = {
    title: `Rapport CRM ${config.frequency === 'daily' ? 'Quotidien' : 
                        config.frequency === 'weekly' ? 'Hebdomadaire' : 'Mensuel'}`,
    sections: [
      { key: 'executive_summary', title: 'Résumé Exécutif', description: 'Vue d\'ensemble des performances' },
      { key: 'performance_metrics', title: 'Métriques de Performance', description: 'KPIs détaillés et tendances' },
      { key: 'ai_insights', title: 'Insights IA', description: 'Analyses prédictives et recommandations' },
      { key: 'prospect_analysis', title: 'Analyse des Prospects', description: 'Segmentation et scoring' },
      { key: 'recommendations', title: 'Recommandations', description: 'Actions prioritaires suggérées' },
      { key: 'charts', title: 'Graphiques', description: 'Visualisations et tendances' }
    ]
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration du rapport */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuration du Rapport
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="frequency">Fréquence</Label>
                <Select 
                  value={config.frequency} 
                  onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                    setConfig(prev => ({ ...prev, frequency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Quotidien</SelectItem>
                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                    <SelectItem value="monthly">Mensuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="format">Format</Label>
                <Select 
                  value={config.format} 
                  onValueChange={(value: 'pdf' | 'excel' | 'email') => 
                    setConfig(prev => ({ ...prev, format: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-send"
                  checked={config.autoSend}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, autoSend: checked }))
                  }
                />
                <Label htmlFor="auto-send">Envoi automatique</Label>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Sections à inclure</Label>
              {reportPreview.sections.map((section) => (
                <div key={section.key} className="flex items-center space-x-2">
                  <Switch
                    id={section.key}
                    checked={config.sections[section.key as keyof typeof config.sections]}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({
                        ...prev,
                        sections: { ...prev.sections, [section.key]: checked }
                      }))
                    }
                  />
                  <div>
                    <Label htmlFor={section.key} className="text-sm font-medium">
                      {section.title}
                    </Label>
                    <p className="text-xs text-muted-foreground">{section.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={generateReport} disabled={generating} className="flex-1">
                {generating ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Générer Maintenant
                  </>
                )}
              </Button>
              
              {config.autoSend && (
                <Button variant="outline" onClick={scheduleAutoReport}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Programmer
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Aperçu du rapport */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Aperçu du Rapport
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <div className="font-medium mb-2">{reportPreview.title}</div>
              <div className="text-sm text-muted-foreground">
                Généré le {new Date().toLocaleDateString()} à {new Date().toLocaleTimeString()}
              </div>
            </div>

            <div className="space-y-3">
              {reportPreview.sections
                .filter(section => config.sections[section.key as keyof typeof config.sections])
                .map((section) => (
                <div key={section.key} className="flex items-center gap-3 p-2 rounded-lg bg-background border">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <div>
                    <div className="text-sm font-medium">{section.title}</div>
                    <div className="text-xs text-muted-foreground">{section.description}</div>
                  </div>
                </div>
              ))}
            </div>

            {insights.length > 0 && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="text-sm font-medium text-primary mb-2">
                  Insights IA inclus ({insights.length})
                </div>
                <div className="space-y-1">
                  {insights.slice(0, 3).map((insight, index) => (
                    <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                      {insight.type === 'opportunity' && <Lightbulb className="w-3 h-3 text-success" />}
                      {insight.type === 'risk' && <AlertTriangle className="w-3 h-3 text-destructive" />}
                      {insight.type === 'timing' && <Clock className="w-3 h-3 text-warning" />}
                      {insight.title}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Métriques en temps réel pour le rapport */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Données en Temps Réel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="text-2xl font-bold text-primary">
                {stats?.totalProspects || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Prospects</div>
            </div>
            
            <div className="p-4 rounded-lg bg-success/5 border border-success/20">
              <div className="text-2xl font-bold text-success">
                {((stats?.byStatus?.converted || 0) / (stats?.totalProspects || 1) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Taux Conversion</div>
            </div>
            
            <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
              <div className="text-2xl font-bold text-warning">
                {Math.round(getPredictedRevenue('30d') / 1000)}k €
              </div>
              <div className="text-sm text-muted-foreground">Revenus Prédits</div>
            </div>
            
            <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
              <div className="text-2xl font-bold text-accent">
                {insights.length}
              </div>
              <div className="text-sm text-muted-foreground">Insights IA</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}