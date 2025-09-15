import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EventFlyerUploadProps {
  eventId?: string;
  currentFlyerUrl?: string;
  currentPosition?: number;
  onFlyerUploaded?: (flyerUrl: string, positionY: number) => void;
  onFlyerRemoved?: () => void;
  className?: string;
}

export function EventFlyerUpload({
  eventId,
  currentFlyerUrl,
  currentPosition = 50,
  onFlyerUploaded,
  onFlyerRemoved,
  className = ""
}: EventFlyerUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentFlyerUrl || null);
  const [positionY, setPositionY] = useState(currentPosition);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Le fichier est trop volumineux (max 5MB)');
      return;
    }

    setUploading(true);

    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `event-flyers/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      const flyerUrl = urlData.publicUrl;
      setPreviewUrl(flyerUrl);

      // Update event if eventId is provided
      if (eventId) {
        const { error: updateError } = await supabase
          .from('events')
          .update({
            flyer_url: flyerUrl,
            flyer_position_y: positionY
          })
          .eq('id', eventId);

        if (updateError) throw updateError;
      }

      onFlyerUploaded?.(flyerUrl, positionY);
      toast.success('Flyer uploadé avec succès !');
    } catch (error) {
      console.error('Error uploading flyer:', error);
      toast.error('Erreur lors de l\'upload du flyer');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFlyer = async () => {
    if (!previewUrl) return;

    try {
      // Extract file path from URL
      const urlParts = previewUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `event-flyers/${fileName}`;

      // Remove from storage
      const { error: deleteError } = await supabase.storage
        .from('media')
        .remove([filePath]);

      if (deleteError) {
        console.error('Error deleting file:', deleteError);
        // Don't throw here, continue with database update
      }

      // Update event if eventId is provided
      if (eventId) {
        const { error: updateError } = await supabase
          .from('events')
          .update({
            flyer_url: null,
            flyer_position_y: null
          })
          .eq('id', eventId);

        if (updateError) throw updateError;
      }

      setPreviewUrl(null);
      onFlyerRemoved?.();
      toast.success('Flyer supprimé');
    } catch (error) {
      console.error('Error removing flyer:', error);
      toast.error('Erreur lors de la suppression du flyer');
    }
  };

  const handlePositionChange = async (value: number[]) => {
    const newPosition = value[0];
    setPositionY(newPosition);

    // Update event if eventId is provided and flyer exists
    if (eventId && previewUrl) {
      try {
        const { error } = await supabase
          .from('events')
          .update({ flyer_position_y: newPosition })
          .eq('id', eventId);

        if (error) throw error;
        onFlyerUploaded?.(previewUrl, newPosition);
      } catch (error) {
        console.error('Error updating position:', error);
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label className="text-sm font-medium">Flyer de l'événement</Label>
      
      {!previewUrl ? (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-4">
            Ajoutez un flyer pour rendre votre événement plus attractif
          </p>
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            variant="outline"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Upload en cours...' : 'Choisir un fichier'}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            PNG, JPG, WEBP jusqu'à 5MB
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative rounded-lg overflow-hidden bg-muted">
            <img
              src={previewUrl}
              alt="Aperçu du flyer"
              className="w-full h-48 object-cover"
              style={{ objectPosition: `center ${positionY}%` }}
            />
            
            {/* Remove button */}
            <Button
              onClick={handleRemoveFlyer}
              size="sm"
              variant="destructive"
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Position adjustment */}
          <div className="space-y-2">
            <Label className="text-sm">Position verticale de l'image</Label>
            <div className="px-3">
              <Slider
                value={[positionY]}
                onValueChange={handlePositionChange}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Haut</span>
              <span>{positionY}%</span>
              <span>Bas</span>
            </div>
          </div>

          {/* Replace button */}
          <div className="flex gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              variant="outline"
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Upload en cours...' : 'Remplacer le flyer'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}