import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import ImageUpload from '@/components/ImageUpload';
import { Music, Plus, X, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const musicReleaseSchema = z.object({
  title: z.string().min(1, 'Titre requis'),
  artist_name: z.string().min(1, 'Nom d\'artiste requis'),
  album_name: z.string().optional(),
  genre: z.string().optional(),
  label: z.string().optional(),
  copyright_owner: z.string().optional(),
  isrc_code: z.string().optional(),
  distribution_service: z.string().optional(),
  spotify_url: z.string().url('URL invalide').optional().or(z.literal('')),
  apple_music_url: z.string().url('URL invalide').optional().or(z.literal('')),
  soundcloud_url: z.string().url('URL invalide').optional().or(z.literal('')),
  youtube_url: z.string().url('URL invalide').optional().or(z.literal('')),
  royalty_percentage: z.number().min(0).max(100).default(100),
  is_original_composition: z.boolean().default(true),
  release_date: z.string().optional(),
  lyrics: z.string().optional(),
  bpm: z.number().min(60).max(200).optional(),
  key_signature: z.string().optional(),
  explicit_content: z.boolean().default(false),
  status: z.enum(['draft', 'published', 'private']).default('draft')
});

type MusicReleaseForm = z.infer<typeof musicReleaseSchema>;

interface Collaborator {
  name: string;
  role: string;
  royalty_percentage: number;
}

interface MusicReleaseWidgetProps {
  profileId: string;
  onSuccess?: () => void;
}

export const MusicReleaseWidget: React.FC<MusicReleaseWidgetProps> = ({
  profileId,
  onSuccess
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coverImage, setCoverImage] = useState<string>('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<MusicReleaseForm>({
    resolver: zodResolver(musicReleaseSchema),
    defaultValues: {
      royalty_percentage: 100,
      is_original_composition: true,
      explicit_content: false,
      status: 'draft'
    }
  });

  const addCollaborator = () => {
    setCollaborators([...collaborators, { name: '', role: '', royalty_percentage: 0 }]);
  };

  const removeCollaborator = (index: number) => {
    setCollaborators(collaborators.filter((_, i) => i !== index));
  };

  const updateCollaborator = (index: number, field: keyof Collaborator, value: string | number) => {
    const updated = [...collaborators];
    updated[index] = { ...updated[index], [field]: value };
    setCollaborators(updated);
  };

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
    } else {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier audio valide.",
        variant: "destructive"
      });
    }
  };

  const uploadAudioFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `music/${profileId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const onSubmit = async (data: MusicReleaseForm) => {
    setIsLoading(true);
    try {
      // Upload audio file if provided
      let audioUrl = '';
      if (audioFile) {
        audioUrl = await uploadAudioFile(audioFile);
      }

      // Create music release
      const { data: release, error } = await supabase
        .from('music_releases')
        .insert({
          title: data.title,
          artist_name: data.artist_name,
          album_name: data.album_name,
          genre: data.genre,
          label: data.label,
          copyright_owner: data.copyright_owner,
          isrc_code: data.isrc_code,
          distribution_service: data.distribution_service,
          spotify_url: data.spotify_url,
          apple_music_url: data.apple_music_url,
          soundcloud_url: data.soundcloud_url,
          youtube_url: data.youtube_url,
          royalty_percentage: data.royalty_percentage,
          is_original_composition: data.is_original_composition,
          release_date: data.release_date ? data.release_date : null,
          lyrics: data.lyrics,
          bpm: data.bpm,
          key_signature: data.key_signature,
          explicit_content: data.explicit_content,
          status: data.status,
          profile_id: profileId,
          cover_image_url: coverImage,
          featured_artists: JSON.stringify(collaborators.filter(c => c.role === 'featuring'))
        })
        .select()
        .single();

      if (error) throw error;

      // Create media asset for audio file
      if (audioUrl && release) {
        await supabase.from('media_assets').insert({
          profile_id: profileId,
          music_release_id: release.id,
          file_name: audioFile!.name,
          file_url: audioUrl,
          media_type: 'audio',
          file_size: audioFile!.size
        });
      }

      // Add collaborators
      if (collaborators.length > 0 && release) {
        const collaboratorRecords = collaborators.map(collab => ({
          music_release_id: release.id,
          collaborator_name: collab.name,
          role: collab.role,
          royalty_percentage: collab.royalty_percentage
        }));

        await supabase.from('music_collaborators').insert(collaboratorRecords);
      }

      toast({
        title: "Succès",
        description: "Votre sortie musicale a été ajoutée avec succès."
      });

      setIsOpen(false);
      form.reset();
      setCoverImage('');
      setAudioFile(null);
      setCollaborators([]);
      onSuccess?.();

    } catch (error) {
      console.error('Error creating music release:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'ajout de votre sortie musicale.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="p-6">
          <Button
            onClick={() => setIsOpen(true)}
            variant="ghost"
            className="w-full h-32 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Music className="h-8 w-8" />
            <span className="text-lg font-medium">Ajouter une sortie musicale</span>
            <span className="text-sm">Partagez votre musique avec gestion des droits d'auteur</span>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Nouvelle sortie musicale
          </span>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Cover Image Upload */}
          <div>
            <Label>Pochette de l'album</Label>
            <ImageUpload
              currentImageUrl={coverImage}
              onImageChange={setCoverImage}
              bucket="media"
              folder={`music/${profileId}`}
              className="aspect-square max-w-64"
            />
          </div>

          {/* Audio File Upload */}
          <div>
            <Label htmlFor="audio-upload">Fichier audio</Label>
            <div className="mt-2">
              <input
                id="audio-upload"
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('audio-upload')?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {audioFile ? audioFile.name : 'Sélectionner un fichier audio'}
              </Button>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                {...form.register('title')}
                placeholder="Nom de la chanson"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="artist_name">Artiste *</Label>
              <Input
                id="artist_name"
                {...form.register('artist_name')}
                placeholder="Nom de l'artiste"
              />
            </div>

            <div>
              <Label htmlFor="album_name">Album</Label>
              <Input
                id="album_name"
                {...form.register('album_name')}
                placeholder="Nom de l'album"
              />
            </div>

            <div>
              <Label htmlFor="genre">Genre</Label>
              <Select onValueChange={(value) => form.setValue('genre', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hip-hop">Hip-Hop</SelectItem>
                  <SelectItem value="rap">Rap</SelectItem>
                  <SelectItem value="r&b">R&B</SelectItem>
                  <SelectItem value="pop">Pop</SelectItem>
                  <SelectItem value="rock">Rock</SelectItem>
                  <SelectItem value="jazz">Jazz</SelectItem>
                  <SelectItem value="blues">Blues</SelectItem>
                  <SelectItem value="reggae">Reggae</SelectItem>
                  <SelectItem value="electronic">Électronique</SelectItem>
                  <SelectItem value="folk">Folk</SelectItem>
                  <SelectItem value="country">Country</SelectItem>
                  <SelectItem value="classical">Classique</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Copyright Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations de droits d'auteur</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="copyright_owner">Propriétaire des droits</Label>
                <Input
                  id="copyright_owner"
                  {...form.register('copyright_owner')}
                  placeholder="Votre nom ou société"
                />
              </div>

              <div>
                <Label htmlFor="isrc_code">Code ISRC</Label>
                <Input
                  id="isrc_code"
                  {...form.register('isrc_code')}
                  placeholder="Ex: FRXXX2100001"
                />
              </div>

              <div>
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  {...form.register('label')}
                  placeholder="Nom du label"
                />
              </div>

              <div>
                <Label htmlFor="distribution_service">Service de distribution</Label>
                <Select onValueChange={(value) => form.setValue('distribution_service', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distrokid">DistroKid</SelectItem>
                    <SelectItem value="tunecore">TuneCore</SelectItem>
                    <SelectItem value="cdbaby">CD Baby</SelectItem>
                    <SelectItem value="ditto">Ditto Music</SelectItem>
                    <SelectItem value="believe">Believe Digital</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_original"
                checked={form.watch('is_original_composition')}
                onCheckedChange={(checked) => form.setValue('is_original_composition', checked)}
              />
              <Label htmlFor="is_original">Composition originale</Label>
            </div>
          </div>

          {/* Streaming Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Liens streaming</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="spotify_url">Spotify</Label>
                <Input
                  id="spotify_url"
                  {...form.register('spotify_url')}
                  placeholder="https://open.spotify.com/track/..."
                />
              </div>

              <div>
                <Label htmlFor="apple_music_url">Apple Music</Label>
                <Input
                  id="apple_music_url"
                  {...form.register('apple_music_url')}
                  placeholder="https://music.apple.com/..."
                />
              </div>

              <div>
                <Label htmlFor="soundcloud_url">SoundCloud</Label>
                <Input
                  id="soundcloud_url"
                  {...form.register('soundcloud_url')}
                  placeholder="https://soundcloud.com/..."
                />
              </div>

              <div>
                <Label htmlFor="youtube_url">YouTube</Label>
                <Input
                  id="youtube_url"
                  {...form.register('youtube_url')}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>
          </div>

          {/* Collaborators */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Collaborateurs</h3>
              <Button type="button" variant="outline" size="sm" onClick={addCollaborator}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>

            {collaborators.map((collaborator, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Collaborateur {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCollaborator(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input
                    placeholder="Nom"
                    value={collaborator.name}
                    onChange={(e) => updateCollaborator(index, 'name', e.target.value)}
                  />
                  <Select
                    value={collaborator.role}
                    onValueChange={(value) => updateCollaborator(index, 'role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featuring">Featuring</SelectItem>
                      <SelectItem value="producer">Producteur</SelectItem>
                      <SelectItem value="songwriter">Parolier</SelectItem>
                      <SelectItem value="composer">Compositeur</SelectItem>
                      <SelectItem value="mixer">Mixeur</SelectItem>
                      <SelectItem value="mastering">Mastering</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="% Royalties"
                    min="0"
                    max="100"
                    value={collaborator.royalty_percentage}
                    onChange={(e) => updateCollaborator(index, 'royalty_percentage', Number(e.target.value))}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="release_date">Date de sortie</Label>
              <Input
                id="release_date"
                type="date"
                {...form.register('release_date')}
              />
            </div>

            <div>
              <Label htmlFor="bpm">BPM</Label>
              <Input
                id="bpm"
                type="number"
                min="60"
                max="200"
                {...form.register('bpm', { valueAsNumber: true })}
                placeholder="120"
              />
            </div>

            <div>
              <Label htmlFor="key_signature">Tonalité</Label>
              <Select onValueChange={(value) => form.setValue('key_signature', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="C">Do majeur</SelectItem>
                  <SelectItem value="Am">La mineur</SelectItem>
                  <SelectItem value="G">Sol majeur</SelectItem>
                  <SelectItem value="Em">Mi mineur</SelectItem>
                  <SelectItem value="D">Ré majeur</SelectItem>
                  <SelectItem value="Bm">Si mineur</SelectItem>
                  <SelectItem value="A">La majeur</SelectItem>
                  <SelectItem value="F#m">Fa# mineur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="lyrics">Paroles</Label>
            <Textarea
              id="lyrics"
              {...form.register('lyrics')}
              placeholder="Paroles de la chanson..."
              rows={6}
            />
          </div>

          {/* Status and Flags */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="explicit"
                checked={form.watch('explicit_content')}
                onCheckedChange={(checked) => form.setValue('explicit_content', checked)}
              />
              <Label htmlFor="explicit">Contenu explicite</Label>
            </div>

            <Select
              value={form.watch('status')}
              onValueChange={(value: 'draft' | 'published' | 'private') => form.setValue('status', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="published">Publié</SelectItem>
                <SelectItem value="private">Privé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Sauvegarde...' : 'Ajouter la sortie'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};