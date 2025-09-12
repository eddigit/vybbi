
import { AutoTranslate } from "@/components/AutoTranslate";
import { useAuth } from "@/hooks/useAuth";
import ArtistDashboard from "@/pages/ArtistDashboard";
import PartnerDashboard from "@/pages/PartnerDashboard";
import VenueDashboard from "@/pages/VenueDashboard";
import { useState } from "react";
import { Users, Target, Euro, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TimeFilter } from "@/components/dashboard/TimeFilter";
import { AcquisitionChart } from "@/components/dashboard/AcquisitionChart";
import { CommissionDistribution } from "@/components/dashboard/CommissionDistribution";

export default function Dashboard() {
  const { profile, loading, hasRole } = useAuth();
  const [activeFilter, setActiveFilter] = useState("30d");

  const metrics = [
    {
      title: "Total Partenaires",
      value: "0",
      change: "+17%",
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: "Campagnes Actives", 
      value: "0",
      change: "+24%",
      changeType: "positive" as const,
      icon: Target,
    },
    {
      title: "Commissions Payées",
      value: "0 €",
      change: "+7%",
      changeType: "positive" as const,
      icon: Euro,
    },
    {
      title: "Croissance Mensuelle",
      value: "10",
      change: "+16%",
      changeType: "positive" as const,
      icon: TrendingUp,
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="animate-pulse"><AutoTranslate text="Chargement..." /></div>
      </div>
    );
  }

  // Check if user is admin first
  if (hasRole('admin')) {
    // Show admin dashboard with title
    return (
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
  
  if (['agent', 'manager'].includes(profile?.profile_type || '')) {
    return <PartnerDashboard />;
  }

  // Default fallback for unknown profile types
  return (
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
    </div>
  );
}