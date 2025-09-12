import { LanguageSelector } from "@/components/LanguageSelector";
import { AutoTranslate } from "@/components/AutoTranslate";
import { useTranslate } from "@/hooks/useTranslate";
import { Bell, Search, User, Pencil, MessageSquare, Users, LogOut, MapPin, Star, LayoutDashboard, Megaphone, Trophy } from "lucide-react";
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
import { useNotifications } from "@/hooks/useNotifications";
import { useState } from "react";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const { notifications, unreadCount, markAsRead } = useNotifications();
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
    navigate('/auth');
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.conversationId) {
      navigate('/messages', { state: { selectedConversationId: notification.conversationId } });
    }
  };

  return (
    <header className="h-14 sm:h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-full items-center justify-between px-3 sm:px-4">
        {/* Mobile: Logo only, Desktop: Logo + Name */}
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 sm:gap-3 min-w-0 hover:opacity-80 transition-opacity">
          <img 
            src="/lovable-uploads/341ddf13-d369-435e-afa6-45e70902ebf8.png" 
            alt="Vybbi Logo" 
            className="w-7 h-7 sm:w-8 sm:h-8"
          />
          <span className="hidden sm:block font-bold text-lg text-white">Vybbi</span>
        </Link>


        <div className="flex items-center gap-1 sm:gap-4 min-w-0 justify-end">
          {/* Language Selector - Always visible */}
          <LanguageSelector />
          
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

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10">
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 p-0 text-xs bg-primary text-primary-foreground flex items-center justify-center rounded-full min-w-[16px] sm:min-w-[20px]">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 sm:w-80">
                  <DropdownMenuLabel><AutoTranslate text="Notifications" /></DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <DropdownMenuItem disabled>
                      <AutoTranslate text="Aucune notification" />
                    </DropdownMenuItem>
                  ) : (
                    notifications.map((notification) => (
                      <DropdownMenuItem 
                        key={notification.id} 
                        className="flex flex-col items-start p-3 cursor-pointer hover:bg-accent"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className={`flex items-center gap-2 w-full ${notification.unread ? 'font-semibold' : ''}`}>
                          <span className="text-sm flex-1 truncate">{notification.title}</span>
                          {notification.unread && (
                            <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0"></div>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.description}</span>
                        <span className="text-xs text-muted-foreground mt-1">{notification.time}</span>
                      </DropdownMenuItem>
                    ))
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/messages" className="w-full text-center">
                      <AutoTranslate text="Voir tous les messages" />
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {profile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer">
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
                  <Link to={profile.profile_type === 'artist' ? `/artists/${profile.id}` : 
                           profile.profile_type === 'agent' ? `/partners/${profile.id}` :
                           profile.profile_type === 'manager' ? `/partners/${profile.id}` :
                           profile.profile_type === 'lieu' ? `/lieux/${profile.id}` : `/profiles/${profile.id}`} className="flex items-center">
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