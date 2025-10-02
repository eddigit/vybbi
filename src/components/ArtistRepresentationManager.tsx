import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { UserPlus, Mail, Trash2, Shield, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { Profile } from "@/lib/types";

interface Representative {
  id: string;
  profile: Profile;
  type: 'agent' | 'manager';
  status: 'pending' | 'accepted';
  requested_at: string;
}

interface Invitation {
  id: string;
  invited_email: string;
  invited_name: string;
  invitation_type: 'agent' | 'manager';
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  created_at: string;
  expires_at: string;
}

export function ArtistRepresentationManager() {
  const { profile } = useAuth();
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [availableAgents, setAvailableAgents] = useState<Profile[]>([]);
  const [availableManagers, setAvailableManagers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectDialogOpen, setSelectDialogOpen] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    name: '',
    type: 'agent' as 'agent' | 'manager'
  });
  const [selectedRepType, setSelectedRepType] = useState<'agent' | 'manager'>('agent');

  useEffect(() => {
    if (profile?.id) {
      fetchData();
    }
  }, [profile?.id]);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchRepresentatives(),
        fetchInvitations(),
        fetchAvailableRepresentatives()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRepresentatives = async () => {
    // Fetch agents
    const { data: agentData } = await supabase
      .from('agent_artists')
      .select('id, representation_status, requested_at, agent_profile_id')
      .eq('artist_profile_id', profile?.id)
      .in('representation_status', ['pending', 'accepted']);

    // Fetch managers
    const { data: managerData } = await supabase
      .from('manager_artists')
      .select('id, representation_status, requested_at, manager_profile_id')
      .eq('artist_profile_id', profile?.id)
      .in('representation_status', ['pending', 'accepted']);

    const allReps: Representative[] = [];

    if (agentData && agentData.length > 0) {
      const agentIds = agentData.map(a => a.agent_profile_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', agentIds);

      agentData.forEach(agent => {
        const profile = profiles?.find(p => p.id === agent.agent_profile_id);
        if (profile) {
          allReps.push({
            id: agent.id,
            profile,
            type: 'agent',
            status: agent.representation_status as 'pending' | 'accepted',
            requested_at: agent.requested_at
          });
        }
      });
    }

    if (managerData && managerData.length > 0) {
      const managerIds = managerData.map(m => m.manager_profile_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', managerIds);

      managerData.forEach(manager => {
        const profile = profiles?.find(p => p.id === manager.manager_profile_id);
        if (profile) {
          allReps.push({
            id: manager.id,
            profile,
            type: 'manager',
            status: manager.representation_status as 'pending' | 'accepted',
            requested_at: manager.requested_at
          });
        }
      });
    }

    setRepresentatives(allReps);
  };

  const fetchInvitations = async () => {
    const { data } = await supabase
      .from('representation_invitations')
      .select('*')
      .eq('artist_profile_id', profile?.id)
      .order('created_at', { ascending: false });

    if (data) {
      setInvitations(data as Invitation[]);
    }
  };

  const fetchAvailableRepresentatives = async () => {
    // Fetch available agents
    const { data: agents } = await supabase
      .from('profiles')
      .select('*')
      .eq('profile_type', 'agent')
      .eq('is_public', true)
      .limit(50);

    // Fetch available managers
    const { data: managers } = await supabase
      .from('profiles')
      .select('*')
      .eq('profile_type', 'manager')
      .eq('is_public', true)
      .limit(50);

    setAvailableAgents(agents || []);
    setAvailableManagers(managers || []);
  };

  const handleSendInvitation = async () => {
    if (!inviteData.email || !inviteData.name) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-representation-invitation', {
        body: {
          artist_profile_id: profile?.id,
          invited_email: inviteData.email,
          invited_name: inviteData.name,
          invitation_type: inviteData.type,
          artist_name: profile?.display_name
        }
      });

      if (error) throw error;

      toast.success("Invitation envoyée avec succès !");
      setInviteDialogOpen(false);
      setInviteData({ email: '', name: '', type: 'agent' });
      fetchInvitations();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error("Erreur lors de l'envoi de l'invitation");
    }
  };

  const handleSelectRepresentative = async (profileId: string, type: 'agent' | 'manager') => {
    try {
      if (type === 'agent') {
        const { error } = await supabase
          .from('agent_artists')
          .insert({
            artist_profile_id: profile?.id,
            agent_profile_id: profileId,
            representation_status: 'pending'
          });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('manager_artists')
          .insert({
            artist_profile_id: profile?.id,
            manager_profile_id: profileId,
            representation_status: 'pending'
          });
        if (error) throw error;
      }

      toast.success("Demande envoyée avec succès !");
      setSelectDialogOpen(false);
      fetchRepresentatives();
    } catch (error) {
      console.error('Error selecting representative:', error);
      toast.error("Erreur lors de la sélection");
    }
  };

  const handleRevokeRepresentative = async (repId: string, type: 'agent' | 'manager') => {
    try {
      const table = type === 'agent' ? 'agent_artists' : 'manager_artists';
      
      const { error } = await supabase
        .from(table)
        .update({ representation_status: 'revoked' })
        .eq('id', repId);

      if (error) throw error;

      toast.success("Représentation révoquée");
      fetchRepresentatives();
    } catch (error) {
      console.error('Error revoking representative:', error);
      toast.error("Erreur lors de la révocation");
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('representation_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId);

      if (error) throw error;

      toast.success("Invitation annulée");
      fetchInvitations();
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast.error("Erreur lors de l'annulation");
    }
  };

  if (loading) {
    return <Card><CardContent className="p-6">Chargement...</CardContent></Card>;
  }

  const acceptedReps = representatives.filter(r => r.status === 'accepted');
  const pendingReps = representatives.filter(r => r.status === 'pending');
  const pendingInvitations = invitations.filter(i => i.status === 'pending');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Gestion de mes représentants
          </span>
          <div className="flex gap-2">
            <Dialog open={selectDialogOpen} onOpenChange={setSelectDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  Sélectionner
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Sélectionner un représentant</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="agent" onValueChange={(v) => setSelectedRepType(v as 'agent' | 'manager')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="agent">Agents</TabsTrigger>
                    <TabsTrigger value="manager">Managers</TabsTrigger>
                  </TabsList>
                  <TabsContent value="agent" className="space-y-2 mt-4">
                    {availableAgents.map(agent => (
                      <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={agent.avatar_url || undefined} />
                            <AvatarFallback>{agent.display_name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{agent.display_name}</p>
                            <p className="text-sm text-muted-foreground">{agent.bio?.substring(0, 60)}...</p>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => handleSelectRepresentative(agent.id, 'agent')}>
                          Sélectionner
                        </Button>
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="manager" className="space-y-2 mt-4">
                    {availableManagers.map(manager => (
                      <div key={manager.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={manager.avatar_url || undefined} />
                            <AvatarFallback>{manager.display_name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{manager.display_name}</p>
                            <p className="text-sm text-muted-foreground">{manager.bio?.substring(0, 60)}...</p>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => handleSelectRepresentative(manager.id, 'manager')}>
                          Sélectionner
                        </Button>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>

            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Inviter par email
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Inviter un nouveau représentant</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Type de représentant</Label>
                    <Select value={inviteData.type} onValueChange={(v) => setInviteData({...inviteData, type: v as 'agent' | 'manager'})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agent">Agent</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Nom</Label>
                    <Input 
                      value={inviteData.name}
                      onChange={(e) => setInviteData({...inviteData, name: e.target.value})}
                      placeholder="Nom du représentant"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      value={inviteData.email}
                      onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                      placeholder="email@exemple.com"
                    />
                  </div>
                  <Button onClick={handleSendInvitation} className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Envoyer l'invitation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">
              Actifs ({acceptedReps.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              En attente ({pendingReps.length})
            </TabsTrigger>
            <TabsTrigger value="invitations">
              Invitations ({pendingInvitations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3">
            {acceptedReps.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucun représentant actif
              </p>
            ) : (
              acceptedReps.map(rep => (
                <div key={rep.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={rep.profile.avatar_url || undefined} />
                      <AvatarFallback>{rep.profile.display_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{rep.profile.display_name}</p>
                      <Badge variant="outline" className="mt-1">
                        {rep.type === 'agent' ? 'Agent' : 'Manager'}
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleRevokeRepresentative(rep.id, rep.type)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Révoquer
                  </Button>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-3">
            {pendingReps.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucune demande en attente
              </p>
            ) : (
              pendingReps.map(rep => (
                <div key={rep.id} className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={rep.profile.avatar_url || undefined} />
                      <AvatarFallback>{rep.profile.display_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{rep.profile.display_name}</p>
                      <Badge variant="outline" className="mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        En attente
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="invitations" className="space-y-3">
            {pendingInvitations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucune invitation en cours
              </p>
            ) : (
              pendingInvitations.map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{inv.invited_name}</p>
                    <p className="text-sm text-muted-foreground">{inv.invited_email}</p>
                    <Badge variant="outline" className="mt-1">
                      {inv.invitation_type === 'agent' ? 'Agent' : 'Manager'}
                    </Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCancelInvitation(inv.id)}
                  >
                    Annuler
                  </Button>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}