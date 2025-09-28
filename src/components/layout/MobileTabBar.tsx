import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Music,
  MessageSquare,
  Building2,
  UserSearch,
  Star,
  Users,
  MapPin,
  User,
  Megaphone,
  Hash,
  Radio
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { getProfileUrl } from '@/hooks/useProfileResolver';
import { useRadioPlayerVisibility } from "@/hooks/useRadioPlayerVisibility";

export function MobileTabBar() {
  const location = useLocation();
  const { profile } = useAuth();
  const { isRadioVisible, toggleRadioVisibility } = useRadioPlayerVisibility();
  // Public tabs (visible only for non-authenticated users)
  const publicTabs = !profile ? [
    { name: "Annonces", href: "/annonces", icon: Megaphone },
    { name: "Artistes", href: "/nos-artistes", icon: Users },
    { name: "Radio", href: "/radio", icon: Radio, isRadioToggle: true },
  ] : [];

  const getMainTabs = () => {
    switch (profile?.profile_type) {
      case 'artist':
        return [
          { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { name: "Radio", href: "/radio", icon: Radio, isRadioToggle: true },
          { name: "Messages", href: "/messages", icon: MessageSquare },
          { name: "Profil", href: getProfileUrl(profile), icon: User },
        ];
      case 'agent':
        return [
          { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { name: "Radio", href: "/radio", icon: Radio, isRadioToggle: true },
          { name: "Messages", href: "/messages", icon: MessageSquare },
          { name: "Profil", href: `/profiles`, icon: User },
        ];
      case 'manager':
        return [
          { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { name: "Radio", href: "/radio", icon: Radio, isRadioToggle: true },
          { name: "Messages", href: "/messages", icon: MessageSquare },
          { name: "Profil", href: `/profiles`, icon: User },
        ];
      case 'lieu':
        return [
          { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { name: "Radio", href: "/radio", icon: Radio, isRadioToggle: true },
          { name: "Messages", href: "/messages", icon: MessageSquare },
          { name: "Profil", href: `/lieux/${profile.id}`, icon: User },
        ];
      default:
        // Inclut les admins et autres types
        return [
          { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
          { name: "Radio", href: "/radio", icon: Radio, isRadioToggle: true },
          { name: "Messages", href: "/messages", icon: MessageSquare },
          { name: "Profil", href: `/profiles`, icon: User },
        ];
    }
  };

  const tabs = profile ? getMainTabs() : publicTabs;

  const isActive = (href: string, isRadioToggle?: boolean) => {
    if (isRadioToggle) {
      // Pour la radio, l'état actif dépend de la visibilité du lecteur
      return isRadioVisible;
    }
    if (href === "/dashboard") {
      return location.pathname === "/" || location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div
      className={cn(
        "fixed left-0 right-0 bottom-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border md:hidden touch-target",
        "pb-safe-bottom"
      )}
    >
      <div className="flex items-center justify-around px-1 py-2 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href, tab.isRadioToggle);
          
          // Si c'est un bouton toggle radio, on rend un bouton au lieu d'un lien
          if (tab.isRadioToggle) {
            return (
              <button
                key={tab.name}
                onClick={toggleRadioVisibility}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 min-h-[56px] max-w-[80px] px-1 py-2 rounded-lg transition-all duration-200 touch-target select-none",
                  active
                    ? "text-primary bg-primary/10 scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95"
                )}
                style={{ touchAction: 'manipulation' }}
              >
                <Icon className={cn("h-6 w-6 mb-1 flex-shrink-0", active && "text-primary drop-shadow-sm")} />
                <span className="text-[10px] font-medium leading-tight text-center line-clamp-1 select-none">
                  {tab.name}
                </span>
              </button>
            );
          }
          
          // Sinon, on rend un lien normal
          return (
            <Link
              key={tab.name}
              to={tab.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 min-h-[56px] max-w-[80px] px-1 py-2 rounded-lg transition-all duration-200 touch-target select-none",
                active
                  ? "text-primary bg-primary/10 scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95"
              )}
              style={{ touchAction: 'manipulation' }}
            >
              <Icon className={cn("h-6 w-6 mb-1 flex-shrink-0", active && "text-primary drop-shadow-sm")} />
              <span className="text-[10px] font-medium leading-tight text-center line-clamp-1 select-none">
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}