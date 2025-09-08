import { useState } from "react";
import { Plus, Calendar, Target, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const campaigns = [
  {
    id: 1,
    name: "Festival d'Été 2025",
    type: "Événement",
    status: "Active",
    budget: "15,000€",
    spent: "8,500€",
    progress: 57,
    partners: 24,
    conversions: 156,
    startDate: "01 Jun 2025",
    endDate: "31 Aug 2025"
  },
  {
    id: 2,
    name: "Tournée Club Automne", 
    type: "Tournée",
    status: "Planifiée",
    budget: "8,000€",
    spent: "0€",
    progress: 0,
    partners: 12,
    conversions: 0,
    startDate: "15 Sep 2025",
    endDate: "15 Dec 2025"
  },
  {
    id: 3,
    name: "Résidence DJ Hiver",
    type: "Résidence",
    status: "Active", 
    budget: "5,500€",
    spent: "3,200€",
    progress: 58,
    partners: 8,
    conversions: 89,
    startDate: "01 Dec 2024",
    endDate: "28 Feb 2025"
  }
];

export default function Campaigns() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-success/20 text-success border-success/30">Active</Badge>;
      case "Planifiée":
        return <Badge className="bg-primary/20 text-primary border-primary/30">Planifiée</Badge>;
      case "Terminée":
        return <Badge className="bg-muted">Terminée</Badge>;
      case "Suspendue":
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Suspendue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      "Événement": "bg-primary/20 text-primary border-primary/30",
      "Tournée": "bg-success/20 text-success border-success/30",
      "Résidence": "bg-warning/20 text-warning border-warning/30"
    };
    return <Badge className={colors[type as keyof typeof colors] || "bg-muted"}>{type}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des Campagnes</h1>
          <p className="text-muted-foreground">Créez et gérez vos campagnes d'affiliation musicales</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Campagne
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Campagnes Actives</CardTitle>
            <div className="text-2xl font-bold text-foreground">8</div>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Budget Total</CardTitle>
            <div className="text-2xl font-bold text-foreground">28,500€</div>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Dépensé</CardTitle>
            <div className="text-2xl font-bold text-warning">11,700€</div>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Conversions</CardTitle>
            <div className="text-2xl font-bold text-success">245</div>
          </CardHeader>
        </Card>
      </div>

      {/* Campaign Cards */}
      <div className="grid gap-6">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-foreground">{campaign.name}</CardTitle>
                    {getTypeBadge(campaign.type)}
                    {getStatusBadge(campaign.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {campaign.startDate} - {campaign.endDate}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Gérer
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Budget Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Budget utilisé</span>
                  <span className="text-foreground font-medium">
                    {campaign.spent} / {campaign.budget}
                  </span>
                </div>
                <Progress value={campaign.progress} className="h-2" />
              </div>

              {/* Campaign Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/50">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="w-4 h-4 text-primary mr-1" />
                  </div>
                  <div className="text-lg font-bold text-foreground">{campaign.partners}</div>
                  <div className="text-xs text-muted-foreground">Partenaires</div>
                </div>
                <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/50">
                  <div className="flex items-center justify-center mb-1">
                    <Target className="w-4 h-4 text-success mr-1" />
                  </div>
                  <div className="text-lg font-bold text-foreground">{campaign.conversions}</div>
                  <div className="text-xs text-muted-foreground">Conversions</div>
                </div>
                <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/50">
                  <div className="flex items-center justify-center mb-1">
                    <TrendingUp className="w-4 h-4 text-warning mr-1" />
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    {campaign.conversions > 0 ? ((campaign.conversions / campaign.partners) * 100).toFixed(1) : 0}%
                  </div>
                  <div className="text-xs text-muted-foreground">Taux</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}