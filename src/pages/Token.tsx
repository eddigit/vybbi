import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Wallet, 
  Copy, 
  TrendingUp, 
  Users, 
  Music, 
  Calendar,
  Trophy,
  Heart,
  Star,
  ExternalLink,
  Info
} from 'lucide-react';
import { PhantomWalletProvider } from '@/components/wallet/PhantomWalletProvider';
import { WalletConnectionButton } from '@/components/wallet/WalletConnectionButton';
import { WalletInfo } from '@/components/wallet/WalletInfo';
import { TokenPurchaseButton } from '@/components/wallet/TokenPurchaseButton';
import { VYBBI_TOKEN } from '@/types/wallet';
import { toast } from 'sonner';
import { SEOHead } from '@/components/SEOHead';

const Token = () => {
  const [addressCopied, setAddressCopied] = useState(false);

  const copyContractAddress = () => {
    navigator.clipboard.writeText(VYBBI_TOKEN.contractAddress);
    setAddressCopied(true);
    toast.success('Adresse du contrat copiée !');
    setTimeout(() => setAddressCopied(false), 2000);
  };

  return (
    <PhantomWalletProvider>
      <SEOHead 
        title="VYBBI Token ($VYBC) - Le Pouls de Votre Écosystème"
        description="Découvrez le VYBBI, le token officiel de l'écosystème Vybbi. Plus qu'une monnaie, votre moteur de croissance dans l'industrie musicale et événementielle."
        keywords="vybbi, token, crypto, solana, musique, événements, blockchain"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-muted/30">
        {/* Disclaimer Warning */}
        <section className="py-6 px-4 bg-orange-50 dark:bg-orange-950/20 border-b border-orange-200 dark:border-orange-800">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-4">
              <Info className="w-6 h-6 text-orange-600 dark:text-orange-400 shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg text-orange-900 dark:text-orange-100 mb-2">
                  Option Crypto (Bêta testeurs uniquement)
                </h3>
                <p className="text-sm text-orange-800 dark:text-orange-200 leading-relaxed">
                  Le token VYBBI est une option expérimentale <strong>SÉPARÉE de l'abonnement professionnel</strong>. 
                  Aucune obligation d'achat. La plateforme Vybbi est 100% fonctionnelle sans token. Les investissements 
                  en cryptomonnaies comportent des risques importants de perte en capital. Ne pas investir plus que 
                  ce que vous êtes prêt à perdre. Ce token n'est pas un instrument financier réglementé.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Hero Section */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary-glow/10" />
          <div className="relative max-w-6xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <img 
                src={VYBBI_TOKEN.imageUrl} 
                alt="VYBBI Token"
                className="w-24 h-24 rounded-full border-4 border-primary/20 shadow-2xl"
              />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Le VYBBI
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-2">
              Le Pouls de Votre Écosystème
            </p>
            
            <p className="text-lg text-muted-foreground mb-8">
              Plus qu'une Monnaie, Votre Moteur de Croissance
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <WalletConnectionButton size="lg" className="min-w-[200px]" />
              <TokenPurchaseButton size="lg" className="min-w-[200px]" />
            </div>

            {/* Token Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <Card className="border-primary/20">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    Token Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Nom</p>
                    <p className="font-semibold">{VYBBI_TOKEN.name} ({VYBBI_TOKEN.symbol})</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Blockchain</p>
                    <Badge variant="secondary">Solana</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Roadmap
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-2">
                  <div>
                    <Badge variant="default" className="mb-2">Phase 1 - Actuelle</Badge>
                    <p className="text-sm">Disponible sur Pump.fun</p>
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-2">Phase 2 - Mars 2026</Badge>
                    <p className="text-sm">Lancement officiel</p>
                  </div>
                </CardContent>
              </Card>

              <WalletInfo />
            </div>
          </div>
        </section>

        {/* Contract Address Section */}
        <section className="py-8 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Adresse du Contrat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <code className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm break-all">
                    {VYBBI_TOKEN.contractAddress}
                  </code>
                  <Button 
                    onClick={copyContractAddress}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    {addressCopied ? 'Copié!' : 'Copier'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg leading-relaxed text-muted-foreground">
              Chez Vybbi, nous croyons que chaque acteur de l'industrie musicale et événementielle 
              mérite d'être récompensé pour sa passion et son travail. C'est pourquoi nous avons créé 
              le VYBBI, le token officiel qui alimente notre écosystème.
            </p>
            <Separator className="my-8" />
            <p className="text-lg leading-relaxed text-muted-foreground">
              Oubliez la complexité de la cryptomonnaie. Pensez au VYBBI comme à un système de points 
              et de crédits intelligent, parfaitement intégré à la plateforme pour transformer votre 
              activité en opportunités concrètes.
            </p>
          </div>
        </section>

        {/* Three Main Sections */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Artists, Agencies, Professionals */}
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Music className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Artistes, Agences & Professionnels</CardTitle>
                      <p className="text-sm text-muted-foreground italic">
                        "Votre talent est votre capital. Le VYBBI est l'outil pour le faire fructifier."
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Boostez Votre Visibilité
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Utilisez vos VYBBI pour propulser votre profil, vos créations ou vos événements en tête de liste
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Monétisez Votre Art
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Recevez des pourboires (tips) en VYBBI + création NFTs et contrats blockchain à venir
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Gagnez en Crédibilité
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Statuts vérifiés et développement du réseau professionnel
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Clubs, Festivals, Organizers */}
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Clubs, Festivals & Organisateurs</CardTitle>
                      <p className="text-sm text-muted-foreground italic">
                        "Votre succès dépend des talents que vous programmez et du public que vous attirez. Le VYBBI est votre allié stratégique."
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Découvrez les Talents de Demain
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Identification des artistes via leur activité VYBBI
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Fidélisez Votre Public
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Campagnes de récompenses et programmes d'ambassadeurs
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Sécurisez Vos Accords
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Contrats intelligents pour les prestations (prochainement)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Fans & Passionate */}
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Fans & Passionnés</CardTitle>
                      <p className="text-sm text-muted-foreground italic">
                        "Votre passion est le cœur du réacteur. Le VYBBI est votre façon de participer et d'être récompensé."
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Soutenez Directement les Artistes
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Tips en VYBBI en un clic
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Accédez à des Expériences Uniques
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Pass VIP, ventes privées, backstages, contenu exclusif
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Votre Engagement a de la Valeur
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Gagnez des VYBBI par votre participation
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Conclusion & CTA */}
        <section className="py-16 px-4 bg-gradient-to-r from-primary/5 to-primary-glow/5">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Le principe du VYBBI est simple
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Plus vous faites grandir l'écosystème, plus l'écosystème vous fait grandir.
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              Rejoignez Vybbi.app et prenez part à la nouvelle économie de la nuit.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary-glow">
                <a href="/">
                  Découvrir Vybbi.app
                </a>
              </Button>
              <TokenPurchaseButton size="lg" variant="outline" />
            </div>
          </div>
        </section>

        {/* Warning Section */}
        <section className="py-8 px-4 bg-muted/50">
          <div className="max-w-4xl mx-auto">
            <Card className="border-warning/20 bg-warning/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-warning mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-warning">Avertissement Important</h4>
                    <p className="text-sm text-muted-foreground">
                      Les cryptomonnaies sont des investissements risqués. La valeur des tokens peut fluctuer 
                      considérablement. Ne jamais investir plus que ce que vous pouvez vous permettre de perdre. 
                      Faites vos propres recherches avant tout investissement.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </PhantomWalletProvider>
  );
};

export default Token;