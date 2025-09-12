import { useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { TopNav } from "./TopNav";
import { MobileTabBar } from "./MobileTabBar";
import { RadioPlayer } from "../RadioPlayer";

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
        <RadioPlayer />
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
        <RadioPlayer />
      </div>
    );
  }

  // For all other pages (dashboard, agent pages, etc.), use responsive navigation
  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <Header />
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
      <RadioPlayer />
    </div>
  );
}