import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Building2, X, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/components/ImageUpload';

const musicGenres = [
  'Pop', 'Rock', 'Hip-Hop/Rap', 'R&B/Soul', 'Country', 'Jazz', 'Blues', 'Folk', 'Reggae',
  'Electronic/Dance', 'House', 'Techno', 'Trance', 'Dubstep', 'Classical', 'Alternative',
  'Indie', 'Punk', 'Metal', 'Funk', 'Gospel', 'World Music', 'Latin', 'Afrobeat', 'Reggaeton'
];

export default function VenueProfileEdit() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newGenre, setNewGenre] = useState('');

  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    location: '',
    website: '',
    email: '',
    phone: '',
    experience: '',
    genres: [] as string[],
    avatar_url: '',
    header_url: '',
    header_position_y: 50
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        email: profile.email || '',
        phone: profile.phone || '',
        experience: profile.experience || '',
        genres: profile.genres || [],
        avatar_url: profile.avatar_url || '',
        header_url: (profile as any).header_url || '',
        header_position_y: (profile as any).header_position_y || 50
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name,
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
          email: formData.email,
          phone: formData.phone,
          experience: formData.experience,
          genres: formData.genres,
          avatar_url: formData.avatar_url,
          header_url: formData.header_url,
          header_position_y: formData.header_position_y
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      });

      navigate(`/lieux/${profile.id}`);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddGenre = (genre: string) => {
    if (genre && !formData.genres.includes(genre)) {
      setFormData({
        ...formData,
        genres: [...formData.genres, genre]
      });
    }
    setNewGenre('');
  };

  const handleRemoveGenre = (genreToRemove: string) => {
    setFormData({
      ...formData,
      genres: formData.genres.filter(genre => genre !== genreToRemove)
    });
  };

  if (!profile || profile.profile_type !== 'lieu') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Accès non autorisé</h1>
        <Button onClick={() => navigate('/')}>Retour à l'accueil</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={formData.avatar_url} />
            <AvatarFallback>
              <Building2 className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">Modifier mon profil lieu</h1>
            <p className="text-muted-foreground">Gérez les informations de votre établissement</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Images Section */}
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <ImageUpload
                currentImageUrl={formData.avatar_url}
                onImageChange={(url) => setFormData({ ...formData, avatar_url: url || '' })}
                bucket="avatars"
                folder="venues"
                label="Photo de profil"
              />
            </div>

            {/* Header Image Section - Simplified version without HeaderImageEditor */}
            <div>
              <ImageUpload
                currentImageUrl={formData.header_url}
                currentImagePosition={formData.header_position_y}
                onImageChange={(url) => setFormData({ ...formData, header_url: url || '' })}
                onPositionChange={(position) => setFormData({ ...formData, header_position_y: position })}
                bucket="media"
                folder="headers"
                label="Image de couverture"
              />
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="display_name">Nom de l'établissement *</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="Nom de votre lieu"
                required
              />
            </div>

            <div>
              <Label htmlFor="bio">Description</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Décrivez votre établissement, son ambiance, sa capacité..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="location">Adresse</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Adresse complète de votre établissement"
              />
            </div>

            <div>
              <Label htmlFor="website">Site web</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://monlieu.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@monlieu.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="01 23 45 67 89"
              />
            </div>
          </CardContent>
        </Card>

        {/* Musical Genres */}
        <Card>
          <CardHeader>
            <CardTitle>Styles musicaux accueillis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.genres.map((genre, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {genre}
                  <button
                    type="button"
                    onClick={() => handleRemoveGenre(genre)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newGenre}
                onChange={(e) => setNewGenre(e.target.value)}
                placeholder="Ajouter un style musical"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddGenre(newGenre);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddGenre(newGenre)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {musicGenres.map((genre) => (
                <Button
                  key={genre}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddGenre(genre)}
                  disabled={formData.genres.includes(genre)}
                  className="justify-start"
                >
                  {genre}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations complémentaires</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="experience">À propos de votre établissement</Label>
              <Textarea
                id="experience"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="Histoire de votre lieu, équipements techniques, services proposés..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
          </Button>
        </div>
      </form>
    </div>
  );
}