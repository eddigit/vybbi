import { useState, useEffect } from 'react';
import { Eye, Calendar, Star, Music, Users, Play, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';

interface ArtistStatsWidgetProps {
  artistId: string;
}

export default function ArtistStatsWidget({ artistId }: ArtistStatsWidgetProps) {
  const [stats, setStats] = useState({
    profileViews: 0,
    prestations: 0,
    reviews: 0,
    productions: 0,
    radioPlays: 0,
    professionals: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [artistId]);

  const fetchStats = async () => {
    const newStats = { ...stats };
    
    try {
      const { data } = await supabase.rpc('get_profile_view_stats', { p_profile_id: artistId });
      if (data?.[0]) {
        newStats.profileViews = Number(data[0].total_views) || 0;
        newStats.professionals = Number(data[0].agent_views || 0) + Number(data[0].manager_views || 0) + Number(data[0].venue_views || 0);
      }
    } catch (e) { /* ignore */ }

    try {
      const { data } = await supabase.rpc('get_artist_radio_stats', { artist_profile_id: artistId });
      if (data?.[0]) newStats.radioPlays = data[0].total_plays || 0;
    } catch (e) { /* ignore */ }

    setStats(newStats);
    setLoading(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Statistiques Vybbi</CardTitle></CardHeader>
        <CardContent><div className="animate-pulse h-40 bg-muted rounded"></div></CardContent>
      </Card>
    );
  }

  const badge = stats.profileViews + stats.radioPlays >= 100 ? 
    { variant: 'default' as const, label: 'Populaire', icon: '🏆' } :
    { variant: 'outline' as const, label: 'Émergent', icon: '⭐' };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Statistiques Vybbi
          <Badge variant={badge.variant} className="ml-auto">
            {badge.icon} {badge.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 text-center">
            <Eye className="h-4 w-4 text-blue-600 mx-auto mb-1" />
            <div className="text-xl font-bold text-blue-600">{stats.profileViews}</div>
            <p className="text-xs text-muted-foreground">Vues de profil</p>
          </div>
          
          <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4 text-center">
            <Calendar className="h-4 w-4 text-green-600 mx-auto mb-1" />
            <div className="text-xl font-bold text-green-600">{stats.prestations}</div>
            <p className="text-xs text-muted-foreground">Prestations</p>
          </div>
          
          <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4 text-center">
            <Play className="h-4 w-4 text-orange-600 mx-auto mb-1" />
            <div className="text-xl font-bold text-orange-600">{stats.radioPlays}</div>
            <p className="text-xs text-muted-foreground">Écoutes radio</p>
          </div>
          
          <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4 text-center">
            <Music className="h-4 w-4 text-purple-600 mx-auto mb-1" />
            <div className="text-xl font-bold text-purple-600">{stats.productions}</div>
            <p className="text-xs text-muted-foreground">Productions</p>
          </div>
          
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4 text-center">
            <Star className="h-4 w-4 text-yellow-600 mx-auto mb-1" />
            <div className="text-xl font-bold text-yellow-600">{stats.reviews}</div>
            <p className="text-xs text-muted-foreground">Reviews</p>
          </div>
          
          <div className="bg-pink-500/5 border border-pink-500/20 rounded-lg p-4 text-center">
            <Users className="h-4 w-4 text-pink-600 mx-auto mb-1" />
            <div className="text-xl font-bold text-pink-600">{stats.professionals}</div>
            <p className="text-xs text-muted-foreground">Professionnels</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}