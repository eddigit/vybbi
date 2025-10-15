
import { useAuth } from "@/hooks/useAuth";
import ArtistDashboard from "@/pages/ArtistDashboard";
import PartnerDashboard from "@/pages/PartnerDashboard";
import VenueDashboard from "@/pages/VenueDashboard";
import InfluenceurDashboard from "@/pages/InfluenceurDashboard";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Users, Target, Euro, TrendingUp, Eye } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TimeFilter } from "@/components/dashboard/TimeFilter";
import { AcquisitionChart } from "@/components/dashboard/AcquisitionChart";
import { CommissionDistribution } from "@/components/dashboard/CommissionDistribution";
import { AutoTranslate } from "@/components/AutoTranslate";
import { WelcomeModal } from "@/components/WelcomeModal";
import { useWelcomeModal } from "@/hooks/useWelcomeModal";
import { LoadingSpinner } from "@/components/LoadingStates";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const { profile, loading, hasRole, user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("30d");
  const { isWelcomeModalOpen, closeWelcomeModal, handleNavigate } = useWelcomeModal();
  
  // États pour les vraies données
  const [totalPartners, setTotalPartners] = useState(0);
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [totalCommissions, setTotalCommissions] = useState(0);
  const [monthlyGrowth, setMonthlyGrowth] = useState(0);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalViews, setTotalViews] = useState(0);

  // Charger les vraies données depuis la base
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        // Compter les partenaires (agents + managers)
        const { count: partnersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .in('profile_type', ['agent', 'manager']);

        // Compter les annonces publiées (comme "campagnes actives")
        const { count: campaignsCount } = await supabase
          .from('annonces')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published');

        // Calculer les commissions payées
        const { data: commissions } = await supabase
          .from('affiliate_conversions')
          .select('commission_amount')
          .eq('conversion_status', 'confirmed');

        const totalCommissionsAmount = commissions?.reduce(
          (sum, conv) => sum + (Number(conv.commission_amount) || 0), 
          0
        ) || 0;

        // Calculer la croissance mensuelle (nouveaux utilisateurs ce mois)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { count: newUsersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', thirtyDaysAgo.toISOString());

        // Compter les utilisateurs (profils)
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Compter les vues totales de profils (visites)
        const { count: viewsCount } = await supabase
          .from('profile_views')
          .select('*', { count: 'exact', head: true });

        setTotalPartners(partnersCount || 0);
        setTotalCampaigns(campaignsCount || 0);
        setTotalCommissions(totalCommissionsAmount);
        setMonthlyGrowth(newUsersCount || 0);
        setTotalUsers(usersCount || 0);
        setTotalViews(viewsCount || 0);
      } catch (error) {
        console.error("Erreur lors du chargement des métriques:", error);
      } finally {
        setMetricsLoading(false);
      }
    };

    loadMetrics();
  }, []);

  const metrics = [
    {
      title: "Total Partenaires",
      value: metricsLoading ? "..." : totalPartners.toString(),
      change: "+17%",
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: "Campagnes Actives", 
      value: metricsLoading ? "..." : totalCampaigns.toString(),
      change: "+24%",
      changeType: "positive" as const,
      icon: Target,
    },
    {
      title: "Commissions Payées",
      value: metricsLoading ? "..." : `${totalCommissions.toFixed(2)} €`,
      change: "+7%",
      changeType: "positive" as const,
      icon: Euro,
    },
    {
      title: "Croissance Mensuelle",
      value: metricsLoading ? "..." : monthlyGrowth.toString(),
      change: "+16%",
      changeType: "positive" as const,
      icon: TrendingUp,
    },
  ];

  // Métriques additionnelles pour les administrateurs
  const adminMetrics = [
    ...metrics,
    {
      title: "Membres inscrits",
      value: metricsLoading ? "..." : totalUsers.toString(),
      change: "+3%",
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: "Visites de profils",
      value: metricsLoading ? "..." : totalViews.toString(),
      change: "+9%",
      changeType: "positive" as const,
      icon: Eye,
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <LoadingSpinner size="lg" text="Chargement de votre tableau de bord..." />
      </div>
    );
  }

  // Redirect to home if not authenticated
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Check if user is admin first
  if (hasRole('admin')) {
    // Show admin dashboard with title
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <AutoTranslate text="Tableau de Bord Admin" />
          </h1>
          <p className="text-muted-foreground">
            <AutoTranslate text="Bienvenue Admin - Vue d'ensemble de la plateforme" />
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex justify-end">
          <TimeFilter 
            activeFilter={activeFilter} 
            onFilterChange={setActiveFilter} 
          />
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {adminMetrics.map((metric) => (
            <MetricCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              change={metric.change}
              changeType={metric.changeType}
              icon={metric.icon}
            />
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <AcquisitionChart />
          <CommissionDistribution />
        </div>
        
        
        {/* Welcome Modal */}
        {profile && (
          <WelcomeModal
            isOpen={isWelcomeModalOpen}
            onClose={closeWelcomeModal}
            profileType={profile.profile_type}
            displayName={profile.display_name}
            profileId={profile.id}
            onNavigate={handleNavigate}
          />
        )}
      </div>
      </div>
    );
  }

  // Redirect to appropriate dashboard based on profile type
  if (profile?.profile_type === 'artist') {
    return <ArtistDashboard />;
  }
  
  if (profile?.profile_type === 'lieu') {
    return <VenueDashboard />;
  }
  
  if (profile?.profile_type === 'influenceur') {
    return <InfluenceurDashboard />;
  }
  
  if (['agent', 'manager'].includes(profile?.profile_type || '')) {
    return <PartnerDashboard />;
  }

  // Default fallback for unknown profile types
  return (
    <div className="container mx-auto p-6">
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight"><AutoTranslate text="Tableau de Bord" /></h1>
        <p className="text-muted-foreground">
          <AutoTranslate text="Vue d'ensemble de votre activité" />
        </p>
      </div>

      {/* Time Filter */}
      <div className="flex justify-end">
        <TimeFilter 
          activeFilter={activeFilter} 
          onFilterChange={setActiveFilter} 
        />
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            changeType={metric.changeType}
            icon={metric.icon}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <AcquisitionChart />
        <CommissionDistribution />
        </div>
        
        
        {/* Welcome Modal */}
        {profile && (
          <WelcomeModal
            isOpen={isWelcomeModalOpen}
            onClose={closeWelcomeModal}
            profileType={profile.profile_type}
            displayName={profile.display_name}
            profileId={profile.id}
            onNavigate={handleNavigate}
          />
        )}
      </div>
    </div>
  );
  }