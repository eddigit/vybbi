import { useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { TopNav } from "./TopNav";
import { MobileTabBar } from "./MobileTabBar";
import { AdBanner } from "@/components/ads/AdBanner";

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

  // For all other pages (dashboard, agent pages, etc.), use responsive navigation
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex w-full">
        {/* Left sidebar ad */}
        <div className="hidden xl:block w-[300px] p-4">
          <div className="sticky top-4">
            <AdBanner placement="sidebar_left" />
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {/* Desktop horizontal nav, hidden on mobile */}
          <div className="hidden md:block">
            <TopNav />
          </div>
          <main className="flex-1 p-4 sm:p-6 pb-20 md:pb-16">
            {children}
          </main>
          {/* Mobile tab bar, hidden on desktop */}
          <MobileTabBar />
          {/* Footer hidden on mobile for better UX */}
          <div className="hidden md:block">
            <Footer />
          </div>
        </div>

        {/* Right sidebar ad */}
        <div className="hidden xl:block w-[300px] p-4">
          <div className="sticky top-4">
            <AdBanner placement="sidebar_right" />
          </div>
        </div>
      </div>
    </div>
  );
}