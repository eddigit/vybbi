import { useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { TopNav } from "./TopNav";
import { MobileTabBar } from "./MobileTabBar";
import { useAffiliateTracking } from "@/hooks/useAffiliateTracking";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";

import { useAuth } from "@/hooks/useAuth";


interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user, loading } = useAuth();
  const isHomePage = location.pathname === '/';
  const isAuthPage = location.pathname === '/auth';
  const isArtistProfilePage = location.pathname.includes('/artists/') && !location.pathname.includes('/edit');
  const isVenueProfilePage = location.pathname.includes('/lieux/') && !location.pathname.includes('/edit');
  const isPartnerProfilePage = location.pathname.includes('/partners/') && !location.pathname.includes('/edit');
  
  // Initialize global affiliate tracking
  useAffiliateTracking();

  // Show loading if auth is still checking
  if (loading && isHomePage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // For home page: show landing layout only if user is NOT authenticated
  if (isHomePage && !user) {
    return (
      <>
        <div className="pb-10">
          {children}
        </div>
        <Footer />
        <CookieConsentBanner />
      </>
    );
  }

  // For auth page, use landing layout
  if (isAuthPage) {
    return (
      <>
        <div className="pb-10">
          {children}
        </div>
        <Footer />
        <CookieConsentBanner />
      </>
    );
  }

  // For profile pages, use a simpler layout without sidebar
  if (isArtistProfilePage || isVenueProfilePage || isPartnerProfilePage) {
    return (
      <div className="min-h-screen bg-background relative overflow-x-hidden">
        <div className="hidden md:block">
          <Header />
        </div>
        <main className="flex-1 pb-10 relative overflow-x-hidden">
          {children}
        </main>
        <MobileTabBar />
        <Footer />
        <CookieConsentBanner />
      </div>
    );
  }

  // For all other pages (dashboard, agent pages, social wall when authenticated, etc.), use responsive navigation
  return (
    <div className="min-h-screen flex flex-col w-full bg-background relative overflow-x-hidden">
      <div className="hidden md:block">
        <Header />
      </div>
      {/* Desktop horizontal nav, hidden on mobile */}
      <div className="hidden md:block">
        <TopNav />
      </div>
      <main className="flex-1 p-2 sm:p-3 md:p-4 pb-16 md:pb-12 w-full relative overflow-x-hidden">
        {children}
      </main>
      {/* Mobile tab bar, hidden on desktop */}
      <MobileTabBar />
      {/* Footer hidden on mobile for better UX */}
      <div className="hidden md:block">
        <Footer />
      </div>
      <CookieConsentBanner />
    </div>
  );
}