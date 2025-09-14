import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react";

interface EmailTest {
  id: string;
  name: string;
  description: string;
  endpoint: string;
}

export default function AdminEmailDiagnostics() {
  const [testEmail, setTestEmail] = useState("");
  const [testResults, setTestResults] = useState<Record<string, { status: 'pending' | 'success' | 'error'; message: string; timestamp?: string }>>({});
  const [isRunningTests, setIsRunningTests] = useState(false);

  const emailTests: EmailTest[] = [
    {
      id: 'brevo-direct',
      name: 'Test Direct Brevo',
      description: 'Teste l\'envoi direct via l\'API Brevo',
      endpoint: 'send-test-email'
    },
    {
      id: 'gmail-direct',
      name: 'Test Direct Gmail',
      description: 'Teste l\'envoi direct via Gmail SMTP',
      endpoint: 'gmail-send-email'
    },
    {
      id: 'auth-resend',
      name: 'Test Resend Auth',
      description: 'Teste le renvoi d\'email de confirmation',
      endpoint: 'auth'
    }
  ];

  const runSingleTest = async (test: EmailTest) => {
    if (!testEmail) {
      toast.error("Entrez une adresse email de test");
      return;
    }

    setTestResults(prev => ({
      ...prev,
      [test.id]: { status: 'pending', message: 'Test en cours...' }
    }));

    try {
      let result;
      const timestamp = new Date().toISOString();

      switch (test.id) {
        case 'brevo-direct':
          const brevoResponse = await fetch(`https://fepxacqrrjvnvpgzwhyr.supabase.co/functions/v1/send-test-email?to=${encodeURIComponent(testEmail)}`);
          result = {
            status: brevoResponse.ok ? 'success' : 'error' as const,
            message: brevoResponse.ok 
              ? `✅ Email Brevo envoyé (${brevoResponse.status})`
              : `❌ Erreur Brevo: ${brevoResponse.status} - ${await brevoResponse.text()}`,
            timestamp
          };
          break;

        case 'gmail-direct':
          const gmailResult = await supabase.functions.invoke('gmail-send-email', {
            body: {
              to: testEmail,
              subject: 'Test Gmail Direct - Vybbi Admin',
              html: '<h2>Test Gmail</h2><p>Ceci est un test de l\'envoi Gmail direct depuis les diagnostics admin.</p>'
            }
          });
          result = {
            status: gmailResult.error ? 'error' : 'success' as const,
            message: gmailResult.error 
              ? `❌ Erreur Gmail: ${gmailResult.error.message}`
              : `✅ Email Gmail envoyé`,
            timestamp
          };
          break;

        case 'auth-resend':
          const { error: authError } = await supabase.auth.resend({
            type: 'signup',
            email: testEmail,
            options: { emailRedirectTo: `${window.location.origin}/auth` }
          });
          result = {
            status: authError ? 'error' : 'success' as const,
            message: authError 
              ? `❌ Erreur Auth Resend: ${authError.message}`
              : `✅ Email de confirmation renvoyé`,
            timestamp
          };
          break;

        default:
          result = {
            status: 'error' as const,
            message: 'Test non implémenté',
            timestamp
          };
      }

      setTestResults(prev => ({ ...prev, [test.id]: result }));
      
    } catch (error: any) {
      setTestResults(prev => ({
        ...prev,
        [test.id]: {
          status: 'error',
          message: `❌ Exception: ${error.message}`,
          timestamp: new Date().toISOString()
        }
      }));
    }
  };

  const runAllTests = async () => {
    if (!testEmail) {
      toast.error("Entrez une adresse email de test");
      return;
    }

    setIsRunningTests(true);
    setTestResults({});

    for (const test of emailTests) {
      await runSingleTest(test);
      // Petit délai entre les tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsRunningTests(false);
    toast.success("Tous les tests terminés");
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">En cours</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-500">Succès</Badge>;
      case 'error':
        return <Badge variant="destructive">Échec</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Mail className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Diagnostics Email</h1>
          <p className="text-muted-foreground">Tests complets du système d'envoi d'emails</p>
        </div>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Instructions:</strong> Entrez votre adresse email de test ci-dessous et lancez les diagnostics. 
          Vérifiez ensuite votre boîte email (et spam) pour confirmer la réception.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Configuration du Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              type="email"
              placeholder="email@test.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={runAllTests} 
              disabled={isRunningTests || !testEmail}
              className="min-w-[140px]"
            >
              {isRunningTests ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Tests en cours...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Lancer tous les tests
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {emailTests.map((test) => {
          const result = testResults[test.id];
          
          return (
            <Card key={test.id} className="transition-all hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {result && getStatusIcon(result.status)}
                      <h3 className="font-semibold">{test.name}</h3>
                      {result && getStatusBadge(result.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{test.description}</p>
                    {result && (
                      <div className="space-y-1">
                        <p className={`text-sm font-mono ${result.status === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                          {result.message}
                        </p>
                        {result.timestamp && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(result.timestamp).toLocaleString('fr-FR')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runSingleTest(test)}
                    disabled={!testEmail || result?.status === 'pending'}
                    className="ml-4"
                  >
                    Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm font-mono">
            <p><strong>Auth Hook URL:</strong> https://fepxacqrrjvnvpgzwhyr.supabase.co/functions/v1/auth-email-sender</p>
            <p><strong>Brevo Test URL:</strong> https://fepxacqrrjvnvpgzwhyr.supabase.co/functions/v1/send-test-email</p>
            <p><strong>Gmail Function:</strong> gmail-send-email</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}