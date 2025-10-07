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
    <Card className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] max-w-md w-[calc(100%-2rem)] border-primary/20 bg-card/95 backdrop-blur-sm shadow-lg animate-in slide-in-from-top-5 fade-in duration-300">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {isMobile ? (
            <Smartphone className="h-4 w-4 text-primary flex-shrink-0" />
          ) : (
            <Monitor className="h-4 w-4 text-primary flex-shrink-0" />
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-xs mb-1">
              Installer Vybbi
            </h3>
            <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
              {isMobile 
                ? "Accès rapide depuis votre écran d'accueil"
                : "Profitez d'une expérience optimisée"
              }
            </p>
            
            <div className="flex gap-2 items-center">
              <Button
                size="sm"
                onClick={handleInstall}
                className="h-7 text-xs px-3"
              >
                <Download className="h-3 w-3 mr-1" />
                Installer
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="h-7 w-7 p-0"
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