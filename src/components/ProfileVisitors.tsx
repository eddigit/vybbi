import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, MessageCircle, TrendingUp, Users } from 'lucide-react';
import { useProfileViewStats, useProfileVisitors } from '@/hooks/useProfileTracking';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ProfileVisitorsProps {
  profileId: string;
}

export function ProfileVisitors({ profileId }: ProfileVisitorsProps) {
  const [stats, setStats] = useState<any>(null);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchStats } = useProfileViewStats(profileId);
  const { fetchVisitors } = useProfileVisitors(profileId);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [statsData, visitorsData] = await Promise.all([
          fetchStats(),
          fetchVisitors()
        ]);
        
        setStats(statsData);
        setVisitors(visitorsData);
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [profileId]);

  const startConversation = async (targetUserId: string, targetName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour envoyer un message.",
          variant: "destructive"
        });
        return;
      }

      const { data: conversationId, error } = await supabase.rpc('start_direct_conversation', {
        target_user_id: targetUserId
      });

      if (error) throw error;

      window.location.href = `/messages?conversation=${conversationId}`;
      
      toast({
        title: "Message envoyé",
        description: `Conversation démarrée avec ${targetName}`,
      });
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de démarrer la conversation",
        variant: "destructive"
      });
    }
  };

  const getProfileTypeLabel = (type: string) => {
    switch (type) {
      case 'agent': return 'Agent';
      case 'manager': return 'Manager';
      case 'lieu': return 'Lieu';
      case 'artist': return 'Artiste';
      default: return type;
    }
  };

  const getProfileTypeColor = (type: string) => {
    switch (type) {
      case 'agent': return 'bg-blue-100 text-blue-800';
      case 'manager': return 'bg-green-100 text-green-800';
      case 'lieu': return 'bg-purple-100 text-purple-800';
      case 'artist': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats?.total_views || 0}</p>
                <p className="text-xs text-muted-foreground">Vues totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats?.views_this_week || 0}</p>
                <p className="text-xs text-muted-foreground">Cette semaine</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats?.unique_visitors || 0}</p>
                <p className="text-xs text-muted-foreground">Visiteurs uniques</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {(stats?.agent_views || 0) + (stats?.manager_views || 0) + (stats?.venue_views || 0)}
                </p>
                <p className="text-xs text-muted-foreground">Pros intéressés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Vues par type de profil
          </CardTitle>
          <CardDescription>
            Qui regarde votre profil ?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{stats?.agent_views || 0}</p>
              <p className="text-sm text-muted-foreground">Agents</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">{stats?.manager_views || 0}</p>
              <p className="text-sm text-muted-foreground">Managers</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{stats?.venue_views || 0}</p>
              <p className="text-sm text-muted-foreground">Lieux</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Visitors */}
      <Card>
        <CardHeader>
          <CardTitle>Visiteurs récents</CardTitle>
          <CardDescription>
            Les dernières personnes qui ont consulté votre profil
          </CardDescription>
        </CardHeader>
        <CardContent>
          {visitors.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucun visiteur récent
            </p>
          ) : (
            <div className="space-y-4">
              {visitors.map((visitor) => (
                <div key={visitor.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={visitor.viewer_profile?.avatar_url} />
                      <AvatarFallback>
                        {visitor.viewer_profile?.display_name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{visitor.viewer_profile?.display_name || 'Utilisateur anonyme'}</p>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline" 
                          className={getProfileTypeColor(visitor.viewer_profile?.profile_type)}
                        >
                          {getProfileTypeLabel(visitor.viewer_profile?.profile_type)}
                        </Badge>
                        {visitor.viewer_profile?.location && (
                          <span className="text-xs text-muted-foreground">
                            {visitor.viewer_profile.location}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(visitor.created_at), {
                          addSuffix: true,
                          locale: fr
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {visitor.viewer_profile && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startConversation(
                        visitor.viewer_profile.id,
                        visitor.viewer_profile.display_name
                      )}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Contacter
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}