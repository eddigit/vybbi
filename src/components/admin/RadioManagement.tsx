import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Music, Play, Pause, Users, TrendingUp, Clock, Star, Check, X, Plus } from "lucide-react";

interface Playlist {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  priority: number;
  schedule_start: string | null;
  schedule_end: string | null;
  track_count?: number;
}

interface PendingTrack {
  id: string;
  file_name: string;
  artist_name: string;
  artist_avatar: string | null;
  added_at: string;
  playlist_name: string;
}

interface ArtistSubscription {
  id: string;
  artist_name: string;
  subscription_type: string;
  credits_remaining: number;
  expires_at: string | null;
  is_active: boolean;
}

interface RadioStats {
  total_tracks: number;
  pending_approvals: number;
  active_subscriptions: number;
  total_plays_today: number;
}

export function RadioManagement() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [pendingTracks, setPendingTracks] = useState<PendingTrack[]>([]);
  const [subscriptions, setSubscriptions] = useState<ArtistSubscription[]>([]);
  const [stats, setStats] = useState<RadioStats>({
    total_tracks: 0,
    pending_approvals: 0,
    active_subscriptions: 0,
    total_plays_today: 0
  });
  const [loading, setLoading] = useState(true);
  const [newPlaylistOpen, setNewPlaylistOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPlaylists(),
        fetchPendingTracks(),
        fetchSubscriptions(),
        fetchStats()
      ]);
    } catch (error) {
      console.error("Error fetching radio data:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données radio",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylists = async () => {
    const { data, error } = await supabase
      .from('radio_playlists')
      .select(`
        *,
        radio_playlist_tracks(count)
      `)
      .order('priority', { ascending: false });

    if (error) throw error;
    setPlaylists(data?.map(p => ({
      ...p,
      track_count: p.radio_playlist_tracks?.[0]?.count || 0
    })) || []);
  };

  const fetchPendingTracks = async () => {
    const { data, error } = await supabase
      .from('radio_playlist_tracks')
      .select(`
        id,
        added_at,
        media_assets!inner(
          file_name,
          profiles!inner(display_name, avatar_url)
        ),
        radio_playlists!inner(name)
      `)
      .eq('is_approved', false)
      .order('added_at', { ascending: true });

    if (error) throw error;
    setPendingTracks(data?.map(track => ({
      id: track.id,
      file_name: track.media_assets.file_name,
      artist_name: track.media_assets.profiles.display_name,
      artist_avatar: track.media_assets.profiles.avatar_url,
      added_at: track.added_at,
      playlist_name: track.radio_playlists.name
    })) || []);
  };

  const fetchSubscriptions = async () => {
    const { data, error } = await supabase
      .from('artist_radio_subscriptions')
      .select(`
        *,
        profiles!artist_profile_id(display_name)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setSubscriptions(data?.map(sub => ({
      ...sub,
      artist_name: sub.profiles.display_name
    })) || []);
  };

  const fetchStats = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const [tracksResult, pendingResult, subscriptionsResult, playsResult] = await Promise.all([
      supabase.from('radio_playlist_tracks').select('id', { count: 'exact', head: true }),
      supabase.from('radio_playlist_tracks').select('id', { count: 'exact', head: true }).eq('is_approved', false),
      supabase.from('artist_radio_subscriptions').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('radio_play_history').select('id', { count: 'exact', head: true }).gte('played_at', today)
    ]);

    setStats({
      total_tracks: tracksResult.count || 0,
      pending_approvals: pendingResult.count || 0,
      active_subscriptions: subscriptionsResult.count || 0,
      total_plays_today: playsResult.count || 0
    });
  };

  const togglePlaylistActive = async (id: string, is_active: boolean) => {
    const { error } = await supabase
      .from('radio_playlists')
      .update({ is_active })
      .eq('id', id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la playlist",
        variant: "destructive"
      });
    } else {
      fetchPlaylists();
      toast({
        title: "Succès",
        description: `Playlist ${is_active ? 'activée' : 'désactivée'}`
      });
    }
  };

  const approveTrack = async (trackId: string, approved: boolean) => {
    const { error } = await supabase
      .from('radio_playlist_tracks')
      .update({ is_approved: approved })
      .eq('id', trackId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du morceau",
        variant: "destructive"
      });
    } else {
      fetchPendingTracks();
      fetchStats();
      toast({
        title: "Succès",
        description: `Morceau ${approved ? 'approuvé' : 'rejeté'}`
      });
    }
  };

  const createPlaylist = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const { error } = await supabase
      .from('radio_playlists')
      .insert({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        priority: parseInt(formData.get('priority') as string || '1'),
        schedule_start: formData.get('schedule_start') as string || null,
        schedule_end: formData.get('schedule_end') as string || null
      });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la playlist",
        variant: "destructive"
      });
    } else {
      setNewPlaylistOpen(false);
      fetchPlaylists();
      toast({
        title: "Succès",
        description: "Playlist créée avec succès"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Morceaux Total</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_tracks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending_approvals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonnements Actifs</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active_subscriptions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Écoutes Aujourd'hui</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_plays_today}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="playlists" className="space-y-4">
        <TabsList>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
          <TabsTrigger value="pending">
            Approbations
            {stats.pending_approvals > 0 && (
              <Badge variant="secondary" className="ml-2">
                {stats.pending_approvals}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
        </TabsList>

        <TabsContent value="playlists" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Gestion des Playlists</h3>
            <Dialog open={newPlaylistOpen} onOpenChange={setNewPlaylistOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle Playlist
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle playlist</DialogTitle>
                </DialogHeader>
                <form onSubmit={createPlaylist} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nom</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priorité</Label>
                    <Input id="priority" name="priority" type="number" defaultValue="1" min="1" max="10" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="schedule_start">Début (optionnel)</Label>
                      <Input id="schedule_start" name="schedule_start" type="time" />
                    </div>
                    <div>
                      <Label htmlFor="schedule_end">Fin (optionnel)</Label>
                      <Input id="schedule_end" name="schedule_end" type="time" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Créer</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {playlists.map((playlist) => (
              <Card key={playlist.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {playlist.name}
                        <Badge variant={playlist.is_active ? "default" : "secondary"}>
                          {playlist.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{playlist.description}</CardDescription>
                    </div>
                    <Switch
                      checked={playlist.is_active}
                      onCheckedChange={(checked) => togglePlaylistActive(playlist.id, checked)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{playlist.track_count} morceaux</span>
                    <span>Priorité: {playlist.priority}</span>
                    {playlist.schedule_start && playlist.schedule_end && (
                      <span>Horaires: {playlist.schedule_start} - {playlist.schedule_end}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <h3 className="text-lg font-medium">Morceaux en attente d'approbation</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Morceau</TableHead>
                  <TableHead>Artiste</TableHead>
                  <TableHead>Playlist</TableHead>
                  <TableHead>Ajouté le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingTracks.map((track) => (
                  <TableRow key={track.id}>
                    <TableCell className="font-medium">{track.file_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {track.artist_avatar && (
                          <img
                            src={track.artist_avatar}
                            alt={track.artist_name}
                            className="h-6 w-6 rounded-full"
                          />
                        )}
                        {track.artist_name}
                      </div>
                    </TableCell>
                    <TableCell>{track.playlist_name}</TableCell>
                    <TableCell>
                      {new Date(track.added_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => approveTrack(track.id, true)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => approveTrack(track.id, false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <h3 className="text-lg font-medium">Abonnements des artistes</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artiste</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Crédits restants</TableHead>
                  <TableHead>Expire le</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.artist_name}</TableCell>
                    <TableCell>
                      <Badge variant={sub.subscription_type === 'vip' ? 'default' : 'secondary'}>
                        {sub.subscription_type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{sub.credits_remaining}</TableCell>
                    <TableCell>
                      {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString('fr-FR') : 'Illimité'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={sub.is_active ? "default" : "secondary"}>
                        {sub.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}