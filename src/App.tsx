import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Partners from "./pages/Partners";
import Campaigns from "./pages/Campaigns";
import Commissions from "./pages/Commissions";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Profiles from "./pages/Profiles";
import Messages from "./pages/Messages";
import Artists from "./pages/Artists";
import Lieux from "./pages/Lieux";
import ArtistProfile from "./pages/ArtistProfile";
import ArtistProfileEdit from "./pages/ArtistProfileEdit";
import { AgentProfileEdit } from "./pages/AgentProfileEdit";
import { ManagerProfileEdit } from "./pages/ManagerProfileEdit";
import { AnnonceManager } from "./pages/AnnonceManager";
import { AnnoncesWall } from "./pages/AnnoncesWall";
import Landing from "./pages/Landing";
import Promotion from "./pages/Promotion";
import VenueProfile from "./pages/VenueProfile";
import PartnerProfile from "./pages/PartnerProfile";
import PourArtistes from "./pages/PourArtistes";
import PourAgentsManagers from "./pages/PourAgentsManagers";
import PourLieuxEvenements from "./pages/PourLieuxEvenements";
import MyArtists from "./pages/MyArtists";
import NosArtistes from "./pages/NosArtistes";
import AccesComplet from "./pages/AccesComplet";
import EventsManager from "./pages/EventsManager";
import VenueProfileEdit from "./pages/VenueProfileEdit";
import AdminRoadmap from "./pages/AdminRoadmap";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/commissions" element={<Commissions />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profiles" element={<Profiles />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/artists" element={<Artists />} />
            <Route path="/artists/:id" element={<ArtistProfile />} />
            <Route path="/artists/:id/edit" element={<ArtistProfileEdit />} />
            <Route path="/agents/:id/edit" element={<AgentProfileEdit />} />
            <Route path="/agents/:id/artists" element={<MyArtists />} />
            <Route path="/managers/:id/edit" element={<ManagerProfileEdit />} />
            <Route path="/managers/:id/artists" element={<MyArtists />} />
            <Route path="/partners/:id" element={<PartnerProfile />} />
            <Route path="/annonces" element={<AnnoncesWall />} />
            <Route path="/annonces/manager" element={<AnnonceManager />} />
            <Route path="/lieux" element={<Lieux />} />
            <Route path="/lieux/:id" element={<VenueProfile />} />
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
        <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
