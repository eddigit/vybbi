import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Users, Calendar, Star, Bookmark, MessageSquare } from "lucide-react";
import { AdBanner } from "./AdBanner";
import { QuickProfileCard } from "./QuickProfileCard";

export function ProfileSidebar() {
  const { user, profile } = useAuth();

  if (!user || !profile) return null;

  const getProfileTypeColor = (profileType: string) => {
    switch (profileType) {
      case 'artist': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'venue': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'agent': return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'partner': return 'bg-gradient-to-r from-orange-500 to-red-500';
      default: return 'bg-gradient-to-r from-gray-500 to-slate-500';
    }
  };

  const getProfileTypeLabel = (profileType: string) => {
    switch (profileType) {
      case 'artist': return 'Artiste';
      case 'venue': return 'Organisateur';
      case 'agent': return 'Agent';
      case 'partner': return 'Partenaire';
      default: return 'Utilisateur';
    }
  };

  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <QuickProfileCard />
      
      {/* Quick Navigation */}
      <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
        <CardHeader className="pb-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Navigation Rapide
          </h3>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          <Button 
            variant="ghost" 
            className="w-full justify-start h-10 hover:bg-primary/10" 
            asChild
          >
            <Link to="/messages">
              <MessageSquare className="w-4 h-4 mr-3" />
              Messages
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start h-10 hover:bg-primary/10" 
            asChild
          >
            <Link to="/events-manager">
              <Calendar className="w-4 h-4 mr-3" />
              Événements
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start h-10 hover:bg-primary/10" 
            asChild
          >
            <Link to="/dashboard">
              <Star className="w-4 h-4 mr-3" />
              Tableau de bord
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start h-10 hover:bg-primary/10"
          >
            <Bookmark className="w-4 h-4 mr-3" />
            Sauvegardés
          </Button>
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">245</div>
              <div className="text-xs text-muted-foreground">Abonnés</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">89</div>
              <div className="text-xs text-muted-foreground">Publications</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ad Banner */}
      <AdBanner 
        type="sidebar" 
        title="Boostez votre carrière"
        description="Découvrez nos offres premium pour artistes"
        buttonText="En savoir plus"
        imageUrl="/images/brand/vybbi-logo.png"
      />
    </div>
  );
}