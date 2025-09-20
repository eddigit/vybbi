import React from 'react';
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
  
  // Don't show on auth pages, show everywhere else
  const isAuth = location.pathname.startsWith('/auth') || location.pathname === '/forgot-password' || location.pathname === '/reset-password';
  
  if (isAuth) {
    return null;
  }

  // Check if mobile tab bar is present
  const isArtistProfile = location.pathname.startsWith('/artist/');
  const isVenueProfile = location.pathname.startsWith('/venue/');
  const isPartnerProfile = location.pathname.startsWith('/partner/');
  const hasMobileTabBar = !isArtistProfile && !isVenueProfile && !isPartnerProfile;

  const handleChatClick = () => {
    // Open HubSpot chat widget
    if (window.HubSpotConversations) {
      window.HubSpotConversations.widget.open();
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