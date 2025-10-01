import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Mail, Phone, Globe, Instagram, Music, Headphones, Youtube } from 'lucide-react';
import { OnboardingData } from '@/hooks/useOnboarding';

interface Step3ContactProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  profileType: string;
}

export function Step3Contact({ data, updateData, profileType }: Step3ContactProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Contact et liens</h3>
        <p className="text-muted-foreground">
          Comment peut-on vous contacter et vous suivre ?
        </p>
      </div>

      {/* Contact Information */}
      <div className="grid gap-4">
        <div>
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email {profileType !== 'artist' && <span className="text-destructive">*</span>}
          </Label>
          <Input
            id="email"
            type="text"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            placeholder="votre@email.com (tous formats acceptés)"
            required={profileType !== 'artist'}
          />
        </div>

        <div>
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Téléphone
          </Label>
          <Input
            id="phone"
            type="text"
            value={data.phone}
            onChange={(e) => updateData({ phone: e.target.value })}
            placeholder="06 12 34 56 78 ou +33 6 12 34 56 78 (tous formats acceptés)"
          />
        </div>

        <div>
          <Label htmlFor="website" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Site web
          </Label>
          <Input
            id="website"
            type="text"
            value={data.website}
            onChange={(e) => updateData({ website: e.target.value })}
            placeholder="votre-site.com (avec ou sans https://)"
          />
        </div>
      </div>

      {/* Social Media */}
      <div className="space-y-4">
        <h4 className="font-medium">Réseaux sociaux et plateformes</h4>
        
        <div>
          <Label htmlFor="instagram_url" className="flex items-center gap-2">
            <Instagram className="w-4 h-4" />
            Instagram
          </Label>
          <Input
            id="instagram_url"
            type="text"
            value={data.instagram_url}
            onChange={(e) => updateData({ instagram_url: e.target.value })}
            placeholder="@votre-compte ou lien complet"
          />
        </div>

        {profileType === 'artist' && (
          <>
            <div>
              <Label htmlFor="spotify_url" className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                Spotify
              </Label>
              <Input
                id="spotify_url"
                type="text"
                value={data.spotify_url}
                onChange={(e) => updateData({ spotify_url: e.target.value })}
                placeholder="@votre-artiste ou lien complet"
              />
            </div>

            <div>
              <Label htmlFor="soundcloud_url" className="flex items-center gap-2">
                <Headphones className="w-4 h-4" />
                SoundCloud
              </Label>
              <Input
                id="soundcloud_url"
                type="text"
                value={data.soundcloud_url}
                onChange={(e) => updateData({ soundcloud_url: e.target.value })}
                placeholder="@votre-compte ou lien complet"
              />
            </div>

            <div>
              <Label htmlFor="youtube_url" className="flex items-center gap-2">
                <Youtube className="w-4 h-4" />
                YouTube
              </Label>
              <Input
                id="youtube_url"
                type="text"
                value={data.youtube_url}
                onChange={(e) => updateData({ youtube_url: e.target.value })}
                placeholder="@votre-chaine ou lien complet"
              />
            </div>

            <div>
              <Label htmlFor="tiktok_url" className="flex items-center gap-2">
                <span className="w-4 h-4 text-center font-bold text-xs">T</span>
                TikTok
              </Label>
              <Input
                id="tiktok_url"
                type="text"
                value={data.tiktok_url}
                onChange={(e) => updateData({ tiktok_url: e.target.value })}
                placeholder="@votre-compte ou lien complet"
              />
            </div>
          </>
        )}
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Conseil :</strong> Plus vous renseignez d'informations, plus il sera facile pour les autres utilisateurs de vous trouver et vous contacter !
        </p>
      </div>
    </div>
  );
}