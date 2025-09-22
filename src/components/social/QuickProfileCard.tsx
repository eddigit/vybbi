import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, ExternalLink } from "lucide-react";

export function QuickProfileCard() {
  const { user, profile } = useAuth();

  if (!user || !profile) return null;

  const getProfileTypeColor = (profileType: string) => {
    switch (profileType) {
      case 'artist': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'venue': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'agent': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      case 'partner': return 'bg-gradient-to-r from-orange-500 to-red-500 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white';
    }
  };

  const getProfileTypeLabel = (profileType: string) => {
    switch (profileType) {
      case 'artist': return 'Artiste';
      case 'venue': return 'Lieu';
      case 'agent': return 'Agent';
      case 'partner': return 'Partenaire';
      default: return 'Utilisateur';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50 overflow-hidden">
      {/* Cover Image */}
      <div className="h-16 bg-gradient-to-r from-primary/20 to-accent/20 relative">
        <div className="absolute -bottom-8 left-4">
          <Avatar className="w-16 h-16 ring-4 ring-background">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
              {profile.display_name?.charAt(0) || user.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      
      <CardContent className="pt-10 pb-4">
        <div className="space-y-3">
          {/* Name and Type */}
          <div>
            <h3 className="font-semibold text-lg leading-tight">
              {profile.display_name || "Utilisateur"}
            </h3>
            <Badge 
              className={`text-xs font-medium mt-1 ${getProfileTypeColor(profile.profile_type)}`}
            >
              {getProfileTypeLabel(profile.profile_type)}
            </Badge>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {profile.bio}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 h-8 text-xs" 
              asChild
            >
              <Link to={`/profile/edit`}>
                <Settings className="w-3 h-3 mr-1" />
                Modifier
              </Link>
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 h-8 text-xs" 
              asChild
            >
              <Link to={`/profile/${profile.id}`}>
                <ExternalLink className="w-3 h-3 mr-1" />
                Voir profil
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}