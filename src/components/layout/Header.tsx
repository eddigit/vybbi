import { LanguageSelector } from "@/components/LanguageSelector";
import { AutoTranslate } from "@/components/AutoTranslate";
import { useTranslate } from "@/hooks/useTranslate";
import vybbiLogo from "@/assets/vybbi-wolf-logo.png";
import { VybbiTokenBalance } from "@/components/vybbi/VybbiTokenBalance";
import { Bell, Search, User, Pencil, MessageSquare, Users, LogOut, MapPin, Star, LayoutDashboard, Megaphone, Trophy, Radio, Coins, Target, Menu, Music2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useToast } from "@/hooks/use-toast";
import { NotificationCenter } from "@/components/NotificationCenter";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";


export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, hasRole } = useAuth();
  const { toast } = useToast();
  // Removed useNotifications - now handled by NotificationCenter
  const [searchQuery, setSearchQuery] = useState("");
  
  const { translatedText: searchPlaceholder } = useTranslate("Recherche...");
  

  const isArtistPage = location.pathname.includes('/artists/') && !location.pathname.includes('/edit');
  const showAdminControls = !isArtistPage && location.pathname !== '/';


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Pour l'instant, redirection vers la page artistes avec le terme de recherche
      navigate(`/artists?search=${encodeURIComponent(searchQuery.trim())}`);
      toast({
        title: "Recherche effectuée",
        description: `Recherche pour: "${searchQuery}"`,
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    // La redirection est déjà gérée dans useAuth.ts
  };




  // Get visitor navigation links (for non-authenticated users)
  const getVisitorNavLinks = () => [
    { href: "/top-artistes", label: "Top Artistes", icon: Trophy },
    { href: "/artists", label: "Nos Artistes", icon: Users },
    { href: "/webtv", label: "Web TV", icon: Radio },
    { href: "/token", label: "Token VYBBI", icon: Coins },
    { href: "/partners", label: "Nos Partenaires", icon: Users },
    { href: "/lieux", label: "Nos Lieux", icon: MapPin },
    { href: "/a-propos", label: "À propos", icon: Star },
    { href: "/blog", label: "Blog", icon: Search },
  ];

  // Get main navigation links based on user profile (for authenticated users)
  const getAuthenticatedNavLinks = () => {
    if (!profile) return [];
    
    const baseLinks = [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/messages", label: "Messages", icon: MessageSquare },
      { href: "/vybbi-tokens", label: "Mes Jetons VYBBI", icon: Coins },
      { href: "/webtv", label: "Web TV", icon: Radio },
      { href: "/annonces", label: "Annonces", icon: Megaphone },
    ];

    // Add profile-specific links based on TopNav structure
    switch (profile.profile_type) {
      case 'agent':
        baseLinks.push(
          { href: "/artists", label: "Artistes", icon: Users },
          { href: "/lieux", label: "Lieux", icon: MapPin },
          { href: "/recherche-avancee", label: "Recherche IA", icon: Search },
          { href: "/communities", label: "Communautés", icon: Users }
        );
        break;
      case 'manager':
        baseLinks.push(
          { href: "/partners", label: "Partenaires", icon: Users },
          { href: "/campaigns", label: "Campagnes", icon: Target },
          { href: "/commissions", label: "Commissions", icon: Coins },
          { href: "/reports", label: "Rapports", icon: Star },
          { href: "/communities", label: "Communautés", icon: Users }
        );
        break;
      case 'lieu':
        baseLinks.push(
          { href: "/artists", label: "Artistes", icon: Users },
          { href: "/lieux", label: "Lieux", icon: MapPin },
          { href: "/events", label: "Événements", icon: Star },
          { href: "/recherche-avancee", label: "Recherche IA", icon: Search },
          { href: "/communities", label: "Communautés", icon: Users }
        );
        break;
      case 'influenceur':
        baseLinks.push(
          { href: "/affiliation", label: "Affiliation", icon: Target },
          { href: "/communities", label: "Communautés", icon: Users }
        );
        break;
      case 'artist':
      default:
        baseLinks.push(
          { href: "/artists", label: "Artists", icon: Users },
          { href: "/recherche-avancee", label: "Recherche Avancée", icon: Search },
          { href: "/profiles?type=agent", label: "Agents", icon: Users },
          { href: "/lieux", label: "Lieux", icon: MapPin },
          { href: "/communities", label: "Communautés", icon: Users }
        );
        break;
    }

    return baseLinks;
  };

  // Removed notification handling - now in NotificationCenter

  return (
    <header className={cn(
      "border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 pt-safe-top z-40"
    )}>
      <div className="flex h-14 sm:h-16 items-center justify-between px-6 sm:px-8 lg:px-12">
          {/* Mobile: Logo only, Desktop: Logo + Name */}
          <Link to={user ? (hasRole('admin') ? "/dashboard" : "/") : "/"} className="flex items-center gap-2 sm:gap-3 min-w-0 hover:opacity-80 transition-opacity">
            <img 
              src={vybbiLogo} 
              alt="Vybbi Logo" 
              className="w-7 h-7 sm:w-8 sm:h-8"
            />
            <span className="hidden sm:block font-bold text-lg text-white">Vybbi</span>
          </Link>


          <div className="flex items-center gap-1 sm:gap-4 min-w-0 justify-end">
            {/* VYBBI Token Balance Widget */}
            {user && (
              <div className="hidden md:block">
                <VybbiTokenBalance variant="widget" />
              </div>
            )}
            
            {showAdminControls && (
              <>
                {/* Search - Hidden on mobile, visible on tablet+ */}
                <form onSubmit={handleSearch} className="hidden lg:block relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={searchPlaceholder}
                    className="pl-10 w-48 xl:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>

                {/* Notifications - Hidden on mobile */}
                <div className="hidden md:block">
                  <NotificationCenter />
                </div>
              </>
            )}

            {/* Auth buttons for non-authenticated users */}
            {!user && (
              <div className="flex items-center gap-2">
                {/* Connexion button - Hidden on smallest screens */}
                <Link to="/auth" className="hidden sm:block">
                  <Button variant="outline" size="sm">
                    <AutoTranslate text="Connexion" />
                  </Button>
                </Link>
                {/* Inscription gratuite button - Always visible */}
                <Link to="/get-started">
                  <Button variant="default" size="sm" className="relative">
                    <Badge variant="secondary" className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1 py-0 animate-pulse">
                      GRATUIT
                    </Badge>
                    <AutoTranslate text="Inscription gratuite" />
                  </Button>
                </Link>
                
                {/* Actions rapides dropdown - Desktop only */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="hidden lg:flex">
                    <Button variant="ghost" size="sm">
                      <Menu className="h-4 w-4" />
                      <span className="ml-1">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-background">
                    <DropdownMenuLabel>Actions rapides</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/trouver-artiste" className="flex items-center cursor-pointer">
                        <Music2 className="mr-2 h-4 w-4 text-primary" />
                        <span>Trouver un artiste</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/trouver-agent" className="flex items-center cursor-pointer">
                        <Users className="mr-2 h-4 w-4 text-purple-500" />
                        <span>Trouver un agent</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/trouver-lieu" className="flex items-center cursor-pointer">
                        <MapPin className="mr-2 h-4 w-4 text-blue-500" />
                        <span>Trouver un lieu</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/publier-offre" className="flex items-center cursor-pointer">
                        <PlusCircle className="mr-2 h-4 w-4 text-green-500" />
                        <span>Publier une offre</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Desktop Profile Dropdown - Hidden on mobile */}
            {profile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden md:flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer">
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                      <AvatarImage src={profile.avatar_url || ''} />
                      <AvatarFallback className="bg-gradient-primary text-white text-xs sm:text-sm">
                        {profile.display_name ? profile.display_name.charAt(0).toUpperCase() : <User className="h-3 w-3 sm:h-4 sm:w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 sm:w-56">
                <DropdownMenuLabel className="text-sm"><AutoTranslate text="Mon compte" /></DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={profile.profile_type === 'artist' ? `/artistes/${profile.slug || profile.id}` : 
                           profile.profile_type === 'agent' ? `/partners/${profile.slug || profile.id}` :
                           profile.profile_type === 'manager' ? `/partners/${profile.slug || profile.id}` :
                           profile.profile_type === 'lieu' ? `/lieux/${profile.slug || profile.id}` : `/profiles/${profile.id}`} className="flex items-center">
                    <User className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-sm"><AutoTranslate text="Mon profil" /></span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={profile.profile_type === 'artist' ? `/artists/${profile.id}/edit` : 
                           profile.profile_type === 'agent' ? `/agents/${profile.id}/edit` :
                           profile.profile_type === 'manager' ? `/managers/${profile.id}/edit` :
                           profile.profile_type === 'lieu' ? `/lieux/${profile.id}` : `/profiles/${profile.id}/edit`} className="flex items-center">
                    <Pencil className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-sm"><AutoTranslate text="Modifier" /></span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/messages" className="flex items-center">
                    <MessageSquare className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-sm"><AutoTranslate text="Messages" /></span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center">
                    <LayoutDashboard className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-sm"><AutoTranslate text="Tableau de bord" /></span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/top-artistes" className="flex items-center">
                    <Trophy className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-sm"><AutoTranslate text="Top Artistes" /></span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/annonces" className="flex items-center">
                    <Megaphone className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-sm"><AutoTranslate text="Annonces" /></span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/vybbi-tokens" className="flex items-center">
                    <Coins className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-sm"><AutoTranslate text="Mes Jetons VYBBI" /></span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/webtv" className="flex items-center">
                    <Radio className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-sm"><AutoTranslate text="Web TV" /></span>
                  </Link>
                </DropdownMenuItem>

                {/* Quick access menu items for mobile - condensed */}
                {(profile.profile_type === 'agent' || profile.profile_type === 'manager' || profile.profile_type === 'lieu') && (
                  <DropdownMenuItem asChild>
                    <Link to="/artists" className="flex items-center sm:hidden">
                      <Search className="mr-2 h-3 w-3" />
                      <span className="text-sm"><AutoTranslate text="Artistes" /></span>
                    </Link>
                  </DropdownMenuItem>
                )}
                
                {(profile.profile_type === 'agent' || profile.profile_type === 'manager') && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/lieux" className="flex items-center sm:hidden">
                        <MapPin className="mr-2 h-3 w-3" />
                        <span className="text-sm"><AutoTranslate text="Lieux" /></span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/events" className="flex items-center sm:hidden">
                        <Star className="mr-2 h-3 w-3" />
                        <span className="text-sm"><AutoTranslate text="Événements" /></span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                {profile.profile_type === 'artist' && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/profiles?type=agent" className="flex items-center sm:hidden">
                        <Users className="mr-2 h-3 w-3" />
                        <span className="text-sm"><AutoTranslate text="Agents" /></span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profiles?type=manager" className="flex items-center sm:hidden">
                        <Users className="mr-2 h-3 w-3" />
                        <span className="text-sm"><AutoTranslate text="Managers" /></span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center text-destructive">
                  <LogOut className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-sm"><AutoTranslate text="Déconnexion" /></span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}