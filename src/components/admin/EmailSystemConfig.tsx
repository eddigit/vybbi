import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Settings,
  Shield
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function EmailSystemConfig() {
  const { toast } = useToast();
  const [testEmail, setTestEmail] = useState("");
  const [isTestingSending, setIsTestingSending] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<{
    success: boolean;
    message: string;
    timestamp: Date;
  } | null>(null);

  // Configuration SMTP Brevo (affichage uniquement)
  const smtpConfig = {
    provider: "Brevo (SendinBlue)",
    host: "smtp-relay.brevo.com",
    port: 587,
    fromEmail: "info@vybbi.app",
    fromName: "Vybbi",
    status: "Actif"
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une adresse email de test",
        variant: "destructive"
      });
      return;
    }

    // Validation simple de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une adresse email valide",
        variant: "destructive"
      });
      return;
    }

    setIsTestingSending(true);

    try {
      console.log("Envoi d'un email de test vers:", testEmail);

      // Appel de l'edge function send-test-email
      const testUrl = `https://fepxacqrrjvnvpgzwhyr.supabase.co/functions/v1/send-test-email?to=${encodeURIComponent(testEmail)}`;
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlcHhhY3Fycmp2bnZwZ3p3aHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDI1NTMsImV4cCI6MjA3MjkxODU1M30.JK643QTk7c6wcmGZFwl-1C4t3M2uqgC4hE74S3kliZI`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlcHhhY3Fycmp2bnZwZ3p3aHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDI1NTMsImV4cCI6MjA3MjkxODU1M30.JK643QTk7c6wcmGZFwl-1C4t3M2uqgC4hE74S3kliZI',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const resultData = await response.json();

      if (resultData?.status === "error") {
        throw new Error(resultData.error || "Erreur inconnue lors de l'envoi");
      }

      // Succès
      setLastTestResult({
        success: true,
        message: `Email de test envoyé avec succès vers ${testEmail}`,
        timestamp: new Date()
      });

      toast({
        title: "Test réussi !",
        description: `L'email de test a été envoyé vers ${testEmail}`,
      });

    } catch (error: any) {
      console.error("Erreur lors du test d'email:", error);
      
      setLastTestResult({
        success: false,
        message: error.message || "Échec de l'envoi du test email",
        timestamp: new Date()
      });

      toast({
        title: "Erreur lors du test",
        description: error.message || "Impossible d'envoyer l'email de test",
        variant: "destructive"
      });
    } finally {
      setIsTestingSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration SMTP */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration SMTP
          </CardTitle>
          <CardDescription>
            Paramètres de configuration du serveur d'envoi d'emails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Fournisseur</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50">
                  {smtpConfig.provider}
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {smtpConfig.status}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Serveur SMTP</Label>
              <p className="text-sm text-muted-foreground font-mono">
                {smtpConfig.host}:{smtpConfig.port}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Expéditeur</Label>
              <p className="text-sm text-muted-foreground">
                {smtpConfig.fromName} &lt;{smtpConfig.fromEmail}&gt;
              </p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Sécurité</Label>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">TLS/STARTTLS</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test d'envoi d'email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Test d'envoi d'email
          </CardTitle>
          <CardDescription>
            Testez la configuration en envoyant un email de test
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="test-email" className="text-sm font-medium">
                Adresse de test
              </Label>
              <Input
                id="test-email"
                type="email"
                placeholder="email@exemple.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                disabled={isTestingSending}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleTestEmail}
                disabled={isTestingSending || !testEmail}
                className="gap-2"
              >
                {isTestingSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isTestingSending ? "Envoi..." : "Tester"}
              </Button>
            </div>
          </div>

          {/* Résultat du dernier test */}
          {lastTestResult && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium">Dernier test</Label>
                <div className={`flex items-start gap-3 p-3 rounded-lg border ${
                  lastTestResult.success 
                    ? "border-green-200 bg-green-50" 
                    : "border-red-200 bg-red-50"
                }`}>
                  {lastTestResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      lastTestResult.success ? "text-green-800" : "text-red-800"
                    }`}>
                      {lastTestResult.success ? "Test réussi" : "Test échoué"}
                    </p>
                    <p className={`text-sm ${
                      lastTestResult.success ? "text-green-600" : "text-red-600"
                    }`}>
                      {lastTestResult.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {lastTestResult.timestamp.toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Statistiques d'envoi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Statistiques d'envoi
          </CardTitle>
          <CardDescription>
            Aperçu de l'activité d'envoi d'emails
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">127</div>
              <p className="text-sm text-muted-foreground">Emails envoyés aujourd'hui</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">98.5%</div>
              <p className="text-sm text-muted-foreground">Taux de livraison</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">1,834</div>
              <p className="text-sm text-muted-foreground">Total ce mois</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}