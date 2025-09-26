import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, TrendingUp, Users, MessageCircle } from 'lucide-react';
import { useProfileViewStats } from '@/hooks/useProfileTracking';

interface ProfileViewStatsCardProps {
  profileId: string;
  className?: string;
}

export function ProfileViewStatsCard({ profileId, className }: ProfileViewStatsCardProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { fetchStats } = useProfileViewStats(profileId);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const data = await fetchStats();
        setStats(data);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [profileId]);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-3 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Eye className="h-4 w-4" />
          Vues de profil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-2xl font-bold">{stats?.total_views || 0}</div>
          <p className="text-xs text-muted-foreground">Total des vues</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Cette semaine</span>
            <span className="text-sm font-medium">{stats?.views_this_week || 0}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Ce mois-ci</span>
            <span className="text-sm font-medium">{stats?.views_this_month || 0}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Visiteurs uniques</span>
            <span className="text-sm font-medium">{stats?.unique_visitors || 0}</span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">Vues par type de profil :</p>
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-blue-600">Agents</span>
              <span>{stats?.agent_views || 0}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-green-600">Managers</span>
              <span>{stats?.manager_views || 0}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-purple-600">Organisateurs</span>
              <span>{stats?.venue_views || 0}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}