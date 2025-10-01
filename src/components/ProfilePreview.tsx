import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Music, Languages } from 'lucide-react';
import { getTalentById } from '@/lib/talents';
import { LANGUAGES } from '@/lib/languages';

interface ProfilePreviewProps {
  displayName: string;
  bio: string;
  location: string;
  genres: string[];
  talents: string[];
  languages: string[];
  avatarPreview: string | null;
}

export function ProfilePreview({
  displayName,
  bio,
  location,
  genres,
  talents,
  languages,
  avatarPreview
}: ProfilePreviewProps) {
  const getLanguageName = (code: string) => {
    return LANGUAGES.find(l => l.code === code)?.name || code;
  };

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardContent className="p-6 space-y-4">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={avatarPreview || undefined} />
              <AvatarFallback className="text-2xl bg-primary/10">
                {displayName ? displayName.charAt(0).toUpperCase() : '?'}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div>
            <h3 className="text-xl font-bold">
              {displayName || 'Nom d\'artiste'}
            </h3>
            {location && (
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                <span>{location}</span>
              </div>
            )}
          </div>
        </div>

        {bio && (
          <p className="text-sm text-muted-foreground text-center line-clamp-2">
            {bio}
          </p>
        )}

        {/* Genres */}
        {genres.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Music className="h-3 w-3" />
              <span>Genres</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {genres.slice(0, 5).map((genre) => (
                <Badge key={genre} variant="secondary" className="text-xs">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Talents */}
        {talents.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground">
              Talents
            </div>
            <div className="flex flex-wrap gap-1.5">
              {talents.slice(0, 4).map((talentId) => {
                const talent = getTalentById(talentId);
                return talent ? (
                  <Badge key={talentId} variant="outline" className="text-xs">
                    <span className="mr-1">{talent.icon}</span>
                    {talent.label}
                  </Badge>
                ) : null;
              })}
              {talents.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{talents.length - 4}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Langues */}
        {languages.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Languages className="h-3 w-3" />
              <span>Langues</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {languages.slice(0, 3).map((code) => (
                <Badge key={code} variant="outline" className="text-xs">
                  {getLanguageName(code)}
                </Badge>
              ))}
              {languages.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{languages.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
