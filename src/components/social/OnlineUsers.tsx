import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useOnlineUsers } from "@/hooks/useOnlineUsers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function OnlineUsers() {
  const { onlineUsers, loading, error } = useOnlineUsers();

  const getProfileTypeColor = (profileType: string) => {
    switch (profileType) {
      case "artist":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-300";
      case "agent":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-300";
      case "lieu":
        return "bg-green-500/10 text-green-700 dark:text-green-300";
      case "manager":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-300";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-300";
    }
  };

  const getProfileTypeLabel = (profileType: string) => {
    switch (profileType) {
      case "artist":
        return "Artiste";
      case "agent":
        return "Agent";
      case "lieu":
        return "Lieu";
      case "manager":
        return "Manager";
      default:
        return profileType;
    }
  };

  const handleStartChat = (userId: string) => {
    // Navigate to messages with the user
    window.location.href = `/messages?contact=${userId}`;
  };

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50 shadow-lg backdrop-blur-sm min-h-[380px] max-h-[60vh] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span>En ligne</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground font-normal">
              {onlineUsers.length}
            </span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col pt-0">
        <ScrollArea className="h-[260px] md:h-[320px] lg:h-[380px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Chargement...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500 text-sm">
              Erreur de chargement
            </div>
          ) : onlineUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Aucun utilisateur en ligne
            </div>
          ) : (
            <div className="space-y-3">
              {onlineUsers.map((user) => (
                <div key={user.user_id} className="group">
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="relative">
                <Link to={`/profiles/${user.profile_id}`}>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>
                      {user.display_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
              </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <Link 
                            to={`/profiles/${user.profile_id}`}
                            className="font-medium text-sm truncate hover:underline"
                          >
                            {user.display_name}
                          </Link>
                        </div>
                        
                        <Badge 
                          className={`${getProfileTypeColor(user.profile_type)} text-xs mt-1`}
                        >
                          {getProfileTypeLabel(user.profile_type)}
                        </Badge>
                        
                        {user.status_message && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {user.status_message}
                          </p>
                        )}
                        
                        <p className="text-xs text-muted-foreground mt-1">
                          Vu {formatDistanceToNow(new Date(user.last_seen_at), { 
                            addSuffix: true, 
                            locale: fr 
                          })}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartChat(user.user_id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Cliquez sur un profil pour voir plus d'infos ou sur 💬 pour chatter
          </p>
        </div>
      </CardContent>
    </Card>
  );
}