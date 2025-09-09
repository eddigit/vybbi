import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Profile, AgentArtist } from "@/lib/types";

export function AgentProfileEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [profileData, setProfileData] = useState<Partial<Profile>>({
    display_name: "",
    bio: "",
    location: "",
    website: "",
    instagram_url: "",
    tiktok_url: "",
    youtube_url: "",
    avatar_url: "",
    email: "",
    phone: "",
  });

  const [confirmedArtists, setConfirmedArtists] = useState<Profile[]>([]);
  const [pendingArtists, setPendingArtists] = useState<Profile[]>([]);
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
        .select("artist_profile_id, representation_status")
        .eq("agent_profile_id", id);

      if (error) throw error;
      if (data) {
        // Separate by status
        const confirmedIds = data.filter(aa => aa.representation_status === 'accepted').map(aa => aa.artist_profile_id);
        const pendingIds = data.filter(aa => aa.representation_status === 'pending').map(aa => aa.artist_profile_id);
        
        // Fetch confirmed artists
        if (confirmedIds.length > 0) {
          const { data: confirmedProfiles, error: confirmedError } = await supabase
            .from("profiles")
            .select("*")
            .in("id", confirmedIds);
          
          if (confirmedError) throw confirmedError;
          setConfirmedArtists(confirmedProfiles || []);
        } else {
          setConfirmedArtists([]);
        }
        
        // Fetch pending artists
        if (pendingIds.length > 0) {
          const { data: pendingProfiles, error: pendingError } = await supabase
            .from("profiles")
            .select("*")
            .in("id", pendingIds);
          
          if (pendingError) throw pendingError;
          setPendingArtists(pendingProfiles || []);
        } else {
          setPendingArtists([]);
        }
      }
    } catch (error) {
      console.error("Error fetching artist roster:", error);
    }
  };

  const fetchAvailableArtists = async () => {
    try {
      // Get current artist IDs to exclude them
      const { data: existingData } = await supabase
        .from("agent_artists")
        .select("artist_profile_id")
        .eq("agent_profile_id", id);
      
      const existingIds = existingData?.map(aa => aa.artist_profile_id) || [];
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("profile_type", "artist")
        .eq("is_public", true)
        .not("id", "in", `(${existingIds.length > 0 ? existingIds.join(",") : "null"})`);

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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', id);

      if (updateError) throw updateError;

      setProfileData(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success("Avatar updated successfully");
      // Refresh the profile in useAuth to update header avatar
      await refreshProfile();
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
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
          artist_profile_id: artistId,
          representation_status: 'pending'
        }]);

      if (error) throw error;
      toast.success("Representation request sent to artist");
      fetchArtistRoster();
      fetchAvailableArtists();
    } catch (error) {
      console.error("Error sending representation request:", error);
      toast.error("Failed to send representation request");
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
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profileData.avatar_url} alt={profileData.display_name} />
              <AvatarFallback className="text-lg">
                {profileData.display_name?.charAt(0)?.toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <Button variant="outline" size="sm" disabled={uploading} asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "Uploading..." : "Change Avatar"}
                  </span>
                </Button>
              </Label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
          </div>

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

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email de contact
            </label>
            <Input
              id="email"
              type="email"
              value={profileData.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="contact@example.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              Téléphone de contact
            </label>
            <Input
              id="phone"
              type="tel"
              value={profileData.phone || ""}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="+33 1 23 45 67 89"
            />
          </div>

          <div className="flex gap-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Profile"}
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Artist Roster</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Confirmed Artists */}
          <div>
            <h4 className="font-medium mb-4">Confirmed Artists</h4>
            <div className="space-y-4">
              {confirmedArtists.map((artist) => (
                <div key={artist.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                  <div>
                    <h5 className="font-medium">{artist.display_name}</h5>
                    <p className="text-sm text-muted-foreground">{artist.location}</p>
                    <span className="inline-block mt-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Confirmed
                    </span>
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
              
              {confirmedArtists.length === 0 && (
                <p className="text-muted-foreground">No confirmed artists yet.</p>
              )}
            </div>
          </div>

          {/* Pending Artists */}
          <div>
            <h4 className="font-medium mb-4">Pending Requests</h4>
            <div className="space-y-4">
              {pendingArtists.map((artist) => (
                <div key={artist.id} className="flex items-center justify-between p-4 border rounded-lg bg-amber-50">
                  <div>
                    <h5 className="font-medium">{artist.display_name}</h5>
                    <p className="text-sm text-muted-foreground">{artist.location}</p>
                    <span className="inline-block mt-1 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                      Awaiting Response
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRemoveArtist(artist.id)}
                  >
                    Cancel Request
                  </Button>
                </div>
              ))}
              
              {pendingArtists.length === 0 && (
                <p className="text-muted-foreground">No pending requests.</p>
              )}
            </div>
          </div>

          {/* Add Artists */}
          <div>
            <h4 className="font-medium mb-4">Send Representation Request</h4>
            <div className="space-y-2">
              {availableArtists.map((artist) => (
                <div key={artist.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <span className="font-medium">{artist.display_name}</span>
                    <span className="text-sm text-muted-foreground ml-2">{artist.location}</span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleAddArtist(artist.id)}
                  >
                    Send Request
                  </Button>
                </div>
              ))}
              
              {availableArtists.length === 0 && (
                <p className="text-muted-foreground">No available artists to add.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}