import { Link, useLocation } from "react-router-dom";
import { Home, MessageCircle, Users, MapPin, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function MobileTabBar() {
  const location = useLocation();
  const { profile } = useAuth();

  const getMainTabs = () => {
    const commonTabs = [
      { name: "Accueil", href: "/dashboard", icon: Home },
      { name: "Messages", href: "/messages", icon: MessageCircle },
    ];

    if (profile?.profile_type === 'artist') {
      return [
        ...commonTabs,
        { name: "Agents", href: "/profiles?type=agent", icon: Users },
        { name: "Profil", href: `/artists/${profile.id}`, icon: User },
      ];
    }

    if (['agent', 'manager', 'lieu'].includes(profile?.profile_type || '')) {
      return [
        ...commonTabs,
        { name: "Artistes", href: "/artists", icon: Users },
        { name: "Lieux", href: "/lieux", icon: MapPin },
        { name: "Profil", href: `/partners/${profile.id}`, icon: User },
      ];
    }

    return [
      ...commonTabs,
      { name: "Artistes", href: "/artists", icon: Users },
      { name: "Profil", href: "/profiles", icon: User },
    ];
  };

  const tabs = getMainTabs();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return location.pathname === "/" || location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border pb-safe-bottom md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);
          
          return (
            <Link
              key={tab.name}
              to={tab.href}
              className={cn(
                "flex flex-col items-center justify-center min-h-[48px] px-2 py-1 rounded-lg transition-all duration-200",
                active
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className={cn("h-5 w-5 mb-1", active && "text-primary")} />
              <span className="text-xs font-medium truncate max-w-[60px]">
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}