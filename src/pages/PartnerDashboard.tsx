import { useState, useEffect } from "react";
import { Users, FileText, MessageCircle, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { WelcomeModal } from '@/components/WelcomeModal';
import { useWelcomeModal } from '@/hooks/useWelcomeModal';

export default function PartnerDashboard() {
  const { profile } = useAuth();
  const { isWelcomeModalOpen, closeWelcomeModal, handleNavigate } = useWelcomeModal();
  const [stats, setStats] = useState({
    totalAnnonces: 0,
    activeAnnonces: 0,
    totalApplications: 0,
    managedArtists: 0
  });

  useEffect(() => {
    if (profile) {
      fetchPartnerStats();
    }
  }, [profile]);

  const fetchPartnerStats = async () => {
    if (!profile) return;

    try {
      // Fetch annonces created by this partner
      const { data: annoncesData } = await supabase
        .from('annonces')
        .select('status')
        .eq('user_id', profile.user_id);

      if (annoncesData) {
        const total = annoncesData.length;
        const active = annoncesData.filter(annonce => annonce.status === 'published').length;

        // Fetch applications for partner's annonces
        const { data: applicationsData } = await supabase
          .from('applications')
          .select('id')
          .in('annonce_id', annoncesData.map((a: any) => a.id));

        // Fetch managed artists (for agents/managers)
        let managedArtists = 0;
        if (profile.profile_type === 'agent') {
          const { data: agentArtists } = await supabase
            .from('agent_artists')
            .select('id')
            .eq('agent_profile_id', profile.id);
          managedArtists = agentArtists?.length || 0;
        } else if (profile.profile_type === 'manager') {
          const { data: managerArtists } = await supabase
            .from('manager_artists')
            .select('id')
            .eq('manager_profile_id', profile.id);
          managedArtists = managerArtists?.length || 0;
        }

        setStats({
          totalAnnonces: total,
          activeAnnonces: active,
          totalApplications: applicationsData?.length || 0,
          managedArtists
        });
      }
    } catch (error) {
      console.error('Error fetching partner stats:', error);
    }
  };

  const getPartnerTypeLabel = () => {
    switch (profile?.profile_type) {
      case 'agent':
        return 'Agent';
      case 'manager':
        return 'Manager';
      case 'lieu':
        return 'Lieu';
      default:
        return 'Partenaire';
    }
  };

  const metrics = [
    {
      title: "Annonces publiées",
      value: stats.totalAnnonces.toString(),
      change: "+15%",
      changeType: "positive" as const,
      icon: FileText,
    },
    {
      title: "Annonces actives", 
      value: stats.activeAnnonces.toString(),
      change: "+8%",
      changeType: "positive" as const,
      icon: Target,
    },
    {
      title: "Candidatures reçues",
      value: stats.totalApplications.toString(),
      change: "+23%",
      changeType: "positive" as const,
      icon: MessageCircle,
    },
    {
      title: profile?.profile_type === 'lieu' ? "Événements organisés" : "Artistes gérés",
      value: stats.managedArtists.toString(),
      change: "+5%",
      changeType: "positive" as const,
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord {getPartnerTypeLabel().toLowerCase()}</h1>
          <p className="text-muted-foreground">Bienvenue {profile?.display_name}</p>
        </div>
        <Button asChild>
          <Link to={`/partners/${profile?.id}`}>
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
            <CardTitle>Mes annonces</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Créez et gérez vos annonces
            </p>
            <Button className="w-full" variant="outline" asChild>
              <Link to="/annonces">Gérer les annonces</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mon profil</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Mettez à jour vos informations
            </p>
            <Button className="w-full" variant="outline" asChild>
              <Link to={
                profile?.profile_type === 'agent' ? `/agents/${profile?.id}/edit` :
                profile?.profile_type === 'manager' ? `/managers/${profile?.id}/edit` :
                `/lieux/${profile?.id}`
              }>
                Modifier le profil
              </Link>
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
      
      {/* Welcome Modal */}
      {profile && (
        <WelcomeModal
          isOpen={isWelcomeModalOpen}
          onClose={closeWelcomeModal}
          profileType={profile.profile_type}
          displayName={profile.display_name}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}