import { OnlineUsers } from "./OnlineUsers";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdBanner } from "./AdBanner";
import { TrendingUp, Calendar, Users, ExternalLink, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const newsItems = [
  {
    id: 1,
    title: "Nouvelle fonctionnalité: Live Streaming",
    description: "Diffusez vos performances en direct sur Vybbi",
    time: "Il y a 2h",
    category: "Fonctionnalité"
  },
  {
    id: 2,
    title: "Festival d'été: Candidatures ouvertes",
    description: "Postulez avant le 30 septembre",
    time: "Il y a 4h",
    category: "Événement"
  },
  {
    id: 3,
    title: "Mise à jour de l'algorithme de recommandation",
    description: "Découvrez de nouveaux talents plus facilement",
    time: "Il y a 1j",
    category: "Mise à jour"
  }
];

const suggestedConnections = [
  {
    id: 1,
    name: "DJ Martin",
    type: "artist",
    avatar: "/lovable-uploads/341ddf13-d369-435e-afa6-45e70902ebf8.png",
    mutualConnections: 12
  },
  {
    id: 2,
    name: "Club Moonlight",
    type: "venue",
    avatar: "/lovable-uploads/7c8bbe7e-fcc0-4a02-b295-fd73a7ca614c.png",
    mutualConnections: 8
  },
  {
    id: 3,
    name: "Sarah Events",
    type: "agent",
    avatar: "/lovable-uploads/b2d290dd-d32c-44c9-944e-f842fb2b1d24.png",
    mutualConnections: 5
  }
];

const upcomingEvents = [
  {
    id: 1,
    name: "Soirée Electro",
    date: "25 Sep",
    venue: "Club Central",
    interested: 124
  },
  {
    id: 2,
    name: "Jazz Session",
    date: "28 Sep",
    venue: "Le Blue Note",
    interested: 89
  }
];

export function RightSidebar() {
  const getProfileTypeColor = (profileType: string) => {
    switch (profileType) {
      case 'artist': return 'bg-purple-500/20 text-purple-400';
      case 'venue': return 'bg-blue-500/20 text-blue-400';
      case 'agent': return 'bg-green-500/20 text-green-400';
      case 'partner': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Fonctionnalité': return 'bg-primary/20 text-primary';
      case 'Événement': return 'bg-success/20 text-success';
      case 'Mise à jour': return 'bg-warning/20 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      {/* Online Users */}
      <OnlineUsers />

      {/* News & Updates */}
      <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Actualités Vybbi</h3>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-[200px]">
            <div className="space-y-3">
              {newsItems.map((item) => (
                <div key={item.id} className="group cursor-pointer">
                  <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`text-xs ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.time}
                        </span>
                      </div>
                      <h4 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  {item.id !== newsItems.length && <Separator className="mt-2" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Suggested Connections */}
      <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Suggestions de connexions</h3>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {suggestedConnections.map((connection) => (
              <div key={connection.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={connection.avatar} />
                  <AvatarFallback className="text-xs">
                    {connection.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm truncate">{connection.name}</h4>
                    <Badge className={`text-xs ${getProfileTypeColor(connection.type)}`}>
                      {connection.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {connection.mutualConnections} connexions mutuelles
                  </p>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  Suivre
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Événements à venir</h3>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-xs font-mono bg-primary/20 text-primary px-2 py-1 rounded">
                        {event.date}
                      </div>
                    </div>
                    <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                      {event.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">{event.venue}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {event.interested} intéressé(s)
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ad Banner */}
      <AdBanner 
        type="sidebar" 
        title="Vybbi Premium"
        description="Débloquez des fonctionnalités exclusives"
        buttonText="Découvrir"
        imageUrl="/lovable-uploads/ffb981ca-4640-4145-8e4a-6436a01f2401.png"
      />
    </div>
  );
}