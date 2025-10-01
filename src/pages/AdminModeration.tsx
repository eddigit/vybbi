import React, { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Shield, MessageSquare, Calendar, FileText, Trash2, Send, Eye, UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface MessageWithProfile {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  conversation_id: string;
  sender_name?: string;
  sender_type?: string;
}

interface EventWithProfile {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  status: string;
  created_at: string;
  venue_profile_id: string;
  venue_name?: string;
}

interface AnnonceWithProfile {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  user_id: string;
  author_name?: string;
}

interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  profile_type: string;
  is_public: boolean;
  created_at: string;
}

const AdminModeration = () => {
  const { user, hasRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<MessageWithProfile[]>([]);
  const [events, setEvents] = useState<EventWithProfile[]>([]);
  const [annonces, setAnnonces] = useState<AnnonceWithProfile[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [adminMessage, setAdminMessage] = useState("");
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [userTypeFilter, setUserTypeFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState('messages');
  const fetchedRef = useRef(false);

  // Parse URL parameters on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    const typeParam = params.get('type');
    
    if (tabParam) {
      setActiveTab(tabParam);
    }
    if (typeParam) {
      setUserTypeFilter(typeParam);
    }
  }, []);

  // Compute isAdmin once to avoid re-renders
  const isAdmin = useMemo(() => !authLoading && hasRole('admin'), [hasRole, authLoading]);

  // Batch profile fetching helper
  const batchFetchProfiles = async (userIds: string[], profileIds: string[] = []) => {
    const profileMap: Record<string, { display_name: string; profile_type: string }> = {};
    
    try {
      // Fetch by user_id
      if (userIds.length > 0) {
        const { data: userProfiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, profile_type')
          .in('user_id', [...new Set(userIds)]);
        
        userProfiles?.forEach(profile => {
          profileMap[profile.user_id] = {
            display_name: profile.display_name,
            profile_type: profile.profile_type
          };
        });
      }
      
      // Fetch by profile_id
      if (profileIds.length > 0) {
        const { data: idProfiles } = await supabase
          .from('profiles')
          .select('id, display_name, profile_type')
          .in('id', [...new Set(profileIds)]);
        
        idProfiles?.forEach(profile => {
          profileMap[profile.id] = {
            display_name: profile.display_name,
            profile_type: profile.profile_type
          };
        });
      }
    } catch (error) {
      console.warn('Error batch fetching profiles:', error);
    }
    
    return profileMap;
  };

  // Fetch data when auth is ready and user is admin
  useEffect(() => {
    if (!authLoading && hasRole('admin') && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchData();
    }
  }, [hasRole, authLoading]);

  // Optimized data fetching with batched profile requests
  const fetchData = async () => {
    console.log('Starting fetchData...');
    setLoading(true);
    
    try {
      // Fetch all base data in parallel
      // Note: Admins can see all profile data including PII due to RLS policies
      const [messagesResult, eventsResult, annoncesResult, profilesResult] = await Promise.allSettled([
        supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('events').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('annonces').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('profiles').select('id, display_name, avatar_url, profile_type, email, phone, is_public, created_at, user_id').order('created_at', { ascending: false }).limit(200)
      ]);

      // Process messages
      if (messagesResult.status === 'fulfilled' && messagesResult.value.data) {
        const messagesData = messagesResult.value.data;
        const senderIds = messagesData.map(m => m.sender_id);
        const profileMap = await batchFetchProfiles(senderIds);
        
        const messagesWithProfiles = messagesData.map(message => ({
          ...message,
          sender_name: profileMap[message.sender_id]?.display_name || 'Utilisateur supprimé',
          sender_type: profileMap[message.sender_id]?.profile_type || 'inconnu'
        }));
        setMessages(messagesWithProfiles);
      } else {
        console.warn('Failed to fetch messages:', messagesResult);
        setMessages([]);
      }

      // Process events
      if (eventsResult.status === 'fulfilled' && eventsResult.value.data) {
        const eventsData = eventsResult.value.data;
        const venueIds = eventsData.map(e => e.venue_profile_id);
        const profileMap = await batchFetchProfiles([], venueIds);
        
        const eventsWithProfiles = eventsData.map(event => ({
          ...event,
          venue_name: profileMap[event.venue_profile_id]?.display_name || 'Organisateur supprimé'
        }));
        setEvents(eventsWithProfiles);
      } else {
        console.warn('Failed to fetch events:', eventsResult);
        setEvents([]);
      }

      // Process annonces
      if (annoncesResult.status === 'fulfilled' && annoncesResult.value.data) {
        const annoncesData = annoncesResult.value.data;
        const authorIds = annoncesData.map(a => a.user_id);
        const profileMap = await batchFetchProfiles(authorIds);
        
        const annoncesWithProfiles = annoncesData.map(annonce => ({
          ...annonce,
          author_name: profileMap[annonce.user_id]?.display_name || 'Auteur supprimé'
        }));
        setAnnonces(annoncesWithProfiles);
      } else {
        console.warn('Failed to fetch annonces:', annoncesResult);
        setAnnonces([]);
      }

      // Process profiles
      if (profilesResult.status === 'fulfilled' && profilesResult.value.data) {
        setProfiles(profilesResult.value.data);
      } else {
        console.warn('Failed to fetch profiles:', profilesResult);
        setProfiles([]);
      }

      console.log('fetchData completed successfully');
    } catch (error) {
      console.error('Unexpected error in fetchData:', error);
      toast({ 
        title: "Erreur", 
        description: "Erreur lors du chargement des données", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
      
      toast({ title: "Succès", description: "Message supprimé avec succès" });
      fetchData();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({ title: "Erreur", description: "Impossible de supprimer le message", variant: "destructive" });
    }
  };

  // Delete event
  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      
      toast({ title: "Succès", description: "Événement supprimé avec succès" });
      fetchData();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({ title: "Erreur", description: "Impossible de supprimer l'événement", variant: "destructive" });
    }
  };

  // Delete annonce
  const handleDeleteAnnonce = async (annonceId: string) => {
    try {
      const { error } = await supabase
        .from('annonces')
        .delete()
        .eq('id', annonceId);

      if (error) throw error;
      
      toast({ title: "Succès", description: "Annonce supprimée avec succès" });
      fetchData();
    } catch (error) {
      console.error('Error deleting annonce:', error);
      toast({ title: "Erreur", description: "Impossible de supprimer l'annonce", variant: "destructive" });
    }
  };

  // Send admin message to selected profiles
  const handleSendAdminMessage = async () => {
    if (!adminMessage.trim() || selectedProfiles.length === 0) {
      toast({ title: "Erreur", description: "Veuillez sélectionner des destinataires et saisir un message", variant: "destructive" });
      return;
    }

    try {
      let sentCount = 0;
      let errorCount = 0;

      // Send individual messages using the new admin function
      for (const profileId of selectedProfiles) {
        const profile = profiles.find(p => p.id === profileId);
        if (!profile) continue;

        try {
          const { error } = await supabase.rpc('send_admin_message', {
            target_user_id: profile.user_id,
            content: adminMessage
          });

          if (error) {
            console.error('Error sending admin message:', error);
            errorCount++;
          } else {
            sentCount++;
          }
        } catch (profileError) {
          console.error('Error processing profile:', profileError);
          errorCount++;
        }
      }

      if (sentCount > 0) {
        toast({ title: "Succès", description: `Message envoyé à ${sentCount} destinataire(s)${errorCount > 0 ? ` (${errorCount} erreurs)` : ''}` });
      } else {
        toast({ title: "Erreur", description: "Aucun message n'a pu être envoyé", variant: "destructive" });
      }

      setAdminMessage("");
      setSelectedProfiles([]);
      setMessageDialogOpen(false);
    } catch (error) {
      console.error('Error sending admin messages:', error);
      toast({ title: "Erreur", description: "Erreur lors de l'envoi des messages", variant: "destructive" });
    }
  };

  // Toggle profile selection
  const toggleProfileSelection = (profileId: string) => {
    setSelectedProfiles(prev => 
      prev.includes(profileId) 
        ? prev.filter(id => id !== profileId)
        : [...prev, profileId]
    );
  };

  // Select all profiles of a type
  const selectAllProfilesOfType = (type: string) => {
    const typeProfiles = profiles.filter(p => p.profile_type === type).map(p => p.id);
    setSelectedProfiles(prev => [...new Set([...prev, ...typeProfiles])]);
  };

  // Send broadcast message to all users of a specific type
  const handleSendBroadcast = async (profileTypes: ('artist' | 'agent' | 'manager' | 'lieu')[] | null, message?: string) => {
    const messageContent = message || adminMessage;
    if (!messageContent.trim()) {
      toast({ title: "Erreur", description: "Veuillez saisir un message", variant: "destructive" });
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('send_admin_broadcast', {
          profile_types: profileTypes,
          only_public: false,
          content: messageContent
        });

      if (error) {
        console.error('Error sending broadcast:', error);
        toast({ title: "Erreur", description: "Erreur lors de l'envoi du message de diffusion", variant: "destructive" });
        return;
      }

      const { sent_count, error_count } = data[0];
      toast({ 
        title: "Diffusion terminée", 
        description: `Message envoyé à ${sent_count} utilisateur(s)${error_count > 0 ? ` (${error_count} erreurs)` : ''}` 
      });
      
      setAdminMessage("");
      setMessageDialogOpen(false);
    } catch (error) {
      console.error('Error sending broadcast:', error);
      toast({ title: "Erreur", description: "Erreur lors de l'envoi du message de diffusion", variant: "destructive" });
    }
  };

  // Toggle profile public status
  const handleToggleProfilePublic = async (profileId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_public: !currentStatus })
        .eq('id', profileId);

      if (error) throw error;
      
      toast({ 
        title: "Succès", 
        description: `Profil ${!currentStatus ? 'activé' : 'désactivé'} avec succès` 
      });
      fetchData();
    } catch (error) {
      console.error('Error toggling profile status:', error);
      toast({ 
        title: "Erreur", 
        description: "Impossible de modifier le statut du profil", 
        variant: "destructive" 
      });
    }
  };

  // Delete profile
  const handleDeleteProfile = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId);

      if (error) throw error;
      
      toast({ title: "Succès", description: "Profil supprimé avec succès" });
      fetchData();
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast({ 
        title: "Erreur", 
        description: "Impossible de supprimer le profil", 
        variant: "destructive" 
      });
    }
  };

  // Filter profiles by type
  const filteredProfiles = useMemo(() => {
    if (!userTypeFilter) return profiles;
    return profiles.filter(profile => profile.profile_type === userTypeFilter);
  }, [profiles, userTypeFilter]);


  if (authLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Chargement de l'authentification...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-500">Accès refusé - Vous devez être administrateur</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Chargement des données...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Modération Administrateur
          </h1>
          <p className="text-muted-foreground">
            Gérez et modérez tous les contenus de la plateforme
          </p>
        </div>
        
        <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Message Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Envoyer un message administrateur</DialogTitle>
              <DialogDescription>
                Sélectionnez les destinataires et rédigez votre message
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Sélection rapide par type</Label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => selectAllProfilesOfType('artist')}>
                    Tous les Artistes
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => selectAllProfilesOfType('lieu')}>
                    Tous les Lieux
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => selectAllProfilesOfType('agent')}>
                    Tous les Agents
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => selectAllProfilesOfType('manager')}>
                    Tous les Managers
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedProfiles([])}>
                    Tout déselectionner
                  </Button>
                </div>
                
                <div>
                  <Label>Diffusion rapide</Label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleSendBroadcast(['artist'])}
                      disabled={!adminMessage.trim()}
                    >
                      Diffuser aux Artistes
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleSendBroadcast(['lieu'])}
                      disabled={!adminMessage.trim()}
                    >
                      Diffuser aux Lieux
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleSendBroadcast(['agent', 'manager'])}
                      disabled={!adminMessage.trim()}
                    >
                      Diffuser aux Agents/Managers
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleSendBroadcast(null)}
                      disabled={!adminMessage.trim()}
                    >
                      Diffuser à Tous
                    </Button>
                  </div>
                </div>
              </div>


              <div>
                <Label>Destinataires ({selectedProfiles.length} sélectionné(s))</Label>
                <div className="max-h-48 overflow-y-auto border rounded-md p-2 mt-2 space-y-1">
                  {profiles.map((profile) => (
                    <div key={profile.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={profile.id}
                        checked={selectedProfiles.includes(profile.id)}
                        onChange={() => toggleProfileSelection(profile.id)}
                        className="rounded"
                      />
                      <label htmlFor={profile.id} className="text-sm flex-1 cursor-pointer">
                        {profile.display_name} ({profile.profile_type})
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="admin-message">Message</Label>
                <Textarea
                  id="admin-message"
                  value={adminMessage}
                  onChange={(e) => setAdminMessage(e.target.value)}
                  placeholder="Votre message administrateur..."
                  rows={4}
                  className="mt-2"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSendAdminMessage} disabled={!adminMessage.trim() || selectedProfiles.length === 0}>
                  Envoyer le message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="messages">Messages ({messages.length})</TabsTrigger>
          <TabsTrigger value="events">Événements ({events.length})</TabsTrigger>
          <TabsTrigger value="annonces">Annonces ({annonces.length})</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs ({filteredProfiles.length}/{profiles.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Messages récents
              </CardTitle>
              <CardDescription>
                Gérez et modérez tous les messages de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Expéditeur</TableHead>
                    <TableHead>Contenu</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{message.sender_name}</div>
                          <Badge variant="outline" className="text-xs">
                            {message.sender_type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="truncate" title={message.content}>
                          {message.content}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: fr })}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer ce message ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. Le message sera définitivement supprimé.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteMessage(message.id)}>
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Événements
              </CardTitle>
              <CardDescription>
                Gérez tous les événements de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Organisateur</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>{event.venue_name}</TableCell>
                      <TableCell>{new Date(event.event_date).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell>
                        <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/events`}>
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer cet événement ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action est irréversible. L'événement sera définitivement supprimé.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteEvent(event.id)}>
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="annonces" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Annonces
              </CardTitle>
              <CardDescription>
                Gérez toutes les annonces de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Auteur</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {annonces.map((annonce) => (
                    <TableRow key={annonce.id}>
                      <TableCell className="font-medium">{annonce.title}</TableCell>
                      <TableCell>{annonce.author_name}</TableCell>
                      <TableCell>
                        <Badge variant={annonce.status === 'published' ? 'default' : 'secondary'}>
                          {annonce.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(annonce.created_at), { addSuffix: true, locale: fr })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/annonces`}>
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer cette annonce ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action est irréversible. L'annonce sera définitivement supprimée.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteAnnonce(annonce.id)}>
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserX className="h-5 w-5" />
                Gestion des Utilisateurs
              </CardTitle>
              <CardDescription>
                Gérez et modérez tous les utilisateurs de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filtres par type */}
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant={userTypeFilter === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUserTypeFilter('')}
                >
                  Tous ({profiles.length})
                </Button>
                <Button 
                  variant={userTypeFilter === 'artist' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUserTypeFilter('artist')}
                >
                  Artistes ({profiles.filter(p => p.profile_type === 'artist').length})
                </Button>
                <Button 
                  variant={userTypeFilter === 'lieu' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUserTypeFilter('lieu')}
                >
                  Lieux ({profiles.filter(p => p.profile_type === 'lieu').length})
                </Button>
                <Button 
                  variant={userTypeFilter === 'agent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUserTypeFilter('agent')}
                >
                  Agents ({profiles.filter(p => p.profile_type === 'agent').length})
                </Button>
                <Button 
                  variant={userTypeFilter === 'manager' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUserTypeFilter('manager')}
                >
                  Managers ({profiles.filter(p => p.profile_type === 'manager').length})
                </Button>
              </div>

              {/* Actions en lot */}
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedProfiles(filteredProfiles.map(p => p.id));
                  }}
                >
                  Sélectionner tout ({filteredProfiles.length})
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedProfiles([])}
                >
                  Déselectionner
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setMessageDialogOpen(true)}
                  disabled={selectedProfiles.length === 0}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Message ({selectedProfiles.length})
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input 
                        type="checkbox" 
                        checked={selectedProfiles.length > 0 && selectedProfiles.length === filteredProfiles.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProfiles(filteredProfiles.map(p => p.id));
                          } else {
                            setSelectedProfiles([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date création</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedProfiles.includes(profile.id)}
                          onChange={() => toggleProfileSelection(profile.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{profile.display_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {profile.profile_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={profile.is_public ? 'default' : 'secondary'}>
                          {profile.is_public ? 'Public' : 'Privé'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true, locale: fr })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              window.open(`/artist/${profile.id}`, '_blank');
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleToggleProfilePublic(profile.id, profile.is_public)}
                            title={profile.is_public ? 'Désactiver le profil' : 'Activer le profil'}
                          >
                            {profile.is_public ? '🔒' : '🔓'}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedProfiles([profile.id]);
                              setMessageDialogOpen(true);
                            }}
                          >
                            <Send className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer ce profil ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action est irréversible. Le profil "{profile.display_name}" sera définitivement supprimé.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteProfile(profile.id)}>
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminModeration;