import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

// Extend Window interface for HubSpot
declare global {
  interface Window {
    HubSpotConversations?: {
      widget: {
        open: () => void;
        close: () => void;
      };
    };
  }
}

export function ChatButton() {
  const location = useLocation();
  const [hubspotAvailable, setHubspotAvailable] = useState(false);
  
  // Don't show on auth pages, show everywhere else
  const isAuth = location.pathname.startsWith('/auth') || location.pathname === '/forgot-password' || location.pathname === '/reset-password';
  
  // Check if HubSpot is available
  useEffect(() => {
    const checkHubSpot = () => {
      const hubspotContainer = document.getElementById('hubspot-messages-iframe-container');
      const hubspotWidget = document.querySelector('.hubspot-messages-iframe-container, .hs-widget-container');
      const hasHubspotAPI = window.HubSpotConversations?.widget;
      
      if (hubspotContainer || hubspotWidget || hasHubspotAPI) {
        setHubspotAvailable(true);
      }
    };
    
    // Check immediately and then periodically
    checkHubSpot();
    const interval = setInterval(checkHubSpot, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (isAuth || hubspotAvailable) {
    return null;
  }

  // Check if mobile tab bar is present
  const isArtistProfile = location.pathname.startsWith('/artist/');
  const isVenueProfile = location.pathname.startsWith('/venue/');
  const isPartnerProfile = location.pathname.startsWith('/partner/');
  const hasMobileTabBar = !isArtistProfile && !isVenueProfile && !isPartnerProfile;

  const handleChatClick = () => {
    console.log('ChatButton clicked');
    
    // Enhanced HubSpot activation
    const hubspotContainer = document.getElementById('hubspot-messages-iframe-container');
    const allHubspotContainers = document.querySelectorAll('.hubspot-messages-iframe-container, .hs-widget-container');
    
    // Activate all HubSpot containers
    if (hubspotContainer) {
      hubspotContainer.classList.add('hubspot-active');
      console.log('HubSpot container revealed');
    }
    
    allHubspotContainers.forEach(container => {
      container.classList.add('hubspot-active');
    });
    
    // Wait a bit for HubSpot to initialize if needed
    const tryOpenWidget = () => {
      if (window.HubSpotConversations?.widget) {
        try {
          window.HubSpotConversations.widget.open();
          console.log('HubSpot widget opened successfully');
          return true;
        } catch (error) {
          console.error('Error opening HubSpot widget:', error);
          return false;
        }
      }
      return false;
    };
    
    // Try immediately, then with delays if needed
    if (!tryOpenWidget()) {
      setTimeout(() => {
        if (!tryOpenWidget()) {
          setTimeout(() => {
            if (!tryOpenWidget()) {
              console.warn('HubSpot not available after retries, redirecting to contact');
              window.location.href = '/contact';
            }
          }, 1000);
        }
      }, 500);
    }
  };

  return (
    <Button 
      onClick={handleChatClick}
      size="icon"
      className={`fixed right-4 z-[70] bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none shadow-lg transition-all duration-300 hover:scale-110 ${
        hasMobileTabBar ? 'bottom-36 md:bottom-24' : 'bottom-24'
      }`}
    >
      <MessageCircle className="h-5 w-5" />
    </Button>
  );
}