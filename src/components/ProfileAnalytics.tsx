import { useState, useEffect } from 'react';
import { Eye, Users, TrendingUp, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface ProfileAnalyticsProps {
  profileId: string;
  className?: string;
}

interface ViewStats {
  total_views: number;
  views_this_week: number;
  views_this_month: number;
  unique_visitors: number;
  agent_views: number;
  manager_views: number;
  venue_views: number;
}

export function ProfileAnalytics({ profileId, className = '' }: ProfileAnalyticsProps) {
  const [stats, setStats] = useState<ViewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [profileId]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_profile_view_stats', {
        p_profile_id: profileId
      });

      if (error) throw error;
      if (data && data.length > 0) {
        setStats(data[0]);
      }
    } catch (error) {
      console.error('Error fetching profile stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-3 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const professionalViews = (stats.agent_views || 0) + (stats.manager_views || 0) + (stats.venue_views || 0);
  const totalViews = stats.total_views || 0;
  const weeklyGrowth = stats.views_this_week || 0;
  const monthlyGrowth = stats.views_this_month || 0;

  return (
    <Card className={`border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-blue-900 dark:text-blue-100">
          <TrendingUp className="h-5 w-5" />
          Analytics de votre profil
        </CardTitle>
        <p className="text-sm text-blue-600 dark:text-blue-300">
          Votre carte de visite digitale en action
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-white/50 dark:bg-white/5 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 mb-1">
              <Eye className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold text-foreground">{totalViews}</div>
            <div className="text-xs text-muted-foreground">Vues totales</div>
          </div>
          <div className="text-center p-3 bg-white/50 dark:bg-white/5 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400 mb-1">
              <Users className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold text-foreground">{stats.unique_visitors}</div>
            <div className="text-xs text-muted-foreground">Visiteurs uniques</div>
          </div>
        </div>

        {/* Growth Indicators */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Cette semaine</span>
            <Badge variant={weeklyGrowth > 0 ? "default" : "secondary"} className="text-xs">
              {weeklyGrowth > 0 ? '+' : ''}{weeklyGrowth} vues
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Ce mois</span>
            <Badge variant={monthlyGrowth > 0 ? "default" : "secondary"} className="text-xs">
              {monthlyGrowth > 0 ? '+' : ''}{monthlyGrowth} vues
            </Badge>
          </div>
        </div>

        {/* Professional Interest */}
        {professionalViews > 0 && (
          <div className="pt-3 border-t border-blue-200/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Intérêt professionnel</span>
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                {professionalViews} pros
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {stats.agent_views > 0 && (
                <div className="text-center">
                  <div className="font-medium">{stats.agent_views}</div>
                  <div className="text-muted-foreground">Agents</div>
                </div>
              )}
              {stats.manager_views > 0 && (
                <div className="text-center">
                  <div className="font-medium">{stats.manager_views}</div>
                  <div className="text-muted-foreground">Managers</div>
                </div>
              )}
              {stats.venue_views > 0 && (
                <div className="text-center">
                  <div className="font-medium">{stats.venue_views}</div>
                  <div className="text-muted-foreground">Lieux</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="pt-3 border-t border-blue-200/50">
          <div className="text-center space-y-1">
            <div className="text-xs font-medium text-blue-900 dark:text-blue-100">
              💡 Partagez votre profil
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-300">
              Plus de visibilité = plus d'opportunités
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}