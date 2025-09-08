import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Trash2, Music, Instagram, Youtube } from 'lucide-react';
import { Profile, MediaAsset, MediaType } from '@/lib/types';

export default function ArtistProfileEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile: authProfile } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    location: '',
    website: '',
    genres: [] as string[],
    genresString: '', // Add this for the input display
    languages: [] as string[],
    experience: '',
    spotify_url: '',
    soundcloud_url: '',
    youtube_url: '',
    instagram_url: '',
    tiktok_url: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchMediaAssets();
    }
  }, [id, user]);

  const fetchProfile = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Check if user owns this profile - but only if user is loaded
      if (user && data.user_id !== user.id) {
        console.log('Access denied - Profile user_id:', data.user_id, 'Current user id:', user.id);
        toast({ title: "Accès refusé", variant: "destructive" });
        navigate('/', { replace: true });
        return;
      }

      // If user is not loaded yet, don't show access denied
      if (!user) {
        setLoading(false);
        return;
      }

      setProfile(data);
      setFormData({
        display_name: data.display_name || '',
        bio: data.bio || '',
        location: data.location || '',
        website: data.website || '',
        genres: data.genres || [],
        genresString: (data.genres || []).join(', '),
        languages: data.languages || [],
        experience: data.experience || '',
        spotify_url: data.spotify_url || '',
        soundcloud_url: data.soundcloud_url || '',
        youtube_url: data.youtube_url || '',
        instagram_url: data.instagram_url || '',
        tiktok_url: data.tiktok_url || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({ title: "Erreur", description: "Impossible de charger le profil", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchMediaAssets = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('media_assets')
        .select('*')
        .eq('profile_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMediaAssets(data || []);
    } catch (error) {
      console.error('Error fetching media assets:', error);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', id);

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      toast({ title: "Avatar mis à jour" });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({ title: "Erreur", description: "Impossible de télécharger l'avatar", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !id) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      const mediaType: 'image' | 'video' | 'audio' = file.type.startsWith('image/') ? 'image' : 
                       file.type.startsWith('video/') ? 'video' : 'audio';

      await supabase
        .from('media_assets')
        .insert({
          profile_id: id,
          media_type: mediaType,
          file_url: publicUrl,
          file_name: file.name
        });

      await fetchMediaAssets();
      toast({ title: "Média ajouté" });
    } catch (error) {
      console.error('Error uploading media:', error);
      toast({ title: "Erreur", description: "Impossible de télécharger le média", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string, fileUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = fileUrl.split('/');
      const fileName = urlParts.slice(-2).join('/'); // user_id/filename

      await supabase.storage.from('media').remove([fileName]);
      await supabase.from('media_assets').delete().eq('id', mediaId);
      
      setMediaAssets(prev => prev.filter(m => m.id !== mediaId));
      toast({ title: "Média supprimé" });
    } catch (error) {
      console.error('Error deleting media:', error);
      toast({ title: "Erreur", description: "Impossible de supprimer le média", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!id) return;
    
    setSaving(true);
    try {
      // Convert genresString to genres array before saving
      const genresArray = formData.genresString
        .split(',')
        .map(g => g.trim())
        .filter(g => g.length > 0);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name,
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
          genres: genresArray.length > 0 ? genresArray : null,
          languages: formData.languages.length > 0 ? formData.languages : null,
          experience: formData.experience,
          spotify_url: formData.spotify_url || null,
          soundcloud_url: formData.soundcloud_url || null,
          youtube_url: formData.youtube_url || null,
          instagram_url: formData.instagram_url || null,
          tiktok_url: formData.tiktok_url || null
        })
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: "Profil sauvegardé" });
      navigate(`/artists/${id}`);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({ title: "Erreur", description: "Impossible de sauvegarder", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return <div>Profil introuvable</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Modifier mon profil d'artiste</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback>{formData.display_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="avatar" className="cursor-pointer">
                <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Téléchargement...' : 'Changer avatar'}
                </div>
              </Label>
              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploading}
              />
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="display_name">Nom d'artiste *</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="location">Localisation</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Biographie</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={4}
              placeholder="Parlez-nous de votre parcours musical..."
            />
          </div>

          <div>
            <Label htmlFor="genres">Genres musicaux (séparés par des virgules)</Label>
            <Input
              id="genres"
              value={formData.genresString}
              onChange={(e) => handleInputChange('genresString', e.target.value)}
              placeholder="Rock, Jazz, Pop..."
            />
          </div>

          <div>
            <Label>Langues parlées</Label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-2">
              {[
                { code: 'fr', name: 'Français', flag: '🇫🇷' },
                { code: 'en', name: 'English', flag: '🇬🇧' },
                { code: 'es', name: 'Español', flag: '🇪🇸' },
                { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
                { code: 'it', name: 'Italiano', flag: '🇮🇹' },
                { code: 'pt', name: 'Português', flag: '🇵🇹' },
                { code: 'ar', name: 'العربية', flag: '🇸🇦' },
                { code: 'ja', name: '日本語', flag: '🇯🇵' },
                { code: 'ko', name: '한국어', flag: '🇰🇷' },
                { code: 'zh', name: '中文', flag: '🇨🇳' },
                { code: 'ru', name: 'Русский', flag: '🇷🇺' },
                { code: 'nl', name: 'Nederlands', flag: '🇳🇱' }
              ].map((lang) => (
                <Button
                  key={lang.code}
                  type="button"
                  variant={formData.languages.includes(lang.code) ? "default" : "outline"}
                  size="sm"
                  className="justify-start text-xs h-auto py-2"
                  onClick={() => {
                    const newLanguages = formData.languages.includes(lang.code)
                      ? formData.languages.filter(l => l !== lang.code)
                      : [...formData.languages, lang.code];
                    handleInputChange('languages', newLanguages);
                  }}
                >
                  <span className="mr-1">{lang.flag}</span>
                  {lang.name}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="experience">Expérience</Label>
            <Input
              id="experience"
              value={formData.experience}
              onChange={(e) => handleInputChange('experience', e.target.value)}
              placeholder="10 ans d'expérience, concerts..."
            />
          </div>

          <div>
            <Label htmlFor="website">Site web</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
            />
          </div>

          {/* Social Media Links */}
          <div>
            <Label className="text-base font-semibold">Réseaux sociaux et plateformes</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <Label htmlFor="spotify_url" className="flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  Spotify
                </Label>
                <Input
                  id="spotify_url"
                  type="url"
                  value={formData.spotify_url}
                  onChange={(e) => handleInputChange('spotify_url', e.target.value)}
                  placeholder="https://open.spotify.com/artist/..."
                />
              </div>
              <div>
                <Label htmlFor="soundcloud_url" className="flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  SoundCloud
                </Label>
                <Input
                  id="soundcloud_url"
                  type="url"
                  value={formData.soundcloud_url}
                  onChange={(e) => handleInputChange('soundcloud_url', e.target.value)}
                  placeholder="https://soundcloud.com/..."
                />
              </div>
              <div>
                <Label htmlFor="youtube_url" className="flex items-center gap-2">
                  <Youtube className="w-4 h-4" />
                  YouTube
                </Label>
                <Input
                  id="youtube_url"
                  type="url"
                  value={formData.youtube_url}
                  onChange={(e) => handleInputChange('youtube_url', e.target.value)}
                  placeholder="https://youtube.com/@..."
                />
              </div>
              <div>
                <Label htmlFor="instagram_url" className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  Instagram
                </Label>
                <Input
                  id="instagram_url"
                  type="url"
                  value={formData.instagram_url}
                  onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <Label htmlFor="tiktok_url">TikTok</Label>
                <Input
                  id="tiktok_url"
                  type="url"
                  value={formData.tiktok_url}
                  onChange={(e) => handleInputChange('tiktok_url', e.target.value)}
                  placeholder="https://tiktok.com/@..."
                />
              </div>
            </div>
          </div>

          {/* Media Gallery */}
          <div>
            <Label className="text-base font-semibold">Galerie média</Label>
            <div className="mt-2">
              <Label htmlFor="media" className="cursor-pointer">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {uploading ? 'Téléchargement...' : 'Cliquez pour ajouter des photos, vidéos ou musiques'}
                  </p>
                </div>
              </Label>
              <input
                id="media"
                type="file"
                accept="image/*,video/*,audio/*"
                onChange={handleMediaUpload}
                className="hidden"
                disabled={uploading}
              />
            </div>
            
            {mediaAssets.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {mediaAssets.map((media) => (
                  <div key={media.id} className="relative group">
                    {media.media_type === 'image' ? (
                      <img
                        src={media.file_url}
                        alt={media.file_name}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-24 bg-muted rounded-lg flex items-center justify-center">
                        <Music className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteMedia(media.id, media.file_url)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex gap-4">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
            <Button variant="outline" onClick={() => navigate(`/artists/${id}`)}>
              Annuler
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}