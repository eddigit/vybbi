import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Target,
  Euro,
  Settings,
  Menu,
  MessageSquare,
  BarChart3,
  FileText,
  Music,
  UserSearch,
  Building2,
  Star,
  Calendar,
  Briefcase,
  MapPin,
  User,
  Route,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

// Navigation items for different user types
const artistItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Artists", url: "/artists", icon: Music },
  { title: "Lieux", url: "/lieux", icon: Building2 },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Directory", url: "/profiles", icon: UserSearch },
];

const getAgentItems = (profileId: string) => [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Artistes", url: "/artists", icon: Music },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Mon Profil", url: `/agents/${profileId}/edit`, icon: User },
];

const getManagerItems = (profileId: string) => [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Partenaires", url: "/partners", icon: Users },
  { title: "Campagnes", url: "/campaigns", icon: Target },
  { title: "Commissions", url: "/commissions", icon: Euro },
  { title: "Rapports", url: "/reports", icon: BarChart3 },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Mon Profil", url: `/managers/${profileId}/edit`, icon: User },
];

const getLieuItems = (profileId: string) => [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Lieux", url: "/lieux", icon: MapPin },
  { title: "Événements", url: "/events", icon: Calendar },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Mon Profil", url: `/lieux/${profileId}/edit`, icon: User },
];

const adminItems = [
  { title: "Partners", url: "/partners", icon: Users },
  { title: "Campaigns", url: "/campaigns", icon: Target },
  { title: "Commissions", url: "/commissions", icon: Euro },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Roadmap", url: "/admin/roadmap", icon: Route },
  { title: "Modération", url: "/admin/moderation", icon: Settings },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const { profile, hasRole } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

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
      case 'artist':
      default:
        return artistItems;
    }
  };

  const mainItems = getNavigationItems();

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/20 text-primary font-medium border-r-2 border-primary" 
      : "text-muted-foreground hover:text-foreground hover:bg-muted/50";

  return (
    <Sidebar className="w-64" collapsible="icon">
      <SidebarContent>
        <div className="p-4">
          <div className="flex items-center gap-2">
            <img src="/lovable-uploads/952ba024-e787-4174-b9bc-50d160e2562a.png" alt="Vybbi Logo" className="w-8 h-8" />
            {open && (
              <span className="font-bold text-lg text-foreground">Vybbi</span>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {hasRole('admin') && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end className={getNavCls}>
                        <item.icon className="mr-2 h-4 w-4" />
                        {open && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}