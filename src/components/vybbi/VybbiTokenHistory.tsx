import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowUpCircle, ArrowDownCircle, Gift, Award, Clock } from 'lucide-react';
import { useVybbiTokens } from '@/hooks/useVybbiTokens';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const VybbiTokenHistory: React.FC = () => {
  const { transactions, isLoading } = useVybbiTokens();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique des transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned': return <ArrowUpCircle className="h-5 w-5 text-green-500" />;
      case 'spent': return <ArrowDownCircle className="h-5 w-5 text-red-500" />;
      case 'bonus': return <Gift className="h-5 w-5 text-primary" />;
      case 'penalty': return <ArrowDownCircle className="h-5 w-5 text-orange-500" />;
      default: return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earned': return 'text-green-600 dark:text-green-400';
      case 'spent': return 'text-red-600 dark:text-red-400';
      case 'bonus': return 'text-primary';
      case 'penalty': return 'text-orange-600 dark:text-orange-400';
      default: return 'text-muted-foreground';
    }
  };

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case 'earned': return <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">Gagné</Badge>;
      case 'spent': return <Badge variant="secondary" className="bg-red-500/10 text-red-400 border-red-500/20">Dépensé</Badge>;
      case 'bonus': return <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">Bonus</Badge>;
      case 'penalty': return <Badge variant="secondary" className="bg-orange-500/10 text-orange-400 border-orange-500/20">Pénalité</Badge>;
      default: return <Badge variant="outline">Autre</Badge>;
    }
  };

  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique des transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucune transaction pour le moment</p>
            <p className="text-sm text-muted-foreground mt-2">
              Vos gains et dépenses VYBBI apparaîtront ici
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Historique des transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <div 
                key={transaction.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {/* Icône */}
                <div className="flex-shrink-0">
                  {getTransactionIcon(transaction.transaction_type)}
                </div>

                {/* Détails */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">
                      {transaction.reason}
                    </h4>
                    {getTransactionBadge(transaction.transaction_type)}
                  </div>
                  
                  {transaction.description && (
                    <p className="text-sm text-muted-foreground truncate">
                      {transaction.description}
                    </p>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(transaction.processed_at), {
                      addSuffix: true,
                      locale: fr
                    })}
                  </p>
                </div>

                {/* Montant */}
                <div className="flex-shrink-0 text-right">
                  <div className={`font-semibold ${getTransactionColor(transaction.transaction_type)}`}>
                    {transaction.transaction_type === 'earned' || transaction.transaction_type === 'bonus' ? '+' : '-'}
                    {transaction.amount.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">VYBBI</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};