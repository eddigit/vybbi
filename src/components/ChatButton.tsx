import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useRadioPlayer } from '@/hooks/useRadioPlayer';

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
  const { currentTrack } = useRadioPlayer();
  
  // Don't show on auth pages, show everywhere else when radio is active
  const isAuth = location.pathname.startsWith('/auth') || location.pathname === '/forgot-password' || location.pathname === '/reset-password';
  
  if (isAuth || !currentTrack) {
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
      className={`fixed right-4 z-[61] bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none shadow-lg transition-all duration-300 hover:scale-110 ${
        hasMobileTabBar ? 'bottom-32 md:bottom-20' : 'bottom-20'
      }`}
    >
      <MessageCircle className="h-5 w-5" />
    </Button>
  );
}