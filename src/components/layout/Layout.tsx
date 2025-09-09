import { useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { TopNav } from "./TopNav";

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

  // For all other pages (dashboard, agent pages, etc.), use horizontal nav layout
  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <Header />
      <TopNav />
      <main className="flex-1 p-6 pb-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}