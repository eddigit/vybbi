import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Image as ImageIcon, Plus, X, Edit } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/components/ImageUpload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GalleryImage {
  id: string;
  image_url: string;
  image_position_y: number;
  description: string | null;
  display_order: number;
}

interface VenueGalleryProps {
  venueProfileId: string;
  isOwner?: boolean;
}

export function VenueGallery({ venueProfileId, isOwner = false }: VenueGalleryProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newImage, setNewImage] = useState({
    url: '',
    description: '',
    position_y: 50
  });

  useEffect(() => {
    fetchGalleryImages();
  }, [venueProfileId]);

  const fetchGalleryImages = async () => {
    const { data, error } = await supabase
      .from('venue_gallery')
      .select('*')
      .eq('venue_profile_id', venueProfileId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching gallery images:', error);
    } else {
      setImages(data || []);
    }
    setLoading(false);
  };

  const handleAddImage = async () => {
    if (!newImage.url || !profile) return;

    const { error } = await supabase
      .from('venue_gallery')
      .insert([{
        venue_profile_id: venueProfileId,
        image_url: newImage.url,
        image_position_y: newImage.position_y,
        description: newImage.description || null,
        display_order: images.length
      }]);

    if (error) {
      console.error('Error adding image:', error);
      toast({ title: "Erreur", description: "Impossible d'ajouter l'image", variant: "destructive" });
    } else {
      toast({ title: "Succès", description: "Image ajoutée à la galerie" });
      setIsAddModalOpen(false);
      setNewImage({ url: '', description: '', position_y: 50 });
      fetchGalleryImages();
    }
  };

  const handleRemoveImage = async (imageId: string) => {
    const { error } = await supabase
      .from('venue_gallery')
      .delete()
      .eq('id', imageId);

    if (error) {
      console.error('Error removing image:', error);
      toast({ title: "Erreur", description: "Impossible de supprimer l'image", variant: "destructive" });
    } else {
      toast({ title: "Succès", description: "Image supprimée" });
      fetchGalleryImages();
    }
  };

  if (loading) {
    return <div className="text-center p-4">Chargement de la galerie...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Galerie photo
        </CardTitle>
        {isOwner && (
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Ajouter une photo</h3>
                
                <div>
                  <Label>Image</Label>
                  <ImageUpload
                    currentImageUrl={newImage.url}
                    currentImagePosition={newImage.position_y}
                    onImageChange={(url) => setNewImage({ ...newImage, url: url || '' })}
                    onPositionChange={(position) => setNewImage({ ...newImage, position_y: position })}
                    bucket="media"
                    folder="gallery"
                    label="Photo de la galerie"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (optionnelle)</Label>
                  <Input
                    id="description"
                    value={newImage.description}
                    onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
                    placeholder="Décrivez cette photo..."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddImage} disabled={!newImage.url}>
                    Ajouter à la galerie
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {images.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune photo dans la galerie</p>
            {isOwner && <p className="text-sm">Ajoutez des photos pour présenter votre établissement</p>}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <Dialog>
                  <DialogTrigger asChild>
                    <div 
                      className="relative aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedImage(image.image_url)}
                    >
                      <img
                        src={image.image_url}
                        alt={image.description || 'Photo de la galerie'}
                        className="w-full h-full object-cover"
                        style={{
                          objectPosition: `center ${image.image_position_y}%`
                        }}
                      />
                      {image.description && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <p className="text-white text-xs truncate">{image.description}</p>
                        </div>
                      )}
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <img
                      src={image.image_url}
                      alt={image.description || 'Photo de la galerie'}
                      className="w-full h-auto max-h-[80vh] object-contain"
                    />
                    {image.description && (
                      <p className="text-center text-muted-foreground mt-2">{image.description}</p>
                    )}
                  </DialogContent>
                </Dialog>
                
                {isOwner && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                    onClick={() => handleRemoveImage(image.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}