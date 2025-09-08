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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/commissions" element={<Commissions />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profiles" element={<Profiles />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/artists" element={<Artists />} />
            <Route path="/artists/:id" element={<ArtistProfile />} />
            <Route path="/lieux" element={<Lieux />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
