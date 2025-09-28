import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X, User, LogOut, Trophy, Users, Radio, Coins, MapPin, Star, Search, Target, Euro, BarChart3, Hash, Calendar, Shield, BookOpen, Lock, Route, MessageCircle, Megaphone, LinkIcon, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { AutoTranslate } from '@/components/AutoTranslate';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export function MobileBurgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { user, profile, signOut, hasRole } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Track client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    await signOut();
    setIsOpen(false);
    navigate('/');
  };

  const closeMenu = () => setIsOpen(false);

  // Enhanced scroll locking for both html and body
  useEffect(() => {
    if (!isOpen) return;
    
    const html = document.documentElement;
    const body = document.body;
    
    // Store original values
    const originalHtmlOverflow = html.style.overflow;
    const originalBodyOverflow = body.style.overflow;
    
    // Lock scroll
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    
    // Handle Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    // Cleanup function
    return () => {
      html.style.overflow = originalHtmlOverflow;
      body.style.overflow = originalBodyOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Don't render on desktop, but show during SSR/hydration for mobile-first approach
  if (isClient && !isMobile) {
    return null;
  }

  // Public navigation items for non-authenticated users
  const publicItems = [
    { title: "Accueil", url: "/", icon: Home },
    { title: "Top Artistes", url: "/top-artistes", icon: Trophy },
    { title: "Nos Artistes", url: "/artists", icon: Users },
    { title: "Web TV", url: "/webtv", icon: Radio },
    { title: "Token VYBBI", url: "/token", icon: Coins },
    { title: "Nos Partenaires", url: "/partners", icon: Users },
    { title: "Nos Lieux", url: "/lieux", icon: MapPin },
    { title: "À propos", url: "/a-propos", icon: Star },
    { title: "Blog", url: "/blog", icon: Search },
  ];

  // Get supplementary navigation items for authenticated users (not in MobileTabBar)
  const getSupplementaryItems = () => {
    if (!profile) return [];
    
    const baseItems = [
      { title: "Accueil", url: "/feed", icon: Home },
      { title: "Recherche Avancée", url: "/recherche-avancee", icon: Search },
      { title: "Communautés", url: "/communities", icon: Hash },
      { title: "Annonces", url: "/annonces", icon: Megaphone },
    ];

    switch (profile.profile_type) {
      case 'agent':
        return [
          ...baseItems,
          { title: "Artistes", url: "/artists", icon: Users },
          { title: "Lieux", url: "/lieux", icon: MapPin },
        ];
      
      case 'manager':
        return [
          ...baseItems,
          { title: "Partenaires", url: "/partners", icon: Users },
          { title: "Campagnes", url: "/campaigns", icon: Target },
          { title: "Commissions", url: "/commissions", icon: Euro },
          { title: "Rapports", url: "/reports", icon: BarChart3 },
        ];
      
      case 'lieu':
        return [
          ...baseItems,
          { title: "Artistes", url: "/artists", icon: Users },
          { title: "Lieux", url: "/lieux", icon: MapPin },
          { title: "Événements", url: "/events", icon: Calendar },
        ];
      
      case 'influenceur':
        return [
          { title: "Affiliation", url: "/affiliation", icon: LinkIcon },
          { title: "Communautés", url: "/communities", icon: Hash },
        ];
      
      case 'artist':
      default:
        return [
          ...baseItems,
          { title: "Artistes", url: "/artists", icon: Users },
          { title: "Agents", url: "/profiles?type=agent", icon: Users },
          { title: "Lieux", url: "/lieux", icon: MapPin },
        ];
    }
  };

  const adminItems = hasRole('admin') ? [
    { title: "Dashboard Admin", url: "/admin/dashboard", icon: Shield },
    { title: "Régie Publicitaire", url: "/admin/ads", icon: Megaphone },
    { title: "Influenceurs", url: "/admin/influenceurs", icon: Users },
    { title: "Base de Connaissance", url: "/admin/knowledge", icon: BookOpen },
    { title: "Coffre-Fort", url: "/admin/coffre-fort", icon: Lock },
    { title: "Communication", url: "/admin/communication", icon: MessageCircle },
    { title: "Roadmap", url: "/admin/roadmap", icon: Route },
    { title: "Modération", url: "/admin/moderation", icon: Shield },
  ] : [];

  const supplementaryItems = getSupplementaryItems();

  return (
    <>
      {/* Burger Button - Fixed positioning with high z-index, only visible on mobile */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-[9999] p-3 h-auto bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 shadow-xl rounded-lg flex items-center justify-center md:hidden"
        aria-label="Ouvrir le menu"
        style={{
          position: 'fixed',
          top: '1rem !important',
          right: '1rem !important',
          zIndex: '9999 !important',
          display: 'flex !important',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '44px',
          minHeight: '44px',
          width: '44px',
          height: '44px',
          padding: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}
      >
        <Menu 
          className="h-5 w-5 text-gray-700 dark:text-gray-300" 
          style={{ 
            width: '20px', 
            height: '20px', 
            color: '#374151',
            flexShrink: 0
          }} 
        />
      </Button>

      {/* Backdrop & Menu - Rendered via Portal with highest z-index */}
      {isOpen && createPortal(
        <div 
          className="fixed inset-0 z-[99999] md:hidden overscroll-none"
          role="dialog"
          aria-modal="true"
          onWheel={(e) => e.preventDefault()}
          onTouchMove={(e) => e.preventDefault()}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeMenu}
            style={{ 
              touchAction: 'none',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none'
            }}
          />
          
          {/* Slide-in Menu Panel */}
          <div
            className={cn(
              "absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-background/95 backdrop-blur-md border-l border-border shadow-2xl",
              "transform transition-transform duration-300 ease-out",
              isOpen ? "translate-x-0" : "translate-x-full"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">
                <AutoTranslate text="Menu" />
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeMenu}
                className="p-2 h-auto"
                aria-label="Fermer le menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Menu Content */}
            <div className="flex flex-col h-[calc(100%-64px)] overflow-y-auto">
              {/* User Profile Section (if authenticated) */}
              {profile && (
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile.avatar_url || ''} />
                      <AvatarFallback className="bg-gradient-primary text-white">
                        {profile.display_name ? profile.display_name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{profile.display_name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{profile.profile_type}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Items */}
              <div className="flex-1 p-2">
                {/* Public Items (for non-authenticated users) */}
                {!user && (
                  <div className="space-y-1">
                    <div className="px-3 py-2">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <AutoTranslate text="Navigation" />
                      </h3>
                    </div>
                    {publicItems.map((item) => (
                      <Link
                        key={item.title}
                        to={item.url}
                        onClick={closeMenu}
                        className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium hover:bg-muted/50 transition-colors"
                      >
                        <item.icon className="h-5 w-5 text-muted-foreground" />
                        <AutoTranslate text={item.title} />
                      </Link>
                    ))}
                    
                    {/* Login Button */}
                    <Link
                      to="/auth"
                      onClick={closeMenu}
                      className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium bg-primary/10 text-primary mt-4"
                    >
                      <User className="h-5 w-5" />
                      <AutoTranslate text="Se connecter" />
                    </Link>
                  </div>
                )}

                {/* Supplementary Items (for authenticated users) */}
                {user && supplementaryItems.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-3 py-2">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <AutoTranslate text="Navigation" />
                      </h3>
                    </div>
                    {supplementaryItems.map((item) => (
                      <Link
                        key={item.title}
                        to={item.url}
                        onClick={closeMenu}
                        className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium hover:bg-muted/50 transition-colors"
                      >
                        <item.icon className="h-5 w-5 text-muted-foreground" />
                        <AutoTranslate text={item.title} />
                      </Link>
                    ))}
                  </div>
                )}

                {/* Admin Items */}
                {adminItems.length > 0 && (
                  <div className="space-y-1 mt-6">
                    <div className="px-3 py-2">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <AutoTranslate text="Administration" />
                      </h3>
                    </div>
                    {adminItems.map((item) => (
                      <Link
                        key={item.title}
                        to={item.url}
                        onClick={closeMenu}
                        className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium hover:bg-muted/50 transition-colors"
                      >
                        <item.icon className="h-5 w-5 text-muted-foreground" />
                        <AutoTranslate text={item.title} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Actions (for authenticated users) */}
              {user && (
                <div className="p-4 border-t border-border space-y-2">
                  <Link
                    to={profile?.profile_type === 'artist' ? `/artists/${profile.id}` : 
                         profile?.profile_type === 'agent' ? `/partners/${profile.id}` :
                         profile?.profile_type === 'manager' ? `/partners/${profile.id}` :
                         profile?.profile_type === 'lieu' ? `/lieux/${profile.id}` : `/profiles/${profile?.id}`}
                    onClick={closeMenu}
                    className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium hover:bg-muted/50 transition-colors w-full"
                  >
                    <User className="h-5 w-5 text-muted-foreground" />
                    <AutoTranslate text="Mon Profil" />
                  </Link>
                  
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-3 text-sm font-medium hover:bg-destructive/10 hover:text-destructive transition-colors w-full justify-start"
                  >
                    <LogOut className="h-5 w-5" />
                    <AutoTranslate text="Déconnexion" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}