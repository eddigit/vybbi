import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { VybbiTokenBalance } from '@/components/vybbi/VybbiTokenBalance';
import { VybbiTokenHistory } from '@/components/vybbi/VybbiTokenHistory';
import { VybbiSpendingOptions } from '@/components/vybbi/VybbiSpendingOptions';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, Coins, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function VybbiTokens() {
  const { user } = useAuth();

  if (!user) {
    return (
      <>
        <SEOHead 
          title="Jetons VYBBI - Système de récompenses"
          description="Découvrez le système de jetons VYBBI. Gagnez des récompenses et débloquez des fonctionnalités premium sur la plateforme."
        />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="p-8 rounded-lg bg-gradient-to-r from-primary/10 to-primary-glow/10 mb-6">
                <Coins className="h-16 w-16 text-primary mx-auto mb-4" />
                <h1 className="text-3xl font-bold mb-4">Jetons VYBBI</h1>
                <p className="text-muted-foreground mb-6">
                  Connectez-vous pour accéder à votre solde de jetons VYBBI et découvrir 
                  toutes les récompenses disponibles sur la plateforme.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button asChild>
                    <Link to="/auth">Se connecter</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/">Retour accueil</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title="Mes Jetons VYBBI - Système de récompenses"
        description="Gérez vos jetons VYBBI, consultez votre solde, historique des transactions et dépensez vos jetons dans la marketplace."
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* En-tête */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Coins className="h-8 w-8 text-primary" />
                Mes Jetons VYBBI
              </h1>
              <p className="text-muted-foreground">
                Système de récompenses et marketplace premium
              </p>
            </div>
          </div>

          {/* Information système */}
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Comment gagner des jetons VYBBI :</strong> Connectez-vous quotidiennement (+5), 
              complétez votre profil (+50), interagissez sur la plateforme (+1-2 par action), 
              parrainez des utilisateurs (+100) et participez aux campagnes publicitaires.
            </AlertDescription>
          </Alert>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-6">
              {/* Solde */}
              <VybbiTokenBalance variant="full" />
              
              {/* Marketplace */}
              <VybbiSpendingOptions />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Historique */}
              <VybbiTokenHistory />
            </div>
          </div>

          {/* Informations complémentaires */}
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="p-6 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                💡 Comment gagner plus de jetons ?
              </h3>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• Connexion quotidienne : +5 VYBBI</li>
                <li>• Interactions sociales : +1-2 VYBBI</li>
                <li>• Parrainage réussi : +100 VYBBI</li>
                <li>• Campagnes publicitaires : jetons automatiques</li>
              </ul>
            </div>

            <div className="p-6 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                🎯 Utilisez vos jetons pour
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Abonnements premium (500-1000 VYBBI)</li>
                <li>• Boost de visibilité (100-150 VYBBI)</li>
                <li>• Services premium (10-300 VYBBI)</li>
                <li>• Fonctionnalités avancées (200 VYBBI)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}