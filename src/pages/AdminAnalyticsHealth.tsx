import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ExternalLink, 
  RefreshCw,
  Activity,
  Shield,
  BarChart,
  Code,
  Cookie
} from 'lucide-react';

interface ConsentState {
  ad_storage: string;
  analytics_storage: string;
  functionality_storage: string;
  security_storage: string;
}

export default function AdminAnalyticsHealth() {
  const [gtagLoaded, setGtagLoaded] = useState(false);
  const [consentState, setConsentState] = useState<ConsentState | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const checkGtagStatus = () => {
    setGtagLoaded(typeof window.gtag === 'function');
    
    // Try to get consent state
    if (typeof window.gtag === 'function') {
      try {
        window.gtag('get', 'G-K1LQ1MVX3R', 'consent', (consent: ConsentState) => {
          setConsentState(consent);
        });
      } catch (error) {
        console.error('[Analytics Health] Error getting consent state:', error);
      }
    }
    
    setLastRefresh(new Date());
  };

  useEffect(() => {
    checkGtagStatus();
  }, []);

  const testConsent = (type: 'all' | 'analytics' | 'none') => {
    switch (type) {
      case 'all':
        window.acceptAll();
        break;
      case 'analytics':
        window.acceptAnalyticsOnly();
        break;
      case 'none':
        window.refuseAll();
        break;
    }
    
    setTimeout(checkGtagStatus, 500);
  };

  const clearCookieConsent = () => {
    localStorage.removeItem('vybbi_cookie_preferences');
    window.location.reload();
  };

  const getConsentBadge = (state: string) => {
    if (state === 'granted') {
      return <Badge variant="default" className="bg-green-500">Accordé</Badge>;
    }
    return <Badge variant="secondary">Refusé</Badge>;
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Google Analytics Health Check</h1>
            <p className="text-muted-foreground">
              Diagnostic et test de l'implémentation GA4 + Consent Mode v2
            </p>
          </div>
          <Button onClick={checkGtagStatus} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Dernière mise à jour: {lastRefresh.toLocaleTimeString()}
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* GA4 Script Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {gtagLoaded ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Script Google Analytics
            </CardTitle>
            <CardDescription>
              Vérification de la présence de gtag.js
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Measurement ID:</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">G-K1LQ1MVX3R</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">État:</span>
                {gtagLoaded ? (
                  <Badge variant="default" className="bg-green-500">Chargé</Badge>
                ) : (
                  <Badge variant="destructive">Non chargé</Badge>
                )}
              </div>
              {gtagLoaded && (
                <Alert className="mt-3">
                  <Activity className="h-4 w-4" />
                  <AlertDescription>
                    gtag.js est correctement chargé et opérationnel
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Consent Mode Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Google Consent Mode v2
            </CardTitle>
            <CardDescription>
              État actuel des consentements
            </CardDescription>
          </CardHeader>
          <CardContent>
            {consentState ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Analytics Storage:</span>
                  {getConsentBadge(consentState.analytics_storage)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ad Storage:</span>
                  {getConsentBadge(consentState.ad_storage)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Functionality:</span>
                  {getConsentBadge(consentState.functionality_storage)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Security:</span>
                  {getConsentBadge(consentState.security_storage)}
                </div>
              </div>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Impossible de récupérer l'état du consentement
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Test Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Actions de test
          </CardTitle>
          <CardDescription>
            Tester les différentes configurations de consentement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Button 
              onClick={() => testConsent('all')}
              className="w-full"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Accepter tout
            </Button>
            <Button 
              onClick={() => testConsent('analytics')}
              variant="secondary"
              className="w-full"
            >
              <BarChart className="h-4 w-4 mr-2" />
              Analytics uniquement
            </Button>
            <Button 
              onClick={() => testConsent('none')}
              variant="outline"
              className="w-full"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Refuser tout
            </Button>
          </div>

          <Alert>
            <Cookie className="h-4 w-4" />
            <AlertDescription>
              Les choix sont stockés dans localStorage. 
              <Button 
                onClick={clearCookieConsent}
                variant="link" 
                className="ml-2 h-auto p-0 text-primary"
              >
                Réinitialiser les préférences
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Links & Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Ressources & Monitoring
          </CardTitle>
          <CardDescription>
            Liens utiles pour surveiller et déboguer GA4
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <a 
            href="https://analytics.google.com/analytics/web/#/p464099935/realtime/overview"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">GA4 Realtime</p>
                <p className="text-xs text-muted-foreground">Voir les événements en temps réel</p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </a>

          <a 
            href="https://analytics.google.com/analytics/web/#/p464099935/reports/intelligenthome"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <BarChart className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">GA4 Reports</p>
                <p className="text-xs text-muted-foreground">Rapports et analyses</p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </a>

          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-2">DebugView</p>
            <p className="text-xs text-muted-foreground mb-2">
              Pour activer le mode debug, ajoutez ce paramètre à l'URL:
            </p>
            <code className="text-xs bg-background px-2 py-1 rounded block">
              ?debug_mode=true
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes d'implémentation</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none dark:prose-invert">
          <h4>Architecture</h4>
          <ul className="text-sm space-y-1">
            <li><code>index.html</code>: Consent Mode v2 + gtag.js configuration</li>
            <li><code>useGAPageTracking</code>: Hook React Router pour tracking SPA</li>
            <li><code>CookieConsentBanner</code>: Bandeau RGPD avec persistance</li>
          </ul>

          <h4 className="mt-4">Conformité RGPD</h4>
          <ul className="text-sm space-y-1">
            <li>Mode "denied" par défaut pour les régions EEE</li>
            <li>Consentement explicite requis avant tracking</li>
            <li>Révocation possible à tout moment</li>
          </ul>

          <h4 className="mt-4">Fonctionnalités</h4>
          <ul className="text-sm space-y-1">
            <li>✅ Tracking automatique des page_view en SPA</li>
            <li>✅ Synchronisation avec système de cookies HubSpot</li>
            <li>✅ 3 niveaux de consentement: tout / analytics / rien</li>
            <li>✅ Persistance localStorage multi-visites</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
