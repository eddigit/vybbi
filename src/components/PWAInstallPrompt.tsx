import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { useIsMobile } from '@/hooks/use-mobile';

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const isMobile = useIsMobile();
  const [dismissed, setDismissed] = useState(false);

  // Auto-dismiss on desktop after some time
  useEffect(() => {
    if (!isMobile && isInstallable) {
      const timer = setTimeout(() => {
        setDismissed(true);
      }, 10000); // Auto dismiss after 10 seconds on desktop

      return () => clearTimeout(timer);
    }
  }, [isMobile, isInstallable]);

  // Don't show if not installable, already installed, or dismissed
  if (!isInstallable || isInstalled || dismissed) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installApp();
    if (!success) {
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Remember dismissal for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 mobile-card border-primary/20 bg-card/95 backdrop-blur-sm shadow-lg md:left-auto md:right-4 md:max-w-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {isMobile ? (
            <Smartphone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          ) : (
            <Monitor className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">
              Installer Vybbi
            </h3>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              {isMobile 
                ? "Ajoutez Vybbi à votre écran d'accueil pour un accès rapide et une expérience optimisée."
                : "Installez Vybbi comme application pour une expérience plus fluide."
              }
            </p>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleInstall}
                className="flex-1 h-8 text-xs touch-target"
              >
                <Download className="h-3 w-3 mr-1" />
                Installer
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDismiss}
                className="h-8 px-3 touch-target"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}