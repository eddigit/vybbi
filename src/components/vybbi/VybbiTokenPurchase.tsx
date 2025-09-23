import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, Crown, Zap, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface TokenPack {
  id: string;
  name: string;
  tokens: number;
  price: number;
  originalPrice?: number;
  bonus?: number;
  icon: React.ReactNode;
  popular?: boolean;
  description: string;
  features: string[];
}

const TOKEN_PACKS: TokenPack[] = [
  {
    id: 'starter',
    name: 'Pack Starter',
    tokens: 100,
    price: 10,
    icon: <Zap className="h-6 w-6" />,
    description: 'Parfait pour découvrir VYBBI',
    features: ['100 jetons VYBBI', 'Accès aux fonctionnalités de base', 'Support communautaire']
  },
  {
    id: 'standard',
    name: 'Pack Standard',
    tokens: 500,
    price: 45,
    originalPrice: 50,
    bonus: 10,
    icon: <Gift className="h-6 w-6" />,
    popular: true,
    description: 'Le meilleur rapport qualité-prix',
    features: ['500 jetons VYBBI', '10% de bonus inclus', 'Accès prioritaire', 'Support email']
  },
  {
    id: 'premium',
    name: 'Pack Premium',
    tokens: 1000,
    price: 80,
    originalPrice: 100,
    bonus: 20,
    icon: <Star className="h-6 w-6" />,
    description: 'Pour les utilisateurs avancés',
    features: ['1000 jetons VYBBI', '20% de bonus inclus', 'Fonctionnalités premium', 'Support prioritaire']
  },
  {
    id: 'vip',
    name: 'Pack VIP',
    tokens: 5000,
    price: 350,
    originalPrice: 500,
    bonus: 30,
    icon: <Crown className="h-6 w-6" />,
    description: 'La solution complète pour les pros',
    features: ['5000 jetons VYBBI', '30% de bonus inclus', 'Toutes les fonctionnalités', 'Support dédié 24/7']
  }
];

export function VybbiTokenPurchase() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (packId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour acheter des jetons');
      return;
    }

    setLoading(packId);

    try {
      const { data, error } = await supabase.functions.invoke('create-token-payment', {
        body: { packType: packId }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe Checkout in a new tab
        window.open(data.url, '_blank', 'noopener,noreferrer');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error('Erreur lors de la création du paiement');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {TOKEN_PACKS.map((pack) => (
        <Card 
          key={pack.id} 
          className={`relative transition-all duration-200 hover:shadow-lg ${
            pack.popular 
              ? 'border-primary shadow-primary/20 shadow-lg' 
              : 'hover:border-primary/50'
          }`}
        >
          {pack.popular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-3 py-1">
                Le plus populaire
              </Badge>
            </div>
          )}
          
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-3 p-3 rounded-full bg-primary/10 text-primary w-fit">
              {pack.icon}
            </div>
            <CardTitle className="text-xl">{pack.name}</CardTitle>
            <CardDescription className="text-sm">
              {pack.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-3xl font-bold text-primary">
                  {pack.tokens}
                </span>
                <span className="text-muted-foreground">jetons</span>
              </div>
              
              {pack.bonus && (
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    +{pack.bonus}% bonus
                  </Badge>
                </div>
              )}
              
              <div className="flex items-center justify-center gap-2">
                {pack.originalPrice && (
                  <span className="text-muted-foreground line-through text-sm">
                    {pack.originalPrice}€
                  </span>
                )}
                <span className="text-2xl font-bold">
                  {pack.price}€
                </span>
              </div>
              
              <div className="text-xs text-muted-foreground mt-1">
                {(pack.price / pack.tokens).toFixed(3)}€ par jeton
              </div>
            </div>

            <ul className="space-y-2 text-sm">
              {pack.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handlePurchase(pack.id)}
              disabled={loading === pack.id || !user}
              className="w-full"
              variant={pack.popular ? "default" : "outline"}
            >
              {loading === pack.id ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Traitement...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Acheter maintenant
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}