import { Card } from '@/components/ui/card';
import { Users, UserPlus, Activity, Eye, TrendingUp, Clock, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { GAStats } from '@/hooks/useGAStats';

interface GAStatsCardsProps {
  stats: GAStats | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function GAStatsCards({ stats, isLoading, error }: GAStatsCardsProps) {
  if (error) {
    return (
      <Card className="p-6 border-destructive/50">
        <div className="text-destructive">
          <h3 className="font-semibold mb-2">Erreur lors du chargement des statistiques GA4</h3>
          <p className="text-sm">{error.message}</p>
          <p className="text-xs mt-2 text-muted-foreground">
            Vérifiez que le Service Account est configuré et que GA4_PROPERTY_ID est défini dans admin_settings.
          </p>
        </div>
      </Card>
    );
  }

  const metrics = [
    {
      title: 'Utilisateurs actifs',
      value: stats?.activeUsers ?? 0,
      icon: Users,
      description: 'Visiteurs sur la période',
      color: 'text-primary',
    },
    {
      title: 'Nouveaux utilisateurs',
      value: stats?.newUsers ?? 0,
      icon: UserPlus,
      description: 'Première visite',
      color: 'text-success',
    },
    {
      title: 'Sessions',
      value: stats?.sessions ?? 0,
      icon: Activity,
      description: 'Nombre de sessions',
      color: 'text-info',
    },
    {
      title: 'Pages vues',
      value: stats?.pageViews ?? 0,
      icon: Eye,
      description: 'Vues de pages',
      color: 'text-warning',
    },
    {
      title: 'Conversions',
      value: stats?.conversions ?? 0,
      icon: Target,
      description: 'Objectifs atteints',
      color: 'text-success',
    },
    {
      title: 'Durée moyenne',
      value: stats ? Math.round(stats.avgSessionDuration) : 0,
      icon: Clock,
      description: 'Secondes par session',
      color: 'text-info',
    },
    {
      title: 'Taux de rebond',
      value: stats ? `${(stats.bounceRate * 100).toFixed(1)}%` : '0%',
      icon: TrendingUp,
      description: 'Visiteurs uniques',
      color: 'text-muted-foreground',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {metric.title}
                </p>
                {isLoading ? (
                  <Skeleton className="h-8 w-24 mb-2" />
                ) : (
                  <p className="text-3xl font-bold mb-1">
                    {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
              </div>
              <div className={`p-3 rounded-lg bg-muted/50 ${metric.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
