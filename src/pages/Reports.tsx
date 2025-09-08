import { BarChart3, Download, FileText, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AcquisitionChart } from "@/components/dashboard/AcquisitionChart";
import { CommissionDistribution } from "@/components/dashboard/CommissionDistribution";
import { TimeFilter } from "@/components/dashboard/TimeFilter";
import { useState } from "react";

export default function Reports() {
  const [activeFilter, setActiveFilter] = useState("30d");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rapports et Analyses</h1>
          <p className="text-muted-foreground">Analysez les performances de vos partenariats musicaux</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Rapport Personnalisé
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Download className="w-4 h-4 mr-2" />
            Exporter PDF
          </Button>
        </div>
      </div>

      {/* Time Filter */}
      <div className="flex justify-end">
        <TimeFilter 
          activeFilter={activeFilter} 
          onFilterChange={setActiveFilter} 
        />
      </div>

      {/* KPIs Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">ROI Global</CardTitle>
            <div className="text-2xl font-bold text-success">+247%</div>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Taux de Conversion</CardTitle>
            <div className="text-2xl font-bold text-primary">18.5%</div>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">CPA Moyen</CardTitle>
            <div className="text-2xl font-bold text-warning">45€</div>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Revenus Générés</CardTitle>
            <div className="text-2xl font-bold text-foreground">156,780€</div>
          </CardHeader>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6">
        <AcquisitionChart />
        
        <div className="grid gap-6 md:grid-cols-2">
          <CommissionDistribution />
          
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Performance par Type d'Événement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Festivals</span>
                  <span className="text-foreground font-medium">42%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Clubs</span>
                  <span className="text-foreground font-medium">35%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{ width: '35%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bars/Restaurants</span>
                  <span className="text-foreground font-medium">23%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-warning h-2 rounded-full" style={{ width: '23%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performers */}
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-muted/20 rounded-lg border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground">DJ Marco</h4>
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
                <p className="text-2xl font-bold text-success">4,250€</p>
                <p className="text-sm text-muted-foreground">Commissions générées</p>
              </div>
              <div className="p-4 bg-muted/20 rounded-lg border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground">Sound Events</h4>
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
                <p className="text-2xl font-bold text-primary">89</p>
                <p className="text-sm text-muted-foreground">Conversions réalisées</p>
              </div>
              <div className="p-4 bg-muted/20 rounded-lg border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground">Night Promotions</h4>
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
                <p className="text-2xl font-bold text-warning">24.5%</p>
                <p className="text-sm text-muted-foreground">Taux de conversion</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}