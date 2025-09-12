import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Search, Zap, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function VybbiAccessBar() {
  const { profile } = useAuth();

  const getQuickActions = () => {
    switch (profile?.profile_type) {
      case 'artist':
        return [
          { label: "Trouver des concerts", query: "Trouve-moi des opportunités de concerts dans ma région" },
          { label: "Analyser mon profil", query: "Analyse mon profil et donne-moi des conseils d'optimisation" },
          { label: "Conseils tarifs", query: "Aide-moi à définir mes tarifs de prestation" }
        ];
      case 'agent':
        return [
          { label: "Découvrir talents", query: "Montre-moi les nouveaux artistes prometteurs" },
          { label: "Matcher artistes/événements", query: "Analyse les correspondances entre mes artistes et les événements disponibles" },
          { label: "Tendances du marché", query: "Analyse les tendances actuelles du marché musical" }
        ];
      case 'manager':
        return [
          { label: "Gestion artistes", query: "Aide-moi à optimiser la gestion de mes artistes" },
          { label: "Opportunités business", query: "Trouve-moi de nouvelles opportunités business" },
          { label: "Analyse performances", query: "Analyse les performances de mes artistes" }
        ];
      case 'lieu':
        return [
          { label: "Trouver artistes", query: "Trouve-moi des artistes pour mon prochain événement" },
          { label: "Optimiser programmation", query: "Analyse ma programmation et donne-moi des conseils" },
          { label: "Analyser audience", query: "Aide-moi à comprendre mon audience" }
        ];
      default:
        return [
          { label: "Recherche générale", query: "Aide-moi à naviguer sur la plateforme" },
          { label: "Découvrir artistes", query: "Montre-moi les artistes populaires" },
          { label: "Explorer événements", query: "Quels sont les événements à venir ?" }
        ];
    }
  };

  const quickActions = getQuickActions();

  return (
    <Card className="p-4 mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-purple-800">Assistant Vybbi</h3>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">IA</Badge>
        </div>
        <Button asChild variant="outline" size="sm" className="border-purple-300 text-purple-700 hover:bg-purple-100">
          <Link to="/recherche-avancee" className="flex items-center gap-1">
            <Search className="h-4 w-4" />
            Recherche Avancée
          </Link>
        </Button>
      </div>
      
      <p className="text-sm text-purple-700 mb-3">
        Utilise l'intelligence artificielle pour des recherches personnalisées et des recommendations adaptées à ton profil.
      </p>
      
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            asChild
            variant="outline"
            size="sm"
            className="text-xs border-purple-200 text-purple-700 hover:bg-purple-100"
          >
            <Link 
              to={`/recherche-avancee?q=${encodeURIComponent(action.query)}`}
              className="flex items-center gap-1"
            >
              <Zap className="h-3 w-3" />
              {action.label}
            </Link>
          </Button>
        ))}
      </div>
    </Card>
  );
}