import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const AuthHookSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [setupResult, setSetupResult] = useState<{
    success: boolean;
    message: string;
    instructions?: string;
  } | null>(null);

  const setupAuthHook = async () => {
    setIsLoading(true);
    setSetupResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('setup-auth-hook', {
        body: {}
      });

      if (error) {
        throw error;
      }

      setSetupResult(data);
      
      if (data.success) {
        toast.success("Auth hook configuré avec succès !");
      } else {
        toast.error("Erreur lors de la configuration");
      }
    } catch (error: any) {
      console.error('Error setting up auth hook:', error);
      setSetupResult({
        success: false,
        message: `Erreur: ${error.message}`
      });
      toast.error("Erreur lors de la configuration du auth hook");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          Configuration Auth Hook Brevo
        </CardTitle>
        <CardDescription>
          Configure automatiquement l'envoi d'emails d'authentification via Brevo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium">Fonctionnalités :</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Emails d'inscription et confirmation</li>
            <li>• Réinitialisation de mot de passe</li>
            <li>• Changement d'adresse email</li>
            <li>• Invitations utilisateur</li>
            <li>• Envoi via Brevo SMTP (info@vybbi.app)</li>
            <li>• Branding Vybbi avec logo et couleurs</li>
          </ul>
        </div>

        {setupResult && (
          <Alert className={setupResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <AlertCircle className={`h-4 w-4 ${setupResult.success ? "text-green-600" : "text-red-600"}`} />
            <AlertDescription className={setupResult.success ? "text-green-800" : "text-red-800"}>
              {setupResult.message}
              {setupResult.instructions && (
                <div className="mt-2 text-sm">
                  {setupResult.instructions}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={setupAuthHook} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Configuration en cours...
            </>
          ) : (
            "Configurer Auth Hook Brevo"
          )}
        </Button>

        <div className="text-xs text-muted-foreground">
          <p><strong>Note :</strong> Cette opération configure automatiquement :</p>
          <ul className="mt-1 space-y-1">
            <li>• Le webhook auth vers la fonction auth-email-sender</li>
            <li>• La désactivation des templates email natifs</li>
            <li>• L'activation du système d'emails personnalisé</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};