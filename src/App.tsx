import { TranslationProvider } from "@/contexts/TranslationContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { ScrollToTop } from "@/components/ScrollToTop";
import { RadioPlayer } from "@/components/RadioPlayer";
import { PerformanceOptimizer, ConnectionOptimizer } from './components/PerformanceOptimizer';
import { ErrorBoundary } from './components/ErrorBoundary';
import Dashboard from "./pages/Dashboard";
import Partners from "./pages/Partners";
import Campaigns from "./pages/Campaigns";
import Commissions from "./pages/Commissions";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Profiles from "./pages/Profiles";
import Messages from "./pages/Messages";
import Communities from "./pages/Communities";
import CommunityChat from "./pages/CommunityChat";
import Artists from "./pages/Artists";
import Lieux from "./pages/Lieux";
import ArtistProfile from "./pages/ArtistProfile";
import ArtistProfileBySlug from "./pages/ArtistProfileBySlug";
import ArtistProfileEdit from "./pages/ArtistProfileEdit";
import { AgentProfileEdit } from "./pages/AgentProfileEdit";
import { ManagerProfileEdit } from "./pages/ManagerProfileEdit";
import { AnnonceManager } from "./pages/AnnonceManager";
import { AnnoncesWall } from "./pages/AnnoncesWall";
import Landing from "./pages/Landing";
import Promotion from "./pages/Promotion";
import VenueProfile from "./pages/VenueProfile";
import VenueProfileBySlug from "./pages/VenueProfileBySlug";
import PartnerProfile from "./pages/PartnerProfile";
import PartnerProfileBySlug from "./pages/PartnerProfileBySlug";
import AgentProfile from "./pages/AgentProfile";
import ManagerProfile from "./pages/ManagerProfile";
import PourArtistes from "./pages/PourArtistes";
import PourAgentsManagers from "./pages/PourAgentsManagers";
import PourLieuxEvenements from "./pages/PourLieuxEvenements";
import MyArtists from "./pages/MyArtists";
import NosArtistes from "./pages/NosArtistes";
import AccesComplet from "./pages/AccesComplet";
import EventsManager from "./pages/EventsManager";
import VenueProfileEdit from "./pages/VenueProfileEdit";
import AdminRoadmap from "./pages/AdminRoadmap";
import AdminModeration from "./pages/AdminModeration";
import Demo from "./pages/Demo";
import Partenariats from "./pages/Partenariats";
import Parrainage from "./pages/Parrainage";
import Influenceurs from "./pages/Influenceurs";
import AdminCommunication from "./pages/AdminCommunication";
import AdminDashboard from "./pages/AdminDashboard";
import Blog from "./pages/Blog";
import BlogPost from './pages/BlogPost';
import Technologie from './pages/Technologie';
import Fondateurs from './pages/Fondateurs';
import APropos from './pages/APropos';
import AdminAds from './pages/AdminAds';
import TopArtistes from './pages/TopArtistes';
import InscriptionConfirmation from './pages/InscriptionConfirmation';
import Onboarding from './pages/Onboarding';
import RechercheAvancee from './pages/RechercheAvancee';
import InfluenceurDashboard from './pages/InfluenceurDashboard';
import AdminInfluenceurs from './pages/AdminInfluenceurs';
import AdminKnowledge from './pages/AdminKnowledge';
import AdminEmailDiagnostics from './pages/AdminEmailDiagnostics';
import AdminMockProfiles from './pages/AdminMockProfiles';
import AuthCallback from './pages/AuthCallback';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Notifications from './pages/Notifications';
import Fonctionnalites from './pages/Fonctionnalites';
import Tarifs from './pages/Tarifs';
import CentreAide from './pages/CentreAide';
import Confidentialite from './pages/Confidentialite';
import Conditions from './pages/Conditions';
import CookiesPage from './pages/Cookies';
import Contact from './pages/Contact';

// Configure React Query with optimizations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = error.status as number;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false, // Avoid unnecessary refetches
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

const AuthHashRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (!location.hash) return;
    const hash = location.hash.startsWith('#') ? location.hash.slice(1) : location.hash;
    const params = new URLSearchParams(hash);
    const hasAuthParams = params.has('error') || params.has('error_code') || params.has('access_token') || params.has('refresh_token') || params.has('code') || params.has('token') || params.has('token_hash') || params.has('type');
    if (hasAuthParams && location.pathname !== '/auth/callback') {
      navigate({ pathname: '/auth/callback', search: location.search, hash: location.hash }, { replace: true });
    }
  }, [location, navigate]);
  return null;
};

// App component - optimized architecture with performance enhancements
const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TranslationProvider>
          <ConnectionOptimizer>
            <PerformanceOptimizer>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <AuthHashRedirect />
                  <ScrollToTop />
                  <Layout>
                    <Routes>
                      {/* SEO-friendly slug URLs */}
                      <Route path="/artistes/:slug" element={<ArtistProfileBySlug />} />
                      <Route path="/lieux/:slug" element={<VenueProfileBySlug />} />
                      <Route path="/partners/:slug" element={<PartnerProfileBySlug />} />
                      
                      {/* Legacy UUID URLs for backwards compatibility */}
                      <Route path="/artists/:id" element={<ArtistProfile />} />
                      <Route path="/lieux/:id" element={<VenueProfile />} />
                      <Route path="/partners/:id" element={<PartnerProfile />} />
                      <Route path="/agents/:id" element={<PartnerProfile />} />
                      <Route path="/managers/:id" element={<PartnerProfile />} />
                      
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/partners" element={<Partners />} />
                      <Route path="/campaigns" element={<Campaigns />} />
                      <Route path="/commissions" element={<Commissions />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/auth/callback" element={<AuthCallback />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/inscription/confirmation" element={<InscriptionConfirmation />} />
                      <Route path="/onboarding" element={<Onboarding />} />
                      <Route path="/profiles" element={<Profiles />} />
                      <Route path="/messages" element={<Messages />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/communities" element={<Communities />} />
                      <Route path="/community/:communityId" element={<CommunityChat />} />
                      <Route path="/artists" element={<Artists />} />
                      <Route path="/artists/:id/edit" element={<ArtistProfileEdit />} />
                      <Route path="/agents/:id/edit" element={<AgentProfileEdit />} />
                      <Route path="/agents/:id/artists" element={<MyArtists />} />
                      <Route path="/managers/:id/edit" element={<ManagerProfileEdit />} />
                      <Route path="/managers/:id/artists" element={<MyArtists />} />
                      <Route path="/annonces" element={<AnnoncesWall />} />
                      <Route path="/annonces/manager" element={<AnnonceManager />} />
                      <Route path="/lieux" element={<Lieux />} />
                      <Route path="/promotion" element={<Promotion />} />
                      <Route path="/pour-artistes" element={<PourArtistes />} />
                      <Route path="/pour-agents-managers" element={<PourAgentsManagers />} />
                      <Route path="/pour-lieux-evenements" element={<PourLieuxEvenements />} />
                      <Route path="/nos-artistes" element={<NosArtistes />} />
                      <Route path="/voir-plus" element={<AccesComplet />} />
                      <Route path="/" element={<Landing />} />
                      <Route path="/events" element={<EventsManager />} />
                      <Route path="/lieux/:id/edit" element={<VenueProfileEdit />} />
                      <Route path="/admin/roadmap" element={<AdminRoadmap />} />
                      <Route path="/admin/moderation" element={<AdminModeration />} />
                      <Route path="/demo" element={<Demo />} />
                      <Route path="/partenariats" element={<Partenariats />} />
                      <Route path="/parrainage" element={<Parrainage />} />
                      <Route path="/influenceurs" element={<Influenceurs />} />
                      <Route path="/admin/communication" element={<AdminCommunication />} />
                      <Route path="/admin/dashboard" element={<AdminDashboard />} />
                      <Route path="/admin/ads" element={<AdminAds />} />
                      <Route path="/admin/influenceurs" element={<AdminInfluenceurs />} />
                      <Route path="/admin/knowledge" element={<AdminKnowledge />} />
                      <Route path="/admin/email-diagnostics" element={<AdminEmailDiagnostics />} />
                      <Route path="/admin/mock-profiles" element={<AdminMockProfiles />} />
                      <Route path="/affiliation" element={<InfluenceurDashboard />} />
                      <Route path="/influenceurs/:slug" element={<ArtistProfileBySlug />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/blog/:slug" element={<BlogPost />} />
                      <Route path="/technologie" element={<Technologie />} />
                      <Route path="/fondateurs" element={<Fondateurs />} />
                      <Route path="/a-propos" element={<APropos />} />
                      <Route path="/top-artistes" element={<TopArtistes />} />
                      <Route path="/recherche-avancee" element={<RechercheAvancee />} />
                      <Route path="/fonctionnalites" element={<Fonctionnalites />} />
                      <Route path="/tarifs" element={<Tarifs />} />
                      <Route path="/centre-aide" element={<CentreAide />} />
                      <Route path="/confidentialite" element={<Confidentialite />} />
                      <Route path="/conditions" element={<Conditions />} />
                      <Route path="/cookies" element={<CookiesPage />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                  <RadioPlayer />
                </BrowserRouter>
              </TooltipProvider>
            </PerformanceOptimizer>
          </ConnectionOptimizer>
        </TranslationProvider>
      </HelmetProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
