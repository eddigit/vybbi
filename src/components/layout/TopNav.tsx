import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Target,
  Euro,
  MessageSquare,
  BarChart3,
  Music,
  UserSearch,
  Building2,
  Star,
  Calendar,
  MapPin,
  User,
  ChevronDown,
  Megaphone,
  Shield,
  Route,
  MessageCircle,
  BookOpen,
  Link as LinkIcon
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// Navigation items for different user types
const artistItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Artists", url: "/artists", icon: Music },
  { title: "Recherche Avancée", url: "/recherche-avancee", icon: UserSearch },
  { title: "Agents", url: "/profiles?type=agent", icon: UserSearch },
  { title: "Annonces", url: "/annonces", icon: Megaphone },
  { title: "Lieux", url: "/lieux", icon: Building2 },
  { title: "Messages", url: "/messages", icon: MessageSquare },
];

const getAgentItems = (profileId: string) => [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Artistes", url: "/artists", icon: Music },
  { title: "Recherche IA", url: "/recherche-avancee", icon: UserSearch },
  { title: "Lieux", url: "/lieux", icon: Building2 },
  { title: "Annonces", url: "/annonces", icon: Megaphone },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Mon Profil", url: `/agents/${profileId}/edit`, icon: User },
];

const getManagerItems = (profileId: string) => [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Partenaires", url: "/partners", icon: Users },
  { title: "Annonces", url: "/annonces", icon: Megaphone },
  { title: "Campagnes", url: "/campaigns", icon: Target },
  { title: "Commissions", url: "/commissions", icon: Euro },
  { title: "Rapports", url: "/reports", icon: BarChart3 },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Mon Profil", url: `/managers/${profileId}/edit`, icon: User },
];

const getLieuItems = (profileId: string) => [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Artistes", url: "/artists", icon: Music },
  { title: "Recherche IA", url: "/recherche-avancee", icon: UserSearch },
  { title: "Agents", url: "/profiles?type=agent", icon: UserSearch },
  { title: "Lieux", url: "/lieux", icon: MapPin },
  { title: "Annonces", url: "/annonces", icon: Megaphone },
  { title: "Événements", url: "/events", icon: Calendar },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Mon Profil", url: `/lieux/${profileId}/edit`, icon: User },
];

const influenceurItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Affiliation", url: "/affiliation", icon: LinkIcon },
  { title: "Messages", url: "/messages", icon: MessageSquare },
];

const adminItems = [
  { title: "Dashboard Admin", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Régie Publicitaire", url: "/admin/ads", icon: Megaphone },
  { title: "Influenceurs", url: "/admin/influenceurs", icon: Users },
  { title: "Base de Connaissance", url: "/admin/knowledge", icon: BookOpen },
  { title: "Partners", url: "/partners", icon: Users },
  { title: "Campaigns", url: "/campaigns", icon: Target },
  { title: "Commissions", url: "/commissions", icon: Euro },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Communication", url: "/admin/communication", icon: MessageCircle },
  { title: "Roadmap", url: "/admin/roadmap", icon: Route },
  { title: "Modération", url: "/admin/moderation", icon: Shield },
];

export function TopNav() {
  const { profile, hasRole } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  // Public navigation items (visible only for non-authenticated users)
  const publicItems = !profile ? [
    { title: "À propos", url: "/a-propos" },
    { title: "Pour Artistes", url: "/pour-artistes" },
    { title: "Pour Agents", url: "/pour-agents-managers" },
    { title: "Pour Lieux", url: "/pour-lieux-evenements" },
    { title: "Nos Artistes", url: "/nos-artistes" },
    { title: "Technologie", url: "/technologie" },
    { title: "Partenariats", url: "/partenariats" },
    { title: "Blog", url: "/blog" },
  ] : [];

  // Get navigation items based on profile type
  const getNavigationItems = () => {
    if (!profile) return artistItems; // Default fallback
    
    switch (profile.profile_type) {
      case 'agent':
        return getAgentItems(profile.id);
      case 'manager':
        return getManagerItems(profile.id);
      case 'lieu':
        return getLieuItems(profile.id);
      case 'influenceur':
        return influenceurItems;
      case 'artist':
      default:
        return artistItems;
    }
  };

  const mainItems = getNavigationItems();

  const getNavCls = ({ isActive }: { isActive: boolean }) => {
    const baseClasses = "flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap";
    if (isActive) {
      return `${baseClasses} bg-primary/10 text-primary border-b-2 border-primary`;
    }
    return `${baseClasses} text-muted-foreground hover:text-foreground hover:bg-muted/50`;
  };

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-center px-4 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {/* Public Navigation Items */}
          {publicItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              end
              className={getNavCls}
            >
              <span>{item.title}</span>
            </NavLink>
          ))}
          
          {/* Profile-based Navigation Items (only for logged in users) */}
          {profile && mainItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              end
              className={getNavCls}
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.title}</span>
            </NavLink>
          ))}
          
          {hasRole('admin') && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 whitespace-nowrap"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {adminItems.map((item) => (
                  <DropdownMenuItem key={item.title} asChild>
                    <NavLink to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </NavLink>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
}