import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload } from 'lucide-react';
import { OnboardingData } from '@/hooks/useOnboarding';

interface Step1BasicInfoProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  avatarPreview: string | null;
  setAvatarPreview: (url: string | null) => void;
}

export function Step1BasicInfo({ data, updateData, avatarPreview, setAvatarPreview }: Step1BasicInfoProps) {
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      updateData({ avatar_file: file });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Présentez-vous</h3>
        <p className="text-muted-foreground">
          Ces informations aideront les autres utilisateurs à vous identifier
        </p>
      </div>

      {/* Avatar Upload */}
      <div className="flex flex-col items-center gap-4">
        <Avatar className="w-24 h-24">
          <AvatarImage src={avatarPreview || ''} />
          <AvatarFallback className="text-2xl">
            {data.display_name.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <Label htmlFor="avatar" className="cursor-pointer">
            <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
              <Upload className="w-4 h-4" />
              Choisir une photo
            </div>
          </Label>
          <input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid gap-4">
        <div>
          <Label htmlFor="display_name">
            Nom d'affichage <span className="text-destructive">*</span>
          </Label>
          <Input
            id="display_name"
            value={data.display_name}
            onChange={(e) => updateData({ display_name: e.target.value })}
            placeholder="Votre nom ou nom d'artiste"
            required
          />
        </div>

        <div>
          <Label htmlFor="bio">
            Biographie courte <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="bio"
            value={data.bio}
            onChange={(e) => updateData({ bio: e.target.value })}
            placeholder="Décrivez-vous en quelques lignes..."
            rows={3}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Cette description apparaîtra sur votre profil public
          </p>
        </div>

        <div>
          <Label htmlFor="location">
            Localisation <span className="text-destructive">*</span>
          </Label>
          <Input
            id="location"
            value={data.location}
            onChange={(e) => updateData({ location: e.target.value })}
            placeholder="Ville, Région"
            required
          />
        </div>
      </div>
    </div>
  );
}