import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileNavigationProps {
  navigationLinks?: Array<{
    href: string;
    label: string;
  }>;
  authButtons?: {
    signIn: string;
    signUp: string;
  };
}

export function MobileNavigation({ 
  navigationLinks = [],
  authButtons 
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    const handleRouteChange = () => setIsOpen(false);
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden touch-target p-2 z-50 relative"
        onClick={toggleMenu}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu panel */}
          <div className={cn(
            "fixed top-[4.5rem] left-0 right-0 bottom-0 z-50 md:hidden",
            "bg-background border-t border-border",
            "transform transition-transform duration-300 ease-out",
            "overflow-y-auto"
          )}>
            <div className="p-4 pb-safe-bottom space-y-6">
              {/* Navigation links */}
              {navigationLinks.length > 0 && (
                <nav className="space-y-4">
                  {navigationLinks.map((link, index) => (
                    <Link
                      key={index}
                      to={link.href}
                      className="block text-lg font-medium text-foreground hover:text-primary transition-colors touch-target py-3 px-2 rounded-md hover:bg-muted/50"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              )}
              
              {/* Auth buttons */}
              {authButtons && (
                <div className="pt-6 border-t border-border space-y-4">
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    asChild 
                    className="w-full justify-center touch-target"
                  >
                    <Link to={authButtons.signIn} onClick={() => setIsOpen(false)}>
                      Connexion
                    </Link>
                  </Button>
                  <Button 
                    size="lg" 
                    asChild 
                    className="w-full touch-target"
                  >
                    <Link to={authButtons.signUp} onClick={() => setIsOpen(false)}>
                      Commencer
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}