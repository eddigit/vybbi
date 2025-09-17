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
  Hash
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useRadioPlayer } from "@/hooks/useRadioPlayer";

export function MobileTabBar() {
  const location = useLocation();
  const { profile } = useAuth();
  const { currentTrack } = useRadioPlayer();
  const hasPlayer = Boolean(currentTrack);
  // Public tabs (visible only for non-authenticated users)
  const publicTabs = !profile ? [
    { name: "Annonces", href: "/annonces", icon: Megaphone },
    { name: "Artistes", href: "/nos-artistes", icon: Users },
  ] : [];

  const getMainTabs = () => {
    switch (profile?.profile_type) {
      case 'artist':
        return [
          { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { name: "Messages", href: "/messages", icon: MessageSquare },
          { name: "Communautés", href: "/communities", icon: Hash },
          { name: "Profil", href: `/artists/${profile.id}`, icon: User },
        ];
      case 'agent':
        return [
          { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { name: "Messages", href: "/messages", icon: MessageSquare },
          { name: "Communautés", href: "/communities", icon: Hash },
          { name: "Profil", href: `/profiles`, icon: User },
        ];
      case 'manager':
        return [
          { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { name: "Messages", href: "/messages", icon: MessageSquare },
          { name: "Communautés", href: "/communities", icon: Hash },
          { name: "Profil", href: `/profiles`, icon: User },
        ];
      case 'lieu':
        return [
          { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { name: "Messages", href: "/messages", icon: MessageSquare },
          { name: "Communautés", href: "/communities", icon: Hash },
          { name: "Profil", href: `/lieux/${profile.id}`, icon: User },
        ];
      default:
        // Inclut les admins et autres types
        return [
          { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
          { name: "Messages", href: "/messages", icon: MessageSquare },
          { name: "Communautés", href: "/communities", icon: Hash },
          { name: "Profil", href: `/profiles`, icon: User },
        ];
    }
  };

  const tabs = profile ? getMainTabs() : publicTabs;

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return location.pathname === "/" || location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div
      className={cn(
        "fixed left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border md:hidden touch-target",
        hasPlayer ? "bottom-[64px]" : "bottom-0",
        "pb-safe-bottom"
      )}
    >
      <div className="flex items-center justify-around px-1 py-2 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);
          
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