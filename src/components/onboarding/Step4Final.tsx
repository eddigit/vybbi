import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Globe, Lock, MessageCircle, MessageSquareOff } from 'lucide-react';
import { OnboardingData } from '@/hooks/useOnboarding';

interface Step4FinalProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  avatarPreview: string | null;
  profileType: string;
}

export function Step4Final({ data, updateData, avatarPreview, profileType }: Step4FinalProps) {
  const getCompletionScore = () => {
    let score = 0;
    
    // Basic info (60%)
    if (data.display_name) score += 10;
    if (data.bio) score += 15;
    if (avatarPreview || data.avatar_file) score += 15;
    if (data.location) score += 10;
    if (data.genres.length > 0) score += 10;
    
    // Contact/Links (25%)
    if (profileType === 'artist') {
      if (data.spotify_url || data.soundcloud_url || data.youtube_url) score += 15;
    } else {
      if (data.email) score += 15;
    }
    
    // Additional (15%)
    if (data.experience || data.venue_category) score += 10;
    if (data.languages.length > 0) score += 5;
    
    return Math.min(score, 100);
  };

  const completionScore = getCompletionScore();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Finaliser votre profil</h3>
        <p className="text-muted-foreground">
          Vérifiez vos paramètres de confidentialité et votre profil
        </p>
      </div>

      {/* Profile Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aperçu de votre profil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={avatarPreview || ''} />
              <AvatarFallback className="text-xl">
                {data.display_name.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h4 className="font-semibold text-lg">{data.display_name || 'Nom non renseigné'}</h4>
              <p className="text-muted-foreground text-sm mb-2">{data.location || 'Localisation non renseignée'}</p>
              <p className="text-sm mb-3">{data.bio || 'Biographie non renseignée'}</p>
              
              {data.genres.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {data.genres.slice(0, 3).map((genre) => (
                    <Badge key={genre} variant="secondary" className="text-xs">
                      {genre}
                    </Badge>
                  ))}
                  {data.genres.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{data.genres.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Score */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Complétion du profil</span>
            <span className="text-sm font-bold text-primary">{completionScore}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionScore}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {completionScore >= 70 ? '✅ Votre profil est bien complété !' 
             : '💡 Ajoutez plus d\'informations pour un profil plus attractif'}
          </p>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Paramètres de confidentialité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {data.is_public ? (
                <Globe className="w-5 h-5 text-primary" />
              ) : (
                <Lock className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <Label className="text-sm font-medium">Profil public</Label>
                <p className="text-xs text-muted-foreground">
                  {data.is_public 
                    ? 'Votre profil sera visible par tous les utilisateurs'
                    : 'Votre profil ne sera visible que par vous'
                  }
                </p>
              </div>
            </div>
            <Switch
              checked={data.is_public}
              onCheckedChange={(checked) => updateData({ is_public: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {data.accepts_direct_contact ? (
                <MessageCircle className="w-5 h-5 text-primary" />
              ) : (
                <MessageSquareOff className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <Label className="text-sm font-medium">Messages directs</Label>
                <p className="text-xs text-muted-foreground">
                  {data.accepts_direct_contact
                    ? 'Autres utilisateurs peuvent vous envoyer des messages'
                    : 'Messages directs désactivés'
                  }
                </p>
              </div>
            </div>
            <Switch
              checked={data.accepts_direct_contact}
              onCheckedChange={(checked) => updateData({ accepts_direct_contact: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
        <p className="text-sm">
          🎉 <strong>Félicitations !</strong> Vous êtes prêt(e) à rejoindre la communauté Vybbi. 
          Vous pourrez toujours modifier ces informations plus tard depuis votre profil.
        </p>
      </div>
    </div>
  );
}