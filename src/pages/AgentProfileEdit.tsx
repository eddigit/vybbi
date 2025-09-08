import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Profile, AgentArtist } from "@/lib/types";

export function AgentProfileEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profileData, setProfileData] = useState<Partial<Profile>>({
    display_name: "",
    bio: "",
    location: "",
    website: "",
    instagram_url: "",
    tiktok_url: "",
    youtube_url: "",
  });

  const [artists, setArtists] = useState<Profile[]>([]);
  const [availableArtists, setAvailableArtists] = useState<Profile[]>([]);

  useEffect(() => {
    if (user && profile) {
      if (profile.profile_type !== "agent" || profile.id !== id) {
        navigate("/");
        return;
      }
      fetchProfile();
      fetchArtistRoster();
      fetchAvailableArtists();
    } else if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, profile, id, navigate, loading]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (data) setProfileData(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchArtistRoster = async () => {
    try {
      const { data, error } = await supabase
        .from("agent_artists")
        .select("artist_profile_id")
        .eq("agent_profile_id", id);

      if (error) throw error;
      if (data) {
        // Fetch artist profiles separately
        const artistIds = data.map(aa => aa.artist_profile_id);
        if (artistIds.length > 0) {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .in("id", artistIds);
          
          if (profileError) throw profileError;
          setArtists(profileData || []);
        }
      }
    } catch (error) {
      console.error("Error fetching artist roster:", error);
    }
  };

  const fetchAvailableArtists = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("profile_type", "artist")
        .eq("is_public", true);

      if (error) throw error;
      if (data) setAvailableArtists(data);
    } catch (error) {
      console.error("Error fetching available artists:", error);
    }
  };

  const handleInputChange = (field: keyof Profile, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", id);

      if (error) throw error;
      toast.success("Profile updated successfully");
      navigate(`/agents/${id}`);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAddArtist = async (artistId: string) => {
    try {
      const { error } = await supabase
        .from("agent_artists")
        .insert([{
          agent_profile_id: id,
          artist_profile_id: artistId
        }]);

      if (error) throw error;
      toast.success("Artist added to roster");
      fetchArtistRoster();
    } catch (error) {
      console.error("Error adding artist:", error);
      toast.error("Failed to add artist");
    }
  };

  const handleRemoveArtist = async (artistId: string) => {
    try {
      const { error } = await supabase
        .from("agent_artists")
        .delete()
        .eq("agent_profile_id", id)
        .eq("artist_profile_id", artistId);

      if (error) throw error;
      toast.success("Artist removed from roster");
      fetchArtistRoster();
    } catch (error) {
      console.error("Error removing artist:", error);
      toast.error("Failed to remove artist");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Agent Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="display_name" className="block text-sm font-medium mb-2">
              Display Name
            </label>
            <Input
              id="display_name"
              value={profileData.display_name || ""}
              onChange={(e) => handleInputChange("display_name", e.target.value)}
              placeholder="Your name or agency name"
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-2">
              Bio
            </label>
            <Textarea
              id="bio"
              value={profileData.bio || ""}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Tell us about your agency and experience"
              rows={4}
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium mb-2">
              Location
            </label>
            <Input
              id="location"
              value={profileData.location || ""}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="City, Country"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium mb-2">
              Website
            </label>
            <Input
              id="website"
              value={profileData.website || ""}
              onChange={(e) => handleInputChange("website", e.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div className="flex gap-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Profile"}
            </Button>
            <Button variant="outline" onClick={() => navigate(`/agents/${id}`)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Artist Roster</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {artists.map((artist) => (
              <div key={artist.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{artist.display_name}</h4>
                  <p className="text-sm text-muted-foreground">{artist.location}</p>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleRemoveArtist(artist.id)}
                >
                  Remove
                </Button>
              </div>
            ))}
            
            {artists.length === 0 && (
              <p className="text-muted-foreground">No artists in your roster yet.</p>
            )}
          </div>

          <div className="mt-6">
            <h4 className="font-medium mb-4">Add Artists</h4>
            <div className="space-y-2">
              {availableArtists
                .filter(artist => !artists.some(a => a.id === artist.id))
                .map((artist) => (
                  <div key={artist.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <span className="font-medium">{artist.display_name}</span>
                      <span className="text-sm text-muted-foreground ml-2">{artist.location}</span>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleAddArtist(artist.id)}
                    >
                      Add
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}