import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Network, FileCheck, BarChart3, ArrowRight, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SEOHead } from "@/components/SEOHead";

export default function TrouverAgent() {
  const [agentCount, setAgentCount] = useState(0);
  const [previewAgents, setPreviewAgents] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('profile_type', ['agent', 'manager'])
        .eq('is_public', true);
      setAgentCount(count || 0);

      const { data } = await supabase
        .from('profiles')
        .select('display_name, avatar_url, location, profile_type')
        .in('profile_type', ['agent', 'manager'])
        .eq('is_public', true)
        .limit(3);
      setPreviewAgents(data || []);
    };
    fetchData();
  }, []);

  return (
    <>
      <SEOHead
        title="Trouver un agent ou manager - Vybbi"
        description={`Découvrez ${agentCount}+ agents et managers vérifiés. Développez votre carrière avec des professionnels de l'industrie musicale.`}
        canonicalUrl="/trouver-agent"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-purple-500/5">
        <div className="container mx-auto px-4 py-16 text-center">
          <Badge className="mb-4 bg-purple-500/20 text-purple-700 border-purple-500/30">
            GRATUIT - Sans engagement
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Trouvez l'agent ou manager idéal
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Plus de <span className="font-bold text-purple-600">{agentCount}+ professionnels vérifiés</span> prêts à booster votre carrière
          </p>

          {/* Preview Cards (Blurred) */}
          <div className="relative max-w-5xl mx-auto mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {previewAgents.map((agent, i) => (
                <Card key={i} className="blur-sm opacity-70">
                  <CardContent className="p-6">
                    <Avatar className="h-20 w-20 mx-auto mb-4 blur-md">
                      <AvatarImage src={agent.avatar_url} />
                      <AvatarFallback>{agent.profile_type === 'agent' ? 'AG' : 'MG'}</AvatarFallback>
                    </Avatar>
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded w-2/3 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Overlay CTA */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-background/95 backdrop-blur-sm rounded-lg p-8 shadow-2xl border-2 border-purple-500/50 animate-pulse">
                <p className="text-lg font-semibold mb-4">
                  Créez votre compte pour accéder aux profils complets
                </p>
                <Button asChild size="lg" className="gap-2 bg-purple-600 hover:bg-purple-700">
                  <Link to="/auth">
                    Inscription gratuite
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="p-6 text-center">
                <Network className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Réseau professionnel</h3>
                <p className="text-sm text-muted-foreground">
                  Accédez à un réseau étendu de contacts
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="p-6 text-center">
                <FileCheck className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Contrats sécurisés</h3>
                <p className="text-sm text-muted-foreground">
                  Gestion professionnelle de vos contrats
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Commission transparente</h3>
                <p className="text-sm text-muted-foreground">
                  Tarifs clairs et négociables
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Professionnels vérifiés</h3>
                <p className="text-sm text-muted-foreground">
                  Tous les profils sont validés
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Final CTA */}
          <div className="bg-purple-500/10 rounded-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">
              Prêt à développer votre carrière ?
            </h2>
            <p className="text-muted-foreground mb-6">
              L'inscription prend moins de 30 secondes
            </p>
            <Button asChild size="lg" className="mb-4 bg-purple-600 hover:bg-purple-700">
              <Link to="/auth">
                Créer mon compte gratuit
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              Déjà membre ?{" "}
              <Link to="/auth?tab=signin" className="text-purple-600 hover:underline font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
