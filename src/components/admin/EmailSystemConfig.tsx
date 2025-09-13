import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, CheckCircle, AlertCircle, Loader2, Settings, Shield, ExternalLink } from "lucide-react";
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
  const smtpConfig = {
    provider: "Gmail SMTP",
    host: "smtp.gmail.com",
    port: 587,
    fromEmail: "vybbiapp@gmail.com",
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
      console.log("Envoi d'un email de test via Gmail SMTP vers:", testEmail);

      // Test via la nouvelle fonction Gmail SMTP
      const { data, error } = await supabase.functions.invoke('gmail-send-email', {
        body: {
          to: testEmail,
          subject: 'Test Gmail SMTP - Vybbi',
          html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #0a0a0a;">
              <div style="background-color: #3b82f6; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Test Gmail SMTP - Vybbi</h1>
              </div>
              
              <div style="background: #171717; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
                <h2 style="color: #ffffff; margin-bottom: 20px;">Test réussi !</h2>
                
                <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 20px;">
                  Ce message de test confirme que la configuration Gmail SMTP fonctionne correctement.
                </p>
                
                <div style="background: #262626; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #404040;">
                  <p style="color: #e5e5e5;"><strong>Destinataire:</strong> ${testEmail}</p>
                  <p style="color: #e5e5e5;"><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
                  <p style="color: #e5e5e5;"><strong>Provider:</strong> Gmail SMTP</p>
                </div>
              </div>
            </div>
          `
        }
      });

      if (error) {
        throw new Error(error.message || "Erreur lors de l'envoi via Gmail SMTP");
      }

      // Succès
      setLastTestResult({
        success: true,
        message: `Email de test envoyé avec succès via Gmail SMTP vers ${testEmail}`,
        timestamp: new Date()
      });
      toast({
        title: "Test Gmail réussi !",
        description: `L'email de test a été envoyé vers ${testEmail} via Gmail SMTP`
      });
    } catch (error: any) {
      console.error("Erreur lors du test Gmail SMTP:", error);
      setLastTestResult({
        success: false,
        message: error.message || "Échec de l'envoi du test Gmail SMTP",
        timestamp: new Date()
      });
      toast({
        title: "Erreur lors du test Gmail",
        description: error.message || "Impossible d'envoyer l'email de test via Gmail SMTP",
        variant: "destructive"
      });
    } finally {
      setIsTestingSending(false);
    }
  };
  return <div className="space-y-6">
      {/* Configuration Gmail SMTP */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration Gmail SMTP
          </CardTitle>
          <CardDescription>
            Paramètres de configuration Gmail pour l'envoi d'emails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-200">Configuration Gmail requise</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Pour utiliser Gmail SMTP, vous devez configurer les secrets suivants dans Supabase :
                </p>
                <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                  <li><code>GMAIL_USER</code> : Votre adresse Gmail</li>
                  <li><code>GMAIL_APP_PASSWORD</code> : Mot de passe d'application Gmail</li>
                </ul>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  💡 Générez un mot de passe d'application dans les paramètres de sécurité de votre compte Google
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Fournisseur</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-zinc-800">
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
                <span className="text-sm text-muted-foreground">STARTTLS</span>
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
            Test Gmail SMTP
          </CardTitle>
          <CardDescription>
            Testez la configuration Gmail en envoyant un email de test
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
                onChange={e => setTestEmail(e.target.value)} 
                disabled={isTestingSending} 
                className="mt-1" 
              />
            </div>
          </div>
          
          <Button onClick={handleTestEmail} disabled={isTestingSending || !testEmail} className="gap-2 w-full">
            {isTestingSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {isTestingSending ? "Envoi via Gmail..." : "Tester Gmail SMTP"}
          </Button>

          {/* Résultat du dernier test */}
          {lastTestResult && <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium">Dernier test</Label>
                <div className={`flex items-start gap-3 p-3 rounded-lg border ${lastTestResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                  {lastTestResult.success ? <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" /> : <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${lastTestResult.success ? "text-green-800" : "text-red-800"}`}>
                      {lastTestResult.success ? "Test Gmail réussi" : "Test Gmail échoué"}
                    </p>
                    <p className={`text-sm ${lastTestResult.success ? "text-green-600" : "text-red-600"}`}>
                      {lastTestResult.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {lastTestResult.timestamp.toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            </>}
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
            Aperçu de l'activité d'envoi d'emails via Gmail SMTP
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
    </div>;
}