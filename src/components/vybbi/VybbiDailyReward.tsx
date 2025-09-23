import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, Clock, Sparkles } from 'lucide-react';
import { useVybbiTokens } from '@/hooks/useVybbiTokens';
import { useAuth } from '@/hooks/useAuth';

interface VybbiDailyRewardProps {
  variant?: 'card' | 'compact' | 'button';
  className?: string;
}

export const VybbiDailyReward: React.FC<VybbiDailyRewardProps> = ({ 
  variant = 'compact',
  className = ''
}) => {
  const { user } = useAuth();
  const { claimDailyTokens, transactions } = useVybbiTokens();
  const [canClaim, setCanClaim] = useState(false);
  const [lastClaimDate, setLastClaimDate] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !transactions) return;

    // Check if user has claimed daily tokens today
    const today = new Date().toDateString();
    const lastDailyLogin = transactions
      .filter(t => t.reason === 'daily_login' && t.transaction_type === 'earned')
      .sort((a, b) => new Date(b.processed_at).getTime() - new Date(a.processed_at).getTime())[0];

    if (lastDailyLogin) {
      const lastClaimDateStr = new Date(lastDailyLogin.processed_at).toDateString();
      setLastClaimDate(lastClaimDateStr);
      setCanClaim(lastClaimDateStr !== today);
    } else {
      setCanClaim(true);
    }
  }, [user, transactions]);

  const handleClaim = () => {
    claimDailyTokens.mutate();
  };

  if (!user) return null;

  if (variant === 'button') {
    return (
      <Button
        onClick={handleClaim}
        disabled={!canClaim || claimDailyTokens.isPending}
        variant={canClaim ? "default" : "outline"}
        size="sm"
        className={`gap-2 ${className}`}
      >
        <Gift className="h-4 w-4" />
        {canClaim ? 'Réclamer +10 VYBBI' : 'Déjà réclamé'}
      </Button>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary-glow/10 border ${className}`}>
        <div className="p-2 rounded-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">
          <Gift className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">
            {canClaim ? 'Récompense quotidienne disponible !' : 'Récompense quotidienne réclamée'}
          </p>
          <p className="text-xs text-muted-foreground">
            {canClaim ? '+10 VYBBI pour votre connexion' : 'Revenez demain pour +10 VYBBI'}
          </p>
        </div>
        {canClaim && (
          <Button
            onClick={handleClaim}
            disabled={claimDailyTokens.isPending}
            size="sm"
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Réclamer
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 rounded-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">Récompense Quotidienne</h3>
            <p className="text-sm text-muted-foreground">
              Connectez-vous chaque jour pour gagner des VYBBI
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Aujourd'hui</span>
            </div>
            <Badge variant={canClaim ? "default" : "secondary"}>
              {canClaim ? '+10 VYBBI' : 'Réclamé'}
            </Badge>
          </div>

          {canClaim ? (
            <Button
              onClick={handleClaim}
              disabled={claimDailyTokens.isPending}
              className="w-full gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {claimDailyTokens.isPending ? 'Attribution...' : 'Réclamer ma récompense'}
            </Button>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">
                Vous avez déjà réclamé votre récompense aujourd'hui !
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Revenez demain pour +10 VYBBI supplémentaires
              </p>
            </div>
          )}

          {lastClaimDate && (
            <p className="text-xs text-center text-muted-foreground">
              Dernière récompense : {lastClaimDate}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};