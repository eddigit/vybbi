import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVybbiTokens } from '@/hooks/useVybbiTokens';
import { ShoppingCart, Zap, Award, Sparkles, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const VybbiSpendingOptions: React.FC = () => {
  const { user } = useAuth();
  const { balance, spendingOptions, spendTokens, isLoading } = useVybbiTokens();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Marketplace VYBBI</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getOptionIcon = (type: string) => {
    switch (type) {
      case 'subscription': return <TrendingUp className="h-5 w-5" />;
      case 'boost': return <Zap className="h-5 w-5" />;
      case 'service': return <Sparkles className="h-5 w-5" />;
      case 'feature': return <Award className="h-5 w-5" />;
      case 'upgrade': return <Award className="h-5 w-5" />;
      default: return <ShoppingCart className="h-5 w-5" />;
    }
  };

  const getOptionColor = (type: string) => {
    switch (type) {
      case 'subscription': return 'bg-gradient-to-r from-blue-500 to-blue-600';
      case 'boost': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'service': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'feature': return 'bg-gradient-to-r from-green-500 to-green-600';
      case 'upgrade': return 'bg-gradient-to-r from-indigo-500 to-purple-600';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const handlePurchase = (option: any) => {
    spendTokens.mutate({
      amount: option.vybbi_cost,
      reason: `Achat: ${option.option_name}`,
      description: option.description,
      referenceType: 'spending_option',
      referenceId: option.id,
      optionId: option.id, // Pass option ID for marketplace effects processing
    });
  };

  const canAfford = (cost: number) => balance.balance >= cost;

  if (!spendingOptions || spendingOptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Marketplace VYBBI</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucune option disponible pour le moment</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Marketplace VYBBI
          <Badge variant="secondary" className="ml-auto">
            {balance.balance.toLocaleString()} VYBBI disponibles
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {spendingOptions.map((option) => (
            <Card key={option.id} className={`relative overflow-hidden ${!canAfford(option.vybbi_cost) ? 'opacity-60' : ''}`}>
              <div className={`absolute top-0 left-0 right-0 h-1 ${getOptionColor(option.option_type)}`} />
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-full ${getOptionColor(option.option_type)} text-white`}>
                      {getOptionIcon(option.option_type)}
                    </div>
                    <div>
                      <CardTitle className="text-base leading-tight">
                        {option.option_name}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs mt-1">
                        {option.option_type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {option.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {option.description}
                  </p>
                )}

                {option.duration_days && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <Clock className="h-4 w-4" />
                    <span>{option.duration_days} jours</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">
                      {option.vybbi_cost.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">VYBBI</div>
                  </div>

                  <Button
                    onClick={() => handlePurchase(option)}
                    disabled={!canAfford(option.vybbi_cost) || spendTokens.isPending || !user}
                    variant={canAfford(option.vybbi_cost) ? "default" : "outline"}
                    size="sm"
                  >
                    {!user ? 'Connexion requise' :
                     !canAfford(option.vybbi_cost) ? 'Solde insuffisant' :
                     spendTokens.isPending ? 'Achat...' : 'Acheter'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Information sur les niveaux */}
        <div className="mt-6 p-4 rounded-lg bg-muted/50">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Award className="h-4 w-4" />
            Système de niveaux
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div className="text-center">
              <Badge className="bg-gradient-to-r from-amber-600 to-amber-800 text-white mb-1">BRONZE</Badge>
              <p className="text-xs text-muted-foreground">+5% bonus</p>
            </div>
            <div className="text-center">
              <Badge className="bg-gradient-to-r from-gray-300 to-gray-500 text-white mb-1">ARGENT</Badge>
              <p className="text-xs text-muted-foreground">+10% bonus</p>
            </div>
            <div className="text-center">
              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white mb-1">OR</Badge>
              <p className="text-xs text-muted-foreground">+15% bonus</p>
            </div>
            <div className="text-center">
              <Badge className="bg-gradient-to-r from-slate-400 to-slate-600 text-white mb-1">PLATINE</Badge>
              <p className="text-xs text-muted-foreground">+25% bonus</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};