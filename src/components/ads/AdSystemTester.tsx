import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";

interface SystemStatus {
  database: boolean;
  storage: boolean;
  slots: number;
  campaigns: number;
  creatives: number;
  errors: string[];
}

export function AdSystemTester() {
  const [status, setStatus] = useState<SystemStatus>({
    database: false,
    storage: false,
    slots: 0,
    campaigns: 0,
    creatives: 0,
    errors: []
  });
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  const runSystemTest = async () => {
    setTesting(true);
    const errors: string[] = [];
    let dbOk = false;
    let storageOk = false;
    let slotsCount = 0;
    let campaignsCount = 0;
    let creativesCount = 0;

    try {
      // Test database connection
      const { data: testData, error: dbError } = await supabase
        .from('ad_slots')
        .select('count')
        .limit(1);

      if (dbError) {
        errors.push(`Database error: ${dbError.message}`);
      } else {
        dbOk = true;
      }

      // Test storage bucket
      try {
        const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
        if (storageError) {
          errors.push(`Storage error: ${storageError.message}`);
        } else {
          const adBucket = buckets?.find(b => b.name === 'ad-assets');
          if (adBucket) {
            storageOk = true;
          } else {
            errors.push('Ad assets bucket not found');
          }
        }
      } catch (error: any) {
        errors.push(`Storage connection error: ${error.message}`);
      }

      // Count entities
      try {
        const [slotsRes, campaignsRes, creativesRes] = await Promise.all([
          supabase.from('ad_slots').select('id', { count: 'exact' }),
          supabase.from('ad_campaigns').select('id', { count: 'exact' }),
          supabase.from('ad_assets').select('id', { count: 'exact' })
        ]);

        slotsCount = slotsRes.count || 0;
        campaignsCount = campaignsRes.count || 0;
        creativesCount = creativesRes.count || 0;

        if (slotsRes.error) errors.push(`Slots query error: ${slotsRes.error.message}`);
        if (campaignsRes.error) errors.push(`Campaigns query error: ${campaignsRes.error.message}`);
        if (creativesRes.error) errors.push(`Creatives query error: ${creativesRes.error.message}`);
      } catch (error: any) {
        errors.push(`Count queries error: ${error.message}`);
      }

    } catch (error: any) {
      errors.push(`System test error: ${error.message}`);
    }

    setStatus({
      database: dbOk,
      storage: storageOk,
      slots: slotsCount,
      campaigns: campaignsCount,
      creatives: creativesCount,
      errors
    });

    if (errors.length === 0) {
      toast({ 
        title: "Système publicitaire opérationnel",
        description: "Tous les tests sont passés avec succès"
      });
    } else {
      toast({
        title: "Problèmes détectés",
        description: `${errors.length} erreur(s) trouvée(s)`,
        variant: "destructive"
      });
    }

    setTesting(false);
  };

  useEffect(() => {
    runSystemTest();
  }, []);

  const getStatusIcon = (isOk: boolean) => {
    if (isOk) return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Test du Système Publicitaire
          </CardTitle>
          <Button 
            onClick={runSystemTest} 
            disabled={testing}
            variant="outline"
            size="sm"
          >
            {testing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Retester
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* System Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="font-medium">Base de données</span>
            {getStatusIcon(status.database)}
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="font-medium">Stockage fichiers</span>
            {getStatusIcon(status.storage)}
          </div>
        </div>

        {/* Entity Counts */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold">{status.slots}</div>
            <div className="text-sm text-muted-foreground">Emplacements</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold">{status.campaigns}</div>
            <div className="text-sm text-muted-foreground">Campagnes</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold">{status.creatives}</div>
            <div className="text-sm text-muted-foreground">Créatifs</div>
          </div>
        </div>

        {/* Overall Status */}
        <div className="flex items-center justify-center p-4 border rounded-lg">
          {status.errors.length === 0 ? (
            <>
              <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
              <span className="font-medium text-green-700">Système opérationnel</span>
            </>
          ) : (
            <>
              <XCircle className="w-6 h-6 text-red-500 mr-2" />
              <span className="font-medium text-red-700">
                {status.errors.length} problème(s) détecté(s)
              </span>
            </>
          )}
        </div>

        {/* Errors */}
        {status.errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-destructive">Erreurs détectées :</h4>
            {status.errors.map((error, index) => (
              <div key={index} className="p-2 bg-destructive/10 border border-destructive/20 rounded text-sm">
                {error}
              </div>
            ))}
          </div>
        )}

        {/* Recommendations */}
        <div className="space-y-2">
          <h4 className="font-medium">Recommandations :</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            {status.slots === 0 && (
              <div>• Créez au moins un emplacement publicitaire</div>
            )}
            {status.campaigns === 0 && (
              <div>• Créez au moins une campagne publicitaire</div>
            )}
            {status.creatives === 0 && (
              <div>• Ajoutez au moins un créatif (bannière)</div>
            )}
            {status.slots > 0 && status.campaigns > 0 && status.creatives > 0 && (
              <div className="text-green-600">✓ Configuration minimale complète</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}