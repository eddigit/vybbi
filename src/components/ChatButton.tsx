import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useRadioPlayer } from '@/hooks/useRadioPlayer';

export function ChatButton() {
  const location = useLocation();
  const { currentTrack } = useRadioPlayer();
  
  // Don't show on landing/auth pages or if no radio is active
  const isLanding = location.pathname === '/';
  const isAuth = location.pathname.startsWith('/auth') || location.pathname === '/forgot-password' || location.pathname === '/reset-password';
  
  if (isLanding || isAuth || !currentTrack) {
    return null;
  }

  // Check if mobile tab bar is present
  const isArtistProfile = location.pathname.startsWith('/artist/');
  const isVenueProfile = location.pathname.startsWith('/venue/');
  const isPartnerProfile = location.pathname.startsWith('/partner/');
  const hasMobileTabBar = !isArtistProfile && !isVenueProfile && !isPartnerProfile;

  return (
    <Button 
      asChild 
      size="icon"
      className={`fixed right-4 z-[61] bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none shadow-lg transition-all duration-300 hover:scale-110 ${
        hasMobileTabBar ? 'bottom-32 md:bottom-20' : 'bottom-20'
      }`}
    >
      <Link to="/chat" className="flex items-center justify-center">
        <MessageCircle className="h-5 w-5" />
      </Link>
    </Button>
  );
}