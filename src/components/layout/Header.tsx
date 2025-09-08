import { Bell, Search, RefreshCw, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const location = useLocation();
  const { user, profile } = useAuth();
  
  // Determine page context
  const getPageTitle = () => {
    if (location.pathname.includes('/artists/') && location.pathname.includes('/edit')) {
      return "Modifier mon profil";
    }
    if (location.pathname.includes('/artists/')) {
      return "Profil d'artiste";
    }
    if (location.pathname === '/dashboard') {
      return "Tableau de Bord";
    }
    if (location.pathname === '/artists') {
      return "Artistes";
    }
    if (location.pathname === '/lieux') {
      return "Lieux";
    }
    if (location.pathname === '/messages') {
      return "Messages";
    }
    if (location.pathname === '/campaigns') {
      return "Campagnes";
    }
    if (location.pathname === '/reports') {
      return "Rapports";
    }
    return "Vybbi";
  };

  const isArtistPage = location.pathname.includes('/artists/') && !location.pathname.includes('/edit');
  const showAdminControls = !isArtistPage && location.pathname !== '/';

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {!isArtistPage && <SidebarTrigger />}
          
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground">
              {getPageTitle()}
            </h1>
            {showAdminControls && (
              <Badge variant="secondary" className="text-xs">
                lundi 8 septembre 2025 à 16:39
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {showAdminControls && (
            <>
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Actualiser
                </Button>
              </div>

              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Recherche..."
                  className="pl-10 w-64"
                />
              </div>

              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-primary">
                  2
                </Badge>
              </Button>
            </>
          )}

          {profile && (
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback className="bg-gradient-primary text-white text-sm">
                {profile.display_name ? profile.display_name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </header>
  );
}