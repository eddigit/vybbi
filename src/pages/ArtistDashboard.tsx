import { useState, useEffect } from "react";
import { Calendar, Music, Users, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord artiste</h1>
          <p className="text-muted-foreground">Bienvenue {profile?.display_name}</p>
        </div>
        <Button asChild>
          <Link to={`/artists/${profile?.id}`}>
            Voir mon profil public
          </Link>
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              <p className="text-xs text-muted-foreground">
                <span className={
                  metric.changeType === "positive" ? "text-green-600" :
                  metric.changeType === "negative" ? "text-red-600" :
                  "text-yellow-600"
                }>
                  {metric.change}
                </span>
                {" "}par rapport au mois dernier
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mes candidatures</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Gérez vos candidatures aux annonces
            </p>
            <Button className="w-full" variant="outline" asChild>
              <Link to="/annonces">Voir les annonces</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mon profil</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Mettez à jour vos informations et médias
            </p>
            <Button className="w-full" variant="outline" asChild>
              <Link to={`/artists/${profile?.id}/edit`}>Modifier le profil</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Consultez vos conversations
            </p>
            <Button className="w-full" variant="outline" asChild>
              <Link to="/messages">Voir les messages</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}