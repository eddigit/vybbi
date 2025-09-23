import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, Award, Zap } from 'lucide-react';
import { useVybbiTokens } from '@/hooks/useVybbiTokens';
import { Link } from 'react-router-dom';

interface VybbiTokenBalanceProps {
  variant?: 'full' | 'compact' | 'widget';
  className?: string;
}

export const VybbiTokenBalance: React.FC<VybbiTokenBalanceProps> = ({ 
  variant = 'full',
  className = '' 
}) => {
  const { balance, isLoading } = useVybbiTokens();

  if (isLoading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardContent className="p-4">
          <div className="h-8 bg-muted rounded w-24"></div>
        </CardContent>
      </Card>
    );
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'platine': return 'bg-gradient-to-r from-slate-400 to-slate-600';
      case 'or': return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 'argent': return 'bg-gradient-to-r from-gray-300 to-gray-500';
      default: return 'bg-gradient-to-r from-amber-600 to-amber-800';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'platine': return <Award className="h-4 w-4" />;
      case 'or': return <Award className="h-4 w-4" />;
      case 'argent': return <TrendingUp className="h-4 w-4" />;
      default: return <Coins className="h-4 w-4" />;
    }
  };

  if (variant === 'widget') {
    return (
      <Link to="/vybbi-tokens" className={`block ${className}`}>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-primary/10 to-primary-glow/10 hover:from-primary/20 hover:to-primary-glow/20 transition-all">
          <Coins className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">
            {balance.balance.toLocaleString()} VYBBI
          </span>
          <Badge variant="secondary" className={`text-xs ${getLevelColor(balance.level)} text-white`}>
            {balance.level.toUpperCase()}
          </Badge>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-gradient-to-r from-primary to-primary-glow">
                <Coins className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Solde VYBBI</p>
                <p className="text-xl font-bold">{balance.balance.toLocaleString()}</p>
              </div>
            </div>
            <Badge className={`${getLevelColor(balance.level)} text-white`}>
              {getLevelIcon(balance.level)}
              {balance.level.toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-gradient-to-r from-primary to-primary-glow">
            <Coins className="h-5 w-5 text-white" />
          </div>
          Mes Jetons VYBBI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance principale */}
        <div className="text-center py-4">
          <div className="text-3xl font-bold text-primary mb-2">
            {balance.balance.toLocaleString()}
          </div>
          <p className="text-muted-foreground">Jetons VYBBI disponibles</p>
        </div>

        {/* Niveau et multiplicateur */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <Badge className={`${getLevelColor(balance.level)} text-white`}>
              {getLevelIcon(balance.level)}
              {balance.level.toUpperCase()}
            </Badge>
            <span className="text-sm text-muted-foreground">Niveau</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-semibold">x{balance.multiplier}</span>
            <span className="text-muted-foreground">bonus</span>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-card/30 border border-green-500/20">
            <div className="text-lg font-semibold text-green-400">
              +{balance.total_earned.toLocaleString()}
            </div>
            <div className="text-xs text-green-400/70">
              Total gagné
            </div>
          </div>
          <div className="text-center p-3 rounded-lg bg-card/30 border border-blue-500/20">
            <div className="text-lg font-semibold text-blue-400">
              -{balance.total_spent.toLocaleString()}
            </div>
            <div className="text-xs text-blue-400/70">
              Total dépensé
            </div>
          </div>
        </div>

        {/* Progression vers le niveau suivant */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progression niveau</span>
            <span className="text-muted-foreground">
              {balance.level === 'platine' ? 'MAX' : 'Vers niveau supérieur'}
            </span>
          </div>
          {balance.level !== 'platine' && (
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (balance.total_earned / (
                    balance.level === 'bronze' ? 1000 : 
                    balance.level === 'argent' ? 5000 : 20000
                  )) * 100)}%`
                }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};