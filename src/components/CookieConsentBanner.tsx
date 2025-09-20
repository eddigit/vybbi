import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Cookie, Settings, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has already made a choice
    const saved = localStorage.getItem('vybbi_cookie_preferences');
    if (!saved) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      preferences: true,
      marketing: true
    };
    localStorage.setItem('vybbi_cookie_preferences', JSON.stringify(allAccepted));
    window.dispatchEvent(new CustomEvent('vybbi:cookie-preferences-updated', { 
      detail: { preferences: allAccepted } 
    }));
    setIsVisible(false);
    toast({
      title: "Cookies acceptés",
      description: "Merci ! Vos préférences ont été enregistrées."
    });
  };

  const handleRejectAll = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      preferences: false,
      marketing: false
    };
    localStorage.setItem('vybbi_cookie_preferences', JSON.stringify(essentialOnly));
    window.dispatchEvent(new CustomEvent('vybbi:cookie-preferences-updated', { 
      detail: { preferences: essentialOnly } 
    }));
    setIsVisible(false);
    toast({
      title: "Préférences enregistrées",
      description: "Seuls les cookies essentiels seront utilisés."
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 bg-background/95 backdrop-blur-sm border-t border-border">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Cookie className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Gestion des cookies</h3>
                <p className="text-sm text-muted-foreground">
                  Nous utilisons des cookies pour améliorer votre expérience et analyser l'usage du site.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Button
                onClick={handleAcceptAll}
                className="bg-primary hover:bg-primary/90"
              >
                Tout accepter
              </Button>
              <Button
                onClick={handleRejectAll}
                variant="outline"
              >
                Refuser tout
              </Button>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Link to="/cookies">
                  <Settings className="h-4 w-4" />
                  Personnaliser
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}