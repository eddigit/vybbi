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

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Artists", url: "/artists", icon: Music },
  { title: "Lieux", url: "/lieux", icon: Building2 },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Directory", url: "/profiles", icon: UserSearch },
];

const adminItems = [
  { title: "Partners", url: "/partners", icon: Users },
  { title: "Campaigns", url: "/campaigns", icon: Target },
  { title: "Commissions", url: "/commissions", icon: Euro },
  { title: "Reports", url: "/reports", icon: BarChart3 },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

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
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            {open && (
              <span className="font-bold text-lg text-foreground">Artis.io</span>
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
      </SidebarContent>
    </Sidebar>
  );
}