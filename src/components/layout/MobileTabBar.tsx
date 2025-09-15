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

export function MobileTabBar() {
  const location = useLocation();
  const { profile } = useAuth();

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
        return [
          { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { name: "Messages", href: "/messages", icon: MessageSquare },
          { name: "Communautés", href: "/communities", icon: Hash },
          { name: "Profil", href: "/profiles", icon: User },
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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border pb-safe-bottom md:hidden touch-target">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);
          
          return (
            <Link
              key={tab.name}
              to={tab.href}
              className={cn(
                "flex flex-col items-center justify-center min-h-[48px] px-2 py-1 rounded-lg transition-all duration-200 touch-target select-none",
                active
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              style={{ touchAction: 'manipulation' }}
            >
              <Icon className={cn("h-5 w-5 mb-1", active && "text-primary")} />
              <span className="text-xs font-medium truncate max-w-[60px] select-none">
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}