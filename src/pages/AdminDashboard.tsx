import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminStats, useRealtimeMetrics } from "@/hooks/useAdminStats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SystemHealthCard } from "@/components/admin/SystemHealthCard";
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  FileText, 
  TrendingUp,
  AlertTriangle,
  Shield,
  Database,
  Activity,
  Music,
  Bot,
  Target,
  Clock,
  BookOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { RadioManagement } from "@/components/admin/RadioManagement";
import { RadioPlaylistManager } from "@/components/admin/RadioPlaylistManager";
import { VybbiChat } from "@/components/admin/VybbiChat";
import { VybbiConfig } from "@/components/admin/VybbiConfig";
import { VybbiMonitoring } from "@/components/admin/VybbiMonitoring";
import { VybbiKnowledge } from "@/components/admin/VybbiKnowledge";
import CommunitySeeder from "@/components/admin/CommunitySeeder";
import AdminProspecting from "./AdminProspecting";
import { EmailSystemConfig } from "@/components/admin/EmailSystemConfig";

interface AdminStats {
  totalUsers: number;
  usersByType: Record<string, number>;
  messagesLastWeek: number;
  publishedEvents: number;
  publishedAnnonces: number;
  blogPosts: number;
  pendingModeration: number;
}

export default function AdminDashboard() {
  const { hasRole, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  // Utilisation des hooks optimisés
  const { data: stats, isLoading: statsLoading, error: statsError } = useAdminStats();
  const { data: realtimeMetrics } = useRealtimeMetrics();

  const loading = authLoading || statsLoading;

  // Affichage des erreurs si nécessaire
  useEffect(() => {
    if (statsError) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques administrateur",
        variant: "destructive"
      });
    }
  }, [statsError, toast]);

  if (authLoading || statsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!hasRole('admin')) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Accès Refusé</h2>
            <p className="text-muted-foreground">
              Vous devez être administrateur pour accéder à cette page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quickActions = [
    {
      title: "Modération",
      description: "Gérer les contenus et utilisateurs",
      href: "/admin/moderation",
      icon: Shield,
      color: "text-red-600"
    },
    {
      title: "Communication",
      description: "Articles de blog et actualités",
      href: "/admin/communication", 
      icon: MessageSquare,
      color: "text-blue-600"
    },
    {
      title: "Influenceurs", 
      description: "Gestion des partenaires d'affiliation",
      href: "/admin/influenceurs",
      icon: Users,
      color: "text-purple-600"
    },
    {
      title: "Base de Connaissance",
      description: "Documentation et guides",
      href: "/admin/knowledge",
      icon: BookOpen,
      color: "text-indigo-600"
    },
    {
      title: "Roadmap",
      description: "Planification et développement",
      href: "/admin/roadmap",
      icon: TrendingUp,
      color: "text-green-600"
    }
  ];

  const systemAlerts = [
    {
      type: "warning" as const,
      title: "Protection des mots de passe",
      description: "La protection contre les mots de passe compromis est désactivée",
      action: "Activer la protection"
    },
    {
      type: "warning" as const, 
      title: "Mise à jour PostgreSQL",
      description: "Des correctifs de sécurité sont disponibles",
      action: "Planifier la mise à jour"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord Admin</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble et gestion de la plateforme Vybbi
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          <Activity className="w-4 h-4 mr-1" />
          {stats?.totalUsers || 0} utilisateurs actifs
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="content">Contenus</TabsTrigger>
          <TabsTrigger value="prospecting">Prospection</TabsTrigger>
          <TabsTrigger value="radio">Radio</TabsTrigger>
          <TabsTrigger value="ai">Intelligence Artificielle</TabsTrigger>
          <TabsTrigger value="system">Système</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Métriques principales */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Tous types confondus
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Messages (7j)</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.messagesLastWeek || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Activité de messagerie
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contenus Publiés</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(stats?.publishedEvents || 0) + (stats?.publishedAnnonces || 0) + (stats?.blogPosts || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Événements, annonces, articles
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Modération</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.pendingModeration || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Éléments en attente
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Actions rapides */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {quickActions.map((action) => (
              <Card key={action.title} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                    {action.title}
                  </CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={action.href}>Accéder</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Santé du système */}
          <SystemHealthCard health={stats?.systemHealth || { database: 'ok', security: 'warning', performance: 'warning' }} />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Profils Mocks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Générez des profils de démonstration avec avatars IA
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/admin/mock-profiles">
                    Gérer les Mocks
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Existing users content */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(stats?.usersByType || {}).map(([type, count]) => (
              <Card key={type} className="hover:shadow-md transition-shadow cursor-pointer">
                <Link to={`/admin/moderation?tab=users&type=${type}`} className="block">
                  <CardHeader>
                    <CardTitle className="capitalize flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {type}s
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{count}</div>
                    <p className="text-sm text-muted-foreground">
                      Cliquer pour gérer
                    </p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>

          {/* Quick actions for user management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Gestion Utilisateurs
              </CardTitle>
              <CardDescription>
                Actions rapides pour administrer les comptes utilisateurs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 md:grid-cols-2">
                <Button asChild variant="outline">
                  <Link to="/admin/moderation?tab=users">
                    <Users className="h-4 w-4 mr-2" />
                    Tous les Utilisateurs
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/admin/moderation?tab=users&type=artist">
                    <Users className="h-4 w-4 mr-2" />
                    Artistes Uniquement
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Événements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.publishedEvents || 0}</div>
                <p className="text-sm text-muted-foreground">Événements publiés</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Annonces
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.publishedAnnonces || 0}</div>
                <p className="text-sm text-muted-foreground">Annonces publiées</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Articles Blog
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.blogPosts || 0}</div>
                <p className="text-sm text-muted-foreground">Articles de blog</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prospecting">
          <AdminProspecting />
        </TabsContent>

        <TabsContent value="radio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Gestion Radio Vybbi
              </CardTitle>
              <CardDescription>
                Configuration des playlists, approbation des morceaux et gestion des abonnements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <RadioManagement />
                <RadioPlaylistManager />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Interactions Vybbi
                  </CardTitle>
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">247</div>
                  <p className="text-xs text-muted-foreground">
                    +12% ce mois
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Matchings Réussis
                  </CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">89</div>
                  <p className="text-xs text-muted-foreground">
                    Taux: 76%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Temps Réponse Moyen
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">850ms</div>
                  <p className="text-xs text-muted-foreground">
                    Optimal &lt; 1s
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Statut IA
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">●</div>
                  <p className="text-xs text-muted-foreground">
                    Opérationnel
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="chat" className="space-y-4">
              <TabsList>
                <TabsTrigger value="chat">Chat Vybbi</TabsTrigger>
                <TabsTrigger value="config">Configuration</TabsTrigger>
                <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                <TabsTrigger value="knowledge">Base de Connaissances</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat">
                <VybbiChat />
              </TabsContent>
              
              <TabsContent value="config">
                <VybbiConfig />
              </TabsContent>
              
              <TabsContent value="monitoring">
                <VybbiMonitoring />
              </TabsContent>
              
          <TabsContent value="knowledge">
            <div className="space-y-6">
              <VybbiKnowledge />
              
              <Card>
                <CardHeader>
                  <CardTitle>Initialisation des Communautés</CardTitle>
                  <CardDescription>
                    Créez les communautés par défaut pour animer la plateforme
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CommunitySeeder />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                État du Système
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-green-200 bg-green-50">
                <div>
                  <h4 className="font-medium text-green-800">Base de données</h4>
                  <p className="text-sm text-green-600">Opérationnelle</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  ✓ OK
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border border-orange-200 bg-orange-50">
                <div>
                  <h4 className="font-medium text-orange-800">Sécurité</h4>
                  <p className="text-sm text-orange-600">2 alertes à traiter</p>
                </div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  ⚠ Attention
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-blue-200 bg-blue-50">
                <div>
                  <h4 className="font-medium text-blue-800">Performance</h4>
                  <p className="text-sm text-blue-600">Optimisations recommandées</p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  📈 À améliorer
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Configuration Email SMTP */}
          <EmailSystemConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
}