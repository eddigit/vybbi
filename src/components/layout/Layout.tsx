import { useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const isAuthPage = location.pathname === '/auth';
  const isArtistProfilePage = location.pathname.includes('/artists/') && !location.pathname.includes('/edit');

  if (isLandingPage || isAuthPage) {
    return (
      <>
        <div className="pb-10">
          {children}
        </div>
        <Footer />
      </>
    );
  }

  // For artist profile pages, use a simpler layout without sidebar
  if (isArtistProfilePage) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex-1 pb-10">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  // For all other pages (dashboard, agent pages, etc.), use sidebar layout
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 pb-16">
            {children}
          </main>
        </div>
      </div>
      <Footer />
    </SidebarProvider>
  );
}