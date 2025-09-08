import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HeaderImageEditorProps {
  imageUrl?: string;
  positionY: number;
  onPositionChange: (position: number) => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
}

export const HeaderImageEditor: React.FC<HeaderImageEditorProps> = ({
  imageUrl,
  positionY,
  onPositionChange,
  onImageUpload,
  uploading
}) => {
  const [previewPosition, setPreviewPosition] = useState(positionY);

  const handleSliderChange = (value: number[]) => {
    const newPosition = value[0];
    setPreviewPosition(newPosition);
    onPositionChange(newPosition);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Image de header</Label>
        <Badge variant="outline" className="text-xs">
          Format recommandé: 1200x400px
        </Badge>
      </div>

      {/* Format Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="mb-1"><strong>Format idéal:</strong> 1200x400 pixels (ratio 3:1)</p>
              <p><strong>Formats supportés:</strong> JPG, PNG, WebP • <strong>Taille max:</strong> 5MB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header Image Preview */}
      {imageUrl && (
        <div className="space-y-4">
          <div className="relative">
            <img 
              src={imageUrl} 
              alt="Header preview" 
              className="w-full h-48 object-cover rounded-lg border-2 border-border transition-all duration-200"
              style={{ 
                objectPosition: `center ${previewPosition}%`
              }}
            />
            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
              Position: {previewPosition}%
            </div>
          </div>

          {/* Position Slider */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Position verticale de l'image</Label>
            <div className="px-3">
              <Slider
                value={[previewPosition]}
                onValueChange={handleSliderChange}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground px-3">
              <span>Haut (0%)</span>
              <span>Centre (50%)</span>
              <span>Bas (100%)</span>
            </div>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="header" className="cursor-pointer">
          <div className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-3 rounded-md hover:bg-secondary/90 transition-colors border-2 border-dashed border-border hover:border-primary">
            <Upload className="w-4 h-4" />
            {uploading ? 'Téléchargement...' : imageUrl ? 'Changer l\'image de header' : 'Ajouter une image de header'}
          </div>
        </Label>
        <input
          id="header"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onImageUpload}
          className="hidden"
          disabled={uploading}
        />
      </div>

      {!imageUrl && (
        <div className="h-48 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/20">
          <div className="text-center text-muted-foreground">
            <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucune image de header</p>
            <p className="text-xs">Cliquez pour ajouter une image</p>
          </div>
        </div>
      )}
    </div>
  );
};