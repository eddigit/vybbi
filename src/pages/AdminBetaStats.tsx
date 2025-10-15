import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  TrendingUp, 
  Activity, 
  Calendar,
  Music,
  Building2,
  UserCheck,
  MessageSquare,
  Target,
  Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/LoadingStates";

interface BetaStats {
  totalUsers: number;
  totalProfiles: number;
  totalArtists: number;
  totalVenues: number;
  totalAgents: number;
  totalMessages: number;
  totalAnnonces: number;
  totalViews: number;
  activeUsers7Days: number;
  activeUsers30Days: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

export default function AdminBetaStats() {
  const { toast } = useToast();
  const [stats, setStats] = useState<BetaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Récupérer toutes les statistiques en parallèle
      const [
        usersResult,
        profilesResult,
        artistsResult,
        venuesResult,
        agentsResult,
        messagesResult,
        annoncesResult,
        viewsResult,
        activeUsers7,
        activeUsers30,
        newUsersWeek,
        newUsersMonth
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_public', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('profile_type', 'artist'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('profile_type', 'lieu'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('profile_type', 'agent'),
        supabase.from('messages').select('*', { count: 'exact', head: true }),
        supabase.from('annonces').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('profile_views').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('last_seen_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('last_seen_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        totalProfiles: profilesResult.count || 0,
        totalArtists: artistsResult.count || 0,
        totalVenues: venuesResult.count || 0,
        totalAgents: agentsResult.count || 0,
        totalMessages: messagesResult.count || 0,
        totalAnnonces: annoncesResult.count || 0,
        totalViews: viewsResult.count || 0,
        activeUsers7Days: activeUsers7.count || 0,
        activeUsers30Days: activeUsers30.count || 0,
        newUsersThisWeek: newUsersWeek.count || 0,
        newUsersThisMonth: newUsersMonth.count || 0
      });
    } catch (error) {
      console.error("Erreur lors du chargement des stats:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <LoadingSpinner size="lg" text="Chargement des statistiques..." />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Aucune donnée disponible</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Statistiques Bêta</h2>
        <p className="text-muted-foreground">
          Vue d'ensemble des métriques de la plateforme en version bêta
        </p>
      </div>

      {/* Métriques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Totaux</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newUsersThisMonth} ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profils Publics</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProfiles}</div>
            <p className="text-xs text-muted-foreground">
              Profils visibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actifs (30j)</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeUsers30Days}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers7Days} cette semaine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vues Totales</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground">
              Visites de profils
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="profiles">Profils</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Croissance Utilisateurs</CardTitle>
                <CardDescription>Nouveaux utilisateurs par période</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Cette semaine</span>
                  </div>
                  <Badge variant="secondary">+{stats.newUsersThisWeek}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Ce mois</span>
                  </div>
                  <Badge variant="secondary">+{stats.newUsersThisMonth}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Taux de croissance</span>
                  </div>
                  <Badge className="bg-green-500">
                    {stats.totalUsers > 0 ? ((stats.newUsersThisMonth / stats.totalUsers) * 100).toFixed(1) : 0}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activité Plateforme</CardTitle>
                <CardDescription>Métriques d'engagement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Messages envoyés</span>
                  </div>
                  <Badge variant="outline">{stats.totalMessages}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Annonces publiées</span>
                  </div>
                  <Badge variant="outline">{stats.totalAnnonces}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Vues de profils</span>
                  </div>
                  <Badge variant="outline">{stats.totalViews}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profiles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Artistes</CardTitle>
                <Music className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalArtists}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalUsers > 0 ? ((stats.totalArtists / stats.totalUsers) * 100).toFixed(1) : 0}% du total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lieux</CardTitle>
                <Building2 className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalVenues}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalUsers > 0 ? ((stats.totalVenues / stats.totalUsers) * 100).toFixed(1) : 0}% du total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Agents</CardTitle>
                <Users className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAgents}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalUsers > 0 ? ((stats.totalAgents / stats.totalUsers) * 100).toFixed(1) : 0}% du total
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métriques d'Engagement</CardTitle>
              <CardDescription>Indicateurs clés de performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Taux d'activation profil</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.totalUsers > 0 ? ((stats.totalProfiles / stats.totalUsers) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary"
                    style={{ width: `${stats.totalUsers > 0 ? (stats.totalProfiles / stats.totalUsers) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Utilisateurs actifs (30j)</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.totalUsers > 0 ? ((stats.activeUsers30Days / stats.totalUsers) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500"
                    style={{ width: `${stats.totalUsers > 0 ? (stats.activeUsers30Days / stats.totalUsers) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Engagement messagerie</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.totalUsers > 0 ? (stats.totalMessages / stats.totalUsers).toFixed(1) : 0} msg/user
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500"
                    style={{ width: `${Math.min((stats.totalMessages / (stats.totalUsers * 10)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
