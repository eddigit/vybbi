import React, { memo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Languages, Star } from 'lucide-react';

interface OptimizedProfileCardProps {
  profile: {
    id: string;
    display_name: string;
    avatar_url?: string;
    location?: string;
    genres?: string[];
    languages?: string[];
    profile_type: string;
  };
  onClick?: () => void;
  className?: string;
}

export const OptimizedProfileCard = memo(({ 
  profile, 
  onClick,
  className = ""
}: OptimizedProfileCardProps) => {
  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fade-in ${className}`}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 ring-2 ring-primary/20 transition-all duration-300 group-hover:ring-primary/40">
            <AvatarImage 
              src={profile.avatar_url} 
              alt={profile.display_name}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
              {profile.display_name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                {profile.display_name}
              </h3>
              <Badge 
                variant="secondary"
                className="capitalize text-xs font-medium"
              >
                {profile.profile_type}
              </Badge>
            </div>
            
            {profile.location && (
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <MapPin className="h-3 w-3" />
                <span>{profile.location}</span>
              </div>
            )}
            
            {profile.genres && profile.genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {profile.genres.slice(0, 3).map((genre) => (
                  <Badge 
                    key={genre}
                    variant="outline" 
                    className="text-xs px-2 py-0.5"
                  >
                    {genre}
                  </Badge>
                ))}
                {profile.genres.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    +{profile.genres.length - 3}
                  </Badge>
                )}
              </div>
            )}
            
            {profile.languages && profile.languages.length > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <Languages className="h-3 w-3" />
                <span>{profile.languages.slice(0, 2).join(', ')}</span>
                {profile.languages.length > 2 && (
                  <span>+{profile.languages.length - 2}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
});

OptimizedProfileCard.displayName = 'OptimizedProfileCard';