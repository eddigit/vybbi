import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Cookie, Shield, BarChart } from 'lucide-react';

type ConsentChoice = 'all' | 'analytics' | 'none' | null;

interface CookiePreferences {
  analytics: boolean;
  marketing: boolean;
  functionality: boolean;
}

const STORAGE_KEY = 'vybbi_cookie_preferences';

export const CookieConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const savedPreferences = localStorage.getItem(STORAGE_KEY);
    
    if (!savedPreferences) {
      // Show banner after a short delay for better UX
      setTimeout(() => setIsVisible(true), 1000);
    } else {
      // Apply saved preferences
      try {
        const preferences: CookiePreferences = JSON.parse(savedPreferences);
        applyConsent(preferences);
      } catch (error) {
        console.error('[Cookie Consent] Error parsing saved preferences:', error);
      }
    }
  }, []);

  const applyConsent = (preferences: CookiePreferences) => {
    // Apply to Google Analytics
    if (typeof window.acceptAll === 'function') {
      if (preferences.analytics && preferences.marketing) {
        window.acceptAll();
      } else if (preferences.analytics) {
        window.acceptAnalyticsOnly();
      } else {
        window.refuseAll();
      }
    }

    // Apply to HubSpot (sync with existing system)
    if (window._hsq) {
      window._hsq.push(['doNotTrack', !(preferences.analytics || preferences.marketing)]);
    }
  };

  const handleChoice = (choice: ConsentChoice) => {
    let preferences: CookiePreferences;

    switch (choice) {
      case 'all':
        preferences = {
          analytics: true,
          marketing: true,
          functionality: true
        };
        break;
      case 'analytics':
        preferences = {
          analytics: true,
          marketing: false,
          functionality: true
        };
        break;
      case 'none':
      default:
        preferences = {
          analytics: false,
          marketing: false,
          functionality: false
        };
        break;
    }

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));

    // Apply consent
    applyConsent(preferences);

    // Hide banner
    setIsVisible(false);

    console.log('[Cookie Consent] User choice:', choice, preferences);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-end justify-center pointer-events-none">
      <div className="pointer-events-auto w-full max-w-7xl mx-4 mb-4">
        <Card className="border-primary/30 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-foreground shadow-2xl">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Cookie className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Gestion des cookies</h3>
                  <p className="text-sm text-muted-foreground">
                    Nous respectons votre vie privée
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleChoice('none')}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Nous utilisons des cookies pour mesurer l'audience, améliorer votre expérience et personnaliser le contenu. 
                Vous pouvez choisir d'accepter tous les cookies, uniquement les cookies analytiques, ou refuser.
              </p>

              {/* Expanded details */}
              {isExpanded && (
                <div className="space-y-3 p-4 bg-background/50 rounded-lg border border-border">
                  <div className="flex items-start gap-3">
                    <BarChart className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm mb-1">Cookies analytiques</h4>
                      <p className="text-xs text-muted-foreground">
                        Google Analytics pour mesurer l'audience et améliorer le site
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm mb-1">Cookies de sécurité</h4>
                      <p className="text-xs text-muted-foreground">
                        Essentiels pour le fonctionnement et la sécurité du site (toujours actifs)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => handleChoice('all')}
                  className="flex-1 min-w-[140px]"
                  variant="default"
                >
                  Accepter tout
                </Button>
                <Button
                  onClick={() => handleChoice('analytics')}
                  className="flex-1 min-w-[140px]"
                  variant="secondary"
                >
                  Analytics uniquement
                </Button>
                <Button
                  onClick={() => handleChoice('none')}
                  className="flex-1 min-w-[140px]"
                  variant="outline"
                >
                  Refuser tout
                </Button>
                <Button
                  onClick={() => setIsExpanded(!isExpanded)}
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                >
                  {isExpanded ? 'Moins de détails' : 'Plus de détails'}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                En continuant, vous acceptez notre{' '}
                <a href="/confidentialite" className="text-primary hover:underline">
                  politique de confidentialité
                </a>
                {' '}et notre{' '}
                <a href="/cookies" className="text-primary hover:underline">
                  politique de cookies
                </a>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Extend Window interface for HubSpot
declare global {
  interface Window {
    _hsq?: any[];
  }
}