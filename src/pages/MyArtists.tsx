import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MessageSquare, User, FileText, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ArtistProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  user_id: string;
}

interface ArtistRelationship {
  id: string;
  artist_profile_id: string;
  representation_status: string;
  requested_at: string;
  responded_at: string | null;
  contract_notes: string | null;
  artist: ArtistProfile;
}

export default function MyArtists() {
  const { id: profileId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [artists, setArtists] = useState<ArtistRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState("");

  const isAgent = profile?.profile_type === "agent";
  const isManager = profile?.profile_type === "manager";

  useEffect(() => {
    if (!user || !profile || (!isAgent && !isManager)) {
      navigate("/auth");
      return;
    }

    if (profile.id !== profileId) {
      navigate("/dashboard");
      return;
    }

    fetchArtists();
  }, [user, profile, profileId, navigate, isAgent, isManager]);

  const fetchArtists = async () => {
    if (!profileId) return;

    try {
      const tableName = isAgent ? "agent_artists" : "manager_artists";
      const profileColumn = isAgent ? "agent_profile_id" : "manager_profile_id";

      // Use basic query and cast result to avoid type inference
      const relationshipQuery = (supabase as any)
        .from(tableName)
        .select('id, artist_profile_id, representation_status, requested_at, responded_at, contract_notes')
        .eq(profileColumn, profileId)
        .order("requested_at", { ascending: false });

      const relationshipResult = await relationshipQuery;
      
      if (relationshipResult.error) {
        throw relationshipResult.error;
      }
      
      const relationships: any[] = relationshipResult.data || [];

      if (relationships.length === 0) {
        setArtists([]);
        return;
      }

      // Get artist profiles separately
      const artistIds = relationships.map(r => r.artist_profile_id);
      
      const profileQuery = (supabase as any)
        .from('profiles')
        .select('id, display_name, avatar_url, user_id')
        .in('id', artistIds);

      const profileResult = await profileQuery;

      if (profileResult.error) {
        throw profileResult.error;
      }
      
      const artistProfiles: any[] = profileResult.data || [];

      // Manually combine the data with explicit type construction
      const combinedData: ArtistRelationship[] = relationships.map(rel => {
        const foundArtist = artistProfiles.find(p => p.id === rel.artist_profile_id);
        
        const artistData: ArtistProfile = foundArtist ? {
          id: foundArtist.id,
          display_name: foundArtist.display_name,
          avatar_url: foundArtist.avatar_url,
          user_id: foundArtist.user_id
        } : {
          id: rel.artist_profile_id,
          display_name: 'Unknown Artist',
          avatar_url: null,
          user_id: ''
        };

        return {
          id: rel.id,
          artist_profile_id: rel.artist_profile_id,
          representation_status: rel.representation_status,
          requested_at: rel.requested_at,
          responded_at: rel.responded_at,
          contract_notes: rel.contract_notes,
          artist: artistData
        };
      });

      setArtists(combinedData);
    } catch (error) {
      console.error("Error fetching artists:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer la liste des artistes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async (relationshipId: string) => {
    try {
      const tableName = isAgent ? "agent_artists" : "manager_artists";
      
      const updateResult = await (supabase as any)
        .from(tableName)
        .update({ contract_notes: tempNotes })
        .eq("id", relationshipId);

      if (updateResult.error) throw updateResult.error;

      setArtists(prev => prev.map(artist => 
        artist.id === relationshipId 
          ? { ...artist, contract_notes: tempNotes }
          : artist
      ));

      setEditingNotes(null);
      setTempNotes("");
      
      toast({
        title: "Succès",
        description: "Notes contractuelles mises à jour",
      });
    } catch (error) {
      console.error("Error updating notes:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les notes",
        variant: "destructive",
      });
    }
  };

  const startDirectConversation = async (artistUserId: string) => {
    try {
      const conversationResult = await (supabase as any).rpc('start_direct_conversation', {
        target_user_id: artistUserId
      });

      if (conversationResult.error) throw conversationResult.error;
      
      navigate(`/messages?conversation=${conversationResult.data}`);
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la conversation",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  if (!user || !profile || (!isAgent && !isManager)) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au Dashboard
        </Button>
        <h1 className="text-2xl font-bold">
          Mes Artistes {isAgent ? "(Agent)" : "(Manager)"}
        </h1>
      </div>

      {artists.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <User className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Aucun artiste dans votre roster pour le moment.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {artists.map((artist) => (
            <Card key={artist.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={artist.artist.avatar_url || ""} />
                      <AvatarFallback>
                        {artist.artist.display_name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {artist.artist.display_name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            artist.representation_status === "accepted"
                              ? "default"
                              : artist.representation_status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {artist.representation_status === "accepted" && "Accepté"}
                          {artist.representation_status === "pending" && "En attente"}
                          {artist.representation_status === "rejected" && "Refusé"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startDirectConversation(artist.artist.user_id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Timeline */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Historique
                  </h4>
                  <div className="pl-6 space-y-1 text-sm text-muted-foreground">
                    <p>
                      Demande envoyée: {new Date(artist.requested_at).toLocaleDateString('fr-FR')}
                    </p>
                    {artist.responded_at && (
                      <p>
                        Réponse reçue: {new Date(artist.responded_at).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contract Notes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Notes Contractuelles
                    </h4>
                    {editingNotes !== artist.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingNotes(artist.id);
                          setTempNotes(artist.contract_notes || "");
                        }}
                      >
                        Éditer
                      </Button>
                    )}
                  </div>
                  
                  {editingNotes === artist.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        placeholder="Ajoutez vos notes contractuelles ici..."
                        rows={4}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveNotes(artist.id)}
                        >
                          Sauvegarder
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingNotes(null);
                            setTempNotes("");
                          }}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-muted rounded-md">
                      {artist.contract_notes ? (
                        <p className="text-sm whitespace-pre-wrap">
                          {artist.contract_notes}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          Aucune note contractuelle pour le moment
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}