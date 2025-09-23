import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ContactForm from '@/components/ContactForm';
import { MessageCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const SupportChatPanel = () => {
  const [hubSpotReady, setHubSpotReady] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // On mobile, redirect directly to contact form
  useEffect(() => {
    if (isMobile) {
      setShowContactForm(true);
    }
  }, [isMobile]);

  useEffect(() => {
    // Check if HubSpot is ready
    const checkHubSpot = () => {
      if (window.HubSpotConversations) {
        setHubSpotReady(true);
      }
    };

    checkHubSpot();
    
    // Check periodically in case HubSpot loads later
    const interval = setInterval(checkHubSpot, 1000);
    
    // Clear interval after 10 seconds
    setTimeout(() => clearInterval(interval), 10000);

    return () => clearInterval(interval);
  }, []);

  const handleOpenChat = () => {
    console.log('Opening support chat');
    
    // Show HubSpot launcher
    const hubspotContainer = document.getElementById('hubspot-messages-iframe-container');
    if (hubspotContainer) {
      hubspotContainer.classList.add('hubspot-active');
      console.log('HubSpot container revealed');
    }
    
    // Try to open HubSpot widget
    if (window.HubSpotConversations) {
      try {
        window.HubSpotConversations.widget.open();
        console.log('HubSpot widget opened');
        toast({
          title: "Chat ouvert",
          description: "Le chat support est maintenant disponible.",
        });
      } catch (error) {
        console.error('Error opening HubSpot widget:', error);
        setShowContactForm(true);
        toast({
          title: "Erreur",
          description: "Impossible d'ouvrir le chat. Formulaire de contact disponible.",
          variant: "destructive",
        });
      }
    } else {
      console.warn('HubSpot not available, showing contact form');
      setShowContactForm(true);
      toast({
        title: "Chat indisponible",
        description: "Utilisez le formulaire ci-dessous pour nous contacter.",
        variant: "destructive",
      });
    }
  };

  if (showContactForm) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Formulaire de Contact
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Le chat en direct n'est pas disponible actuellement. Utilisez ce formulaire pour nous contacter.
          </p>
        </CardHeader>
        <CardContent>
          <ContactForm />
          <Button
            variant="outline"
            onClick={() => setShowContactForm(false)}
            className="mt-4"
          >
            Retour au chat
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          Support Chat
        </CardTitle>
        <p className="text-muted-foreground">
          Discutez directement avec notre équipe support pour obtenir une aide immédiate
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-4">
          <div className="p-6 rounded-lg bg-muted/50 space-y-2">
            <h3 className="font-semibold">🚀 Support en temps réel</h3>
            <p className="text-sm text-muted-foreground">
              Notre équipe vous répond généralement sous 2 minutes pendant les heures ouvrables
            </p>
          </div>
          
          <Button 
            onClick={handleOpenChat}
            size="lg"
            className="w-full max-w-xs"
            disabled={!hubSpotReady}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {hubSpotReady ? 'Ouvrir le chat' : 'Chargement...'}
          </Button>
          
          {!hubSpotReady && (
            <p className="text-xs text-muted-foreground">
              Initialisation du système de chat...
            </p>
          )}
        </div>
        
        <div className="border-t pt-4">
          <p className="text-center text-sm text-muted-foreground mb-3">
            Ou utilisez le formulaire de contact :
          </p>
          <Button
            variant="outline"
            onClick={() => setShowContactForm(true)}
            className="w-full"
          >
            Formulaire de contact
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupportChatPanel;