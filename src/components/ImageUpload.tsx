import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ImageUploadProps {
  currentImageUrl?: string;
  currentImagePosition?: number;
  onImageChange: (imageUrl: string | null) => void;
  onPositionChange?: (position: number) => void;
  bucket: string;
  folder: string;
  className?: string;
  label?: string;
}

export default function ImageUpload({ 
  currentImageUrl, 
  currentImagePosition = 50,
  onImageChange, 
  onPositionChange,
  bucket, 
  folder, 
  className = "",
  label = "Image"
}: ImageUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('L\'image ne doit pas dépasser 5MB');
      return;
    }

    setUploading(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${folder}/${Date.now()}.${fileExt}`;

      // Delete old image if it exists
      if (currentImageUrl) {
        const oldPath = currentImageUrl.split('/').slice(-3).join('/');
        await supabase.storage.from(bucket).remove([oldPath]);
      }

      // Upload new image
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      onImageChange(publicUrl);
      toast.success('Image téléchargée avec succès');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur lors du téléchargement de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!currentImageUrl) return;

    try {
      // Extract path from URL and remove file
      const path = currentImageUrl.split('/').slice(-3).join('/');
      await supabase.storage.from(bucket).remove([path]);
      onImageChange(null);
      toast.success('Image supprimée');
    } catch (error) {
      console.error('Remove error:', error);
      toast.error('Erreur lors de la suppression de l\'image');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium mb-2">
        {label}
      </label>
      
      {currentImageUrl ? (
        <div className="relative space-y-4">
          <div 
            className="relative w-full h-48 overflow-hidden rounded-lg border"
            style={{
              backgroundImage: `url(${currentImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: `center ${currentImagePosition}%`
            }}
          >
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {onPositionChange && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Position verticale de l'image
              </label>
              <Slider
                value={[currentImagePosition]}
                onValueChange={(value) => onPositionChange(value[0])}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Haut</span>
                <span>Centre</span>
                <span>Bas</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            Aucune image sélectionnée
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Téléchargement...' : 'Choisir une image'}
          </Button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {!currentImageUrl && (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Téléchargement...' : 'Ajouter une image'}
        </Button>
      )}

      <p className="text-xs text-muted-foreground">
        Formats acceptés: JPG, PNG, GIF. Taille maximum: 5MB
      </p>
    </div>
  );
}