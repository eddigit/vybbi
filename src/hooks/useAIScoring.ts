import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export interface AIScore {
  prospectId: string;
  overallScore: number;
  conversionProbability: number;
  engagementScore: number;
  budgetScore: number;
  timeToContact: number; // heures optimales
  preferredChannel: 'email' | 'whatsapp' | 'phone';
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  lastUpdated: Date;
}

export interface PredictiveInsight {
  type: 'opportunity' | 'risk' | 'timing' | 'action';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
}

export function useAIScoring(prospectId?: string) {
  const [scores, setScores] = useState<AIScore[]>([]);
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateAIScore = (prospect: any): AIScore => {
    // Algorithme de scoring IA simplifié
    let engagementScore = 0;
    let budgetScore = 0;
    let overallScore = 0;

    // Score d'engagement basé sur les interactions
    if (prospect.last_contact_at) {
      const daysSinceContact = Math.floor(
        (Date.now() - new Date(prospect.last_contact_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      engagementScore = Math.max(0, 100 - daysSinceContact * 5);
    }

    // Score budget basé sur le potentiel
    if (prospect.budget_range) {
      const budget = parseInt(prospect.budget_range.split('-')[1] || '0');
      budgetScore = Math.min(100, (budget / 10000) * 50);
    }

    // Score global avec pondération
    overallScore = Math.round(
      (engagementScore * 0.4) + 
      (budgetScore * 0.3) + 
      (prospect.qualification_score || 0) * 0.3
    );

    // Probabilité de conversion basée sur patterns historiques
    const conversionProbability = Math.min(95, overallScore + 
      (prospect.status === 'qualified' ? 20 : 0) +
      (prospect.priority_level === 'high' ? 15 : 0)
    );

    // Temps optimal pour contact (simulation basée sur profile type)
    const timeToContact = prospect.profile_type === 'artist' ? 
      14 + Math.floor(Math.random() * 4) : // 14h-18h pour artistes
      10 + Math.floor(Math.random() * 6);  // 10h-16h pour autres

    // Canal préféré basé sur historique
    const preferredChannel = prospect.whatsapp_number ? 'whatsapp' : 
                           prospect.email ? 'email' : 'phone';

    // Niveau de risque
    const riskLevel = overallScore > 70 ? 'low' : 
                     overallScore > 40 ? 'medium' : 'high';

    // Recommandations IA
    const recommendations = [];
    if (overallScore < 50) {
      recommendations.push("Programmer un appel de qualification approfondi");
    }
    if (conversionProbability > 80) {
      recommendations.push("Préparer une proposition commerciale personnalisée");
    }
    if (riskLevel === 'high') {
      recommendations.push("Relance urgente recommandée dans les 24h");
    }

    return {
      prospectId: prospect.id,
      overallScore,
      conversionProbability,
      engagementScore,
      budgetScore,
      timeToContact,
      preferredChannel,
      riskLevel,
      recommendations,
      lastUpdated: new Date()
    };
  };

  const generatePredictiveInsights = (scores: AIScore[]): PredictiveInsight[] => {
    const insights: PredictiveInsight[] = [];

    // Opportunités cachées
    const undervaluedProspects = scores.filter(s => 
      s.conversionProbability > 75 && s.overallScore < 60
    );
    if (undervaluedProspects.length > 0) {
      insights.push({
        type: 'opportunity',
        title: `${undervaluedProspects.length} opportunités sous-évaluées détectées`,
        description: "Ces prospects ont un fort potentiel mais un score faible. Investigation recommandée.",
        confidence: 85,
        impact: 'high',
        actionable: true
      });
    }

    // Risques de décrochage
    const riskProspects = scores.filter(s => s.riskLevel === 'high');
    if (riskProspects.length > 0) {
      insights.push({
        type: 'risk',
        title: `${riskProspects.length} prospects à risque de décrochage`,
        description: "Action urgente requise pour éviter la perte de ces prospects.",
        confidence: 92,
        impact: 'high',
        actionable: true
      });
    }

    // Timing optimal
    const readyProspects = scores.filter(s => 
      s.conversionProbability > 80 && s.riskLevel === 'low'
    );
    if (readyProspects.length > 0) {
      insights.push({
        type: 'timing',
        title: `${readyProspects.length} prospects prêts pour la conversion`,
        description: "Le timing est optimal pour proposer une offre commerciale.",
        confidence: 88,
        impact: 'high',
        actionable: true
      });
    }

    return insights;
  };

  const fetchAndScoreProspects = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('prospects')
        .select('*');

      if (prospectId) {
        query = query.eq('id', prospectId);
      }

      const { data: prospects, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      if (prospects) {
        const calculatedScores = prospects.map(calculateAIScore);
        setScores(calculatedScores);
        
        if (!prospectId) {
          const generatedInsights = generatePredictiveInsights(calculatedScores);
          setInsights(generatedInsights);
        }
      }
    } catch (err) {
      console.error('Error fetching and scoring prospects:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du calcul des scores IA');
    } finally {
      setLoading(false);
    }
  };

  const getScoreForProspect = (prospectId: string): AIScore | undefined => {
    return scores.find(score => score.prospectId === prospectId);
  };

  const getTopProspects = (limit: number = 5): AIScore[] => {
    return [...scores]
      .sort((a, b) => b.conversionProbability - a.conversionProbability)
      .slice(0, limit);
  };

  const getPredictedRevenue = (timeframe: '30d' | '90d' = '30d'): number => {
    const multiplier = timeframe === '30d' ? 1 : 3;
    return scores.reduce((total, score) => {
      const avgDealValue = 5000; // Valeur moyenne d'un deal
      return total + (score.conversionProbability / 100) * avgDealValue * multiplier;
    }, 0);
  };

  useEffect(() => {
    fetchAndScoreProspects();
  }, [prospectId]);

  return {
    scores,
    insights,
    loading,
    error,
    refetch: fetchAndScoreProspects,
    getScoreForProspect,
    getTopProspects,
    getPredictedRevenue
  };
}