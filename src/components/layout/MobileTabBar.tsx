import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  PlusCircle,
  Bell,
  Music,
  User
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useRadioPlayerVisibility } from "@/hooks/useRadioPlayerVisibility";
import { MobileNotificationBadge } from "@/components/MobileNotificationBadge";

interface TabItem {
  name: string;
  href: string;
  icon: any;
  isRadioToggle?: boolean;
  isNotificationBadge?: boolean;
}

export function MobileTabBar() {
  const location = useLocation();
  const { profile } = useAuth();
  const { isRadioVisible, toggleRadioVisibility } = useRadioPlayerVisibility();

  // Tabs unifiés inspirés du design de référence, adaptés à Vybbi
  const getTabs = (): TabItem[] => {
    if (!profile) {
      return [
        { name: "Accueil", href: "/", icon: Home },
        { name: "Réseau", href: "/nos-artistes", icon: Users },
        { name: "Radio", href: "/radio", icon: Music, isRadioToggle: true },
        { name: "Connexion", href: "/auth", icon: User },
      ];
    }

    // Pour tous les utilisateurs connectés, même structure simplifiée
    return [
      { name: "Accueil", href: "/dashboard", icon: Home },
      { name: "Réseau", href: "/artists", icon: Users },
      { name: "Publier", href: "/annonces", icon: PlusCircle },
      { name: "Notifs", href: "/notifications", icon: Bell, isNotificationBadge: true },
      { name: "Radio", href: "/radio", icon: Music, isRadioToggle: true },
    ];
  };

  const tabs = getTabs();

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
        "fixed left-0 right-0 z-50 bg-background border-t border-border md:hidden"
      )}
      style={{ bottom: 0 }}
    >
      <div className="grid grid-cols-5 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href, tab.isRadioToggle);
          
          // Si c'est un badge de notification, on rend un lien avec le badge
          if (tab.isNotificationBadge) {
            return (
              <Link
                key={tab.name}
                to={tab.href}
                className={cn(
                  "flex flex-col items-center justify-center px-2 py-2 transition-colors duration-200",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="mb-1">
                  <MobileNotificationBadge isActive={active} />
                </div>
                <span className="text-[10px] font-medium text-center">
                  {tab.name}
                </span>
              </Link>
            );
          }
          
          // Si c'est un bouton toggle radio, on rend un bouton au lieu d'un lien
          if (tab.isRadioToggle) {
            return (
              <button
                key={tab.name}
                onClick={toggleRadioVisibility}
                className={cn(
                  "flex flex-col items-center justify-center px-2 py-2 transition-colors duration-200",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-6 w-6 mb-1 flex-shrink-0" />
                <span className="text-[10px] font-medium text-center">
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
                "flex flex-col items-center justify-center px-2 py-2 transition-colors duration-200",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-6 w-6 mb-1 flex-shrink-0" />
              <span className="text-[10px] font-medium text-center">
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}