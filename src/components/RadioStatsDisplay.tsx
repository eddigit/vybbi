import { useState, useEffect } from 'react';
import { Play, TrendingUp, Calendar, Trophy, Star } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface RadioStatsDisplayProps {
  artistId: string;
}

interface RadioStats {
  total_plays: number;
  total_duration_seconds: number;
  last_played_at: string | null;
  ranking_position: number;
}

export default function RadioStatsDisplay({ artistId }: RadioStatsDisplayProps) {
  const [stats, setStats] = useState<RadioStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRadioStats();
  }, [artistId]);

  const fetchRadioStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_artist_radio_stats', {
        artist_profile_id: artistId
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setStats(data[0]);
      } else {
        setStats({
          total_plays: 0,
          total_duration_seconds: 0,
          last_played_at: null,
          ranking_position: 999
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques radio:', error);
      setStats({
        total_plays: 0,
        total_duration_seconds: 0,
        last_played_at: null,
        ranking_position: 999
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} minutes`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Jamais diffusé';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getRankingBadge = (position: number) => {
    if (position <= 3) {
      return { variant: 'default' as const, color: 'text-yellow-600', icon: '🏆' };
    } else if (position <= 10) {
      return { variant: 'secondary' as const, color: 'text-orange-600', icon: '🥇' };
    } else if (position <= 25) {
      return { variant: 'outline' as const, color: 'text-blue-600', icon: '⭐' };
    } else if (position <= 50) {
      return { variant: 'outline' as const, color: 'text-green-600', icon: '📈' };
    } else {
      return { variant: 'outline' as const, color: 'text-muted-foreground', icon: '📊' };
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-muted rounded w-1/3"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">Aucune statistique radio disponible.</p>
      </div>
    );
  }

  const rankingBadge = getRankingBadge(stats.ranking_position);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Play className="h-4 w-4 text-primary mr-1" />
              <span className="text-2xl font-bold text-primary">{stats.total_plays.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground">Écoutes totales</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-lg font-bold text-blue-600">
                {formatDuration(stats.total_duration_seconds)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Temps d'écoute</p>
          </CardContent>
        </Card>

        <Card className={`bg-${rankingBadge.color.includes('yellow') ? 'yellow' : rankingBadge.color.includes('orange') ? 'orange' : 'muted'}/5 border-current/20`}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-4 w-4 mr-1" />
              <span className={`text-lg font-bold ${rankingBadge.color}`}>
                {stats.ranking_position <= 50 ? `#${stats.ranking_position}` : '50+'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Classement</p>
          </CardContent>
        </Card>

        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-xs font-bold text-green-600">
                {formatDate(stats.last_played_at)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Dernière diffusion</p>
          </CardContent>
        </Card>
      </div>

      {/* Ranking Badge & Action */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Badge variant={rankingBadge.variant} className="text-sm gap-1">
            <span>{rankingBadge.icon}</span>
            {stats.ranking_position <= 50 ? (
              <>Classé #{stats.ranking_position} sur le Top 50</>
            ) : (
              <>Hors classement (position {stats.ranking_position})</>
            )}
          </Badge>
          
          {stats.total_plays > 0 && (
            <Badge variant="outline" className="text-xs">
              {stats.total_plays > 1000 ? 'Artiste populaire' : 
               stats.total_plays > 100 ? 'Artiste émergent' : 
               'Nouvelle découverte'}
            </Badge>
          )}
        </div>

        <Button variant="outline" size="sm" asChild>
          <Link to="/top-artistes">
            <Trophy className="h-4 w-4 mr-2" />
            Voir le Top 50
          </Link>
        </Button>
      </div>

      {/* Performance Insights */}
      {stats.total_plays > 0 && (
        <div className="p-4 bg-muted/30 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            Performance Radio
          </h4>
          <div className="text-sm text-muted-foreground space-y-1">
            {stats.total_plays >= 1000 && (
              <p>🎉 Félicitations ! Vous avez dépassé les 1000 écoutes</p>
            )}
            {stats.ranking_position <= 10 && (
              <p>🏆 Excellent ! Vous êtes dans le Top 10</p>
            )}
            {stats.ranking_position <= 50 && (
              <p>⭐ Bravo ! Vous faites partie du Top 50</p>
            )}
            {stats.total_plays === 0 && (
              <p>💡 Ajoutez vos morceaux pour commencer à être diffusé sur Radio Vybbi</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}