import { useState, useEffect } from "react";
import { Calendar, Music, Users, Eye, TrendingUp, TrendingDown, MessageSquare, Edit } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArtistRepresentationRequests } from "@/components/ArtistRepresentationRequests";
import { ProfileVisitors } from "@/components/ProfileVisitors";
import { ProfileViewStatsCard } from "@/components/ProfileViewStatsCard";

export default function ArtistDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    profileViews: 0
  });

  useEffect(() => {
    if (profile) {
      fetchArtistStats();
    }
  }, [profile]);

  const fetchArtistStats = async () => {
    if (!profile) return;

    try {
      // Fetch applications for this artist
      const { data: applicationsData } = await supabase
        .from('applications')
        .select('status')
        .eq('applicant_id', profile.id);

      if (applicationsData) {
        const total = applicationsData.length;
        const pending = applicationsData.filter(app => app.status === 'pending').length;
        const accepted = applicationsData.filter(app => app.status === 'accepted').length;

        setStats({
          totalApplications: total,
          pendingApplications: pending,
          acceptedApplications: accepted,
          profileViews: 0 // Cette métrique pourrait être ajoutée plus tard
        });
      }
    } catch (error) {
      console.error('Error fetching artist stats:', error);
    }
  };

  const metrics = [
    {
      title: "Candidatures totales",
      value: stats.totalApplications.toString(),
      change: "+12%",
      changeType: "positive" as const,
      icon: Music,
    },
    {
      title: "En attente", 
      value: stats.pendingApplications.toString(),
      change: "+5%",
      changeType: "positive" as const,
      icon: Calendar,
    },
    {
      title: "Acceptées",
      value: stats.acceptedApplications.toString(),
      change: "+3%",
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: "Vues du profil",
      value: stats.profileViews.toString(),
      change: "+8%",
      changeType: "positive" as const,
      icon: Eye,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord artiste</h1>
          <p className="text-muted-foreground">Bienvenue {profile?.display_name}</p>
        </div>
        {profile && (
          <Button asChild>
            <Link to={`/artistes/${profile.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              Voir mon profil public
            </Link>
          </Button>
        )}
      </div>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="visitors">Qui visite mon profil</TabsTrigger>
          <TabsTrigger value="requests">Demandes de représentation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {metrics.map((metric) => (
              <Card key={metric.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {metric.title}
                  </CardTitle>
                  <metric.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    {metric.changeType === 'positive' ? (
                      <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                    )}
                    <span className={
                      metric.changeType === "positive" ? "text-emerald-500" :
                      metric.changeType === "negative" ? "text-red-500" :
                      "text-muted-foreground"
                    }>
                      {metric.change}
                    </span>
                    <span className="ml-1">ce mois-ci</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Profile Views Stats Card */}
            {profile && (
              <ProfileViewStatsCard profileId={profile.id} />
            )}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
              <CardDescription>
                Accès rapide aux fonctionnalités importantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/annonces">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <h3 className="font-medium">Gérer mes candidatures</h3>
                      <p className="text-sm text-muted-foreground">Voir et gérer toutes mes candidatures</p>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link to="/artist-profile-edit">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <Edit className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <h3 className="font-medium">Éditer mon profil</h3>
                      <p className="text-sm text-muted-foreground">Mettre à jour mes informations</p>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link to="/messages">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <h3 className="font-medium">Messages</h3>
                      <p className="text-sm text-muted-foreground">Voir mes conversations</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visitors" className="space-y-6">
          {profile && <ProfileVisitors profileId={profile.id} />}
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Demandes de représentation</CardTitle>
              <CardDescription>
                Gérez les demandes d'agents et managers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ArtistRepresentationRequests />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}