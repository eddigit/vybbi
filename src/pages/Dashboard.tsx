import { useState } from "react";
import { Users, Target, Euro, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TimeFilter } from "@/components/dashboard/TimeFilter";
import { AcquisitionChart } from "@/components/dashboard/AcquisitionChart";
import { CommissionDistribution } from "@/components/dashboard/CommissionDistribution";

export default function Dashboard() {
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

  return (
    <div className="space-y-6">
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