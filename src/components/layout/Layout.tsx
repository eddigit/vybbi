import { useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { TopNav } from "./TopNav";
import { MobileTabBar } from "./MobileTabBar";
import { useAffiliateTracking } from "@/hooks/useAffiliateTracking";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { ChatButton } from "@/components/ChatButton";


interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const isAuthPage = location.pathname === '/auth';
  const isArtistProfilePage = location.pathname.includes('/artists/') && !location.pathname.includes('/edit');
  const isVenueProfilePage = location.pathname.includes('/lieux/') && !location.pathname.includes('/edit');
  const isPartnerProfilePage = location.pathname.includes('/partners/') && !location.pathname.includes('/edit');
  
  // Initialize global affiliate tracking
  useAffiliateTracking();

  if (isLandingPage || isAuthPage) {
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
        <Header />
        <main className="flex-1 pb-10 relative overflow-x-hidden">
          {children}
        </main>
        <Footer />
        <CookieConsentBanner />
        <ChatButton />
      </div>
    );
  }

  // For all other pages (dashboard, agent pages, etc.), use responsive navigation
  return (
    <div className="min-h-screen flex flex-col w-full bg-background relative overflow-x-hidden">
      <Header />
      {/* Desktop horizontal nav, hidden on mobile */}
      <div className="hidden md:block">
        <TopNav />
      </div>
      <main className="flex-1 p-3 sm:p-4 md:p-6 pb-20 md:pb-16 max-w-7xl mx-auto w-full relative overflow-x-hidden">
        {children}
      </main>
      {/* Mobile tab bar, hidden on desktop */}
      <MobileTabBar />
      {/* Footer hidden on mobile for better UX */}
      <div className="hidden md:block">
        <Footer />
      </div>
      <CookieConsentBanner />
      <ChatButton />
    </div>
  );
}