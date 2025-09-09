import { Bell, Search, RefreshCw, User, Pencil, MessageSquare, Users, LogOut, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  
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
    if (location.pathname === '/promotion') {
      return "Se mettre en avant";
    }
    return "Vybbi";
  };

  const isArtistPage = location.pathname.includes('/artists/') && !location.pathname.includes('/edit');
  const showAdminControls = !isArtistPage && location.pathname !== '/';

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {!isArtistPage && <SidebarTrigger />}
          
          {/* Logo and App Name */}
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/341ddf13-d369-435e-afa6-45e70902ebf8.png" 
              alt="Vybbi Logo" 
              className="w-8 h-8"
            />
            <span className="font-bold text-lg text-white">Vybbi</span>
          </div>
        </div>

        {/* Centered Title */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground text-center">
              {getPageTitle()}
            </h1>
            {showAdminControls && (
              <Badge variant="secondary" className="text-xs whitespace-nowrap">
                lundi 8 septembre 2025 à 16:39
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 min-w-0 flex-1 justify-end">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile.avatar_url || ''} />
                    <AvatarFallback className="bg-gradient-primary text-white text-sm">
                      {profile.display_name ? profile.display_name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={profile.profile_type === 'artist' ? `/artists/${profile.id}` : 
                           profile.profile_type === 'agent' ? `/partners/${profile.id}` :
                           profile.profile_type === 'manager' ? `/partners/${profile.id}` :
                           profile.profile_type === 'lieu' ? `/lieux/${profile.id}` : `/profiles/${profile.id}`} className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Mon profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={profile.profile_type === 'artist' ? `/artists/${profile.id}/edit` : 
                           profile.profile_type === 'agent' ? `/agents/${profile.id}/edit` :
                           profile.profile_type === 'manager' ? `/managers/${profile.id}/edit` :
                           profile.profile_type === 'lieu' ? `/lieux/${profile.id}` : `/profiles/${profile.id}/edit`} className="flex items-center">
                    <Pencil className="mr-2 h-4 w-4" />
                    Modifier mon profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/messages" className="flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/artists" className="flex items-center">
                    <Search className="mr-2 h-4 w-4" />
                    Rechercher des artistes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/lieux" className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    Trouver une prestation
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profiles?type=agent" className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    Rechercher un agent
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profiles" className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    Annuaire (agents et autres)
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/promotion" className="flex items-center">
                    <Star className="mr-2 h-4 w-4" />
                    Se mettre en avant
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}