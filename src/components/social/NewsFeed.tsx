import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Handshake, Calendar, Megaphone, MessageSquare } from "lucide-react";
import { PostCard } from "./PostCard";
import { PostCreator } from "./PostCreator";
import { useSocialFeed } from "@/hooks/useSocialFeed";

export function NewsFeed() {
  const [activeTab, setActiveTab] = useState<'all' | 'prestations' | 'events' | 'annonces' | 'messages'>('all');
  
  // Use different feed instances for each tab
  const allFeed = useSocialFeed('all', 'all');
  const prestationsFeed = useSocialFeed('all', 'prestations');
  const eventsFeed = useSocialFeed('all', 'events');
  const annoncesFeed = useSocialFeed('all', 'annonces');
  const messagesFeed = useSocialFeed('all', 'messages');
  
  // Select the appropriate feed based on active tab
  const selectedFeed = activeTab === 'all' ? allFeed : 
                      activeTab === 'prestations' ? prestationsFeed :
                      activeTab === 'events' ? eventsFeed :
                      activeTab === 'annonces' ? annoncesFeed :
                      messagesFeed;

  const { posts, loading, error, hasMore, loadMore, refreshFeed } = selectedFeed;

  return (
    <div className="flex-1 overflow-hidden">
      <PostCreator />
      
      {/* Sticky Tabs Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-5 h-8">
              <TabsTrigger value="all" className="flex items-center gap-1 text-xs px-2">
                Tous
              </TabsTrigger>
              <TabsTrigger value="prestations" className="flex items-center gap-1 text-xs px-2">
                <Handshake className="h-3 w-3" />
                Prestations
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-1 text-xs px-2">
                <Calendar className="h-3 w-3" />
                Événements
              </TabsTrigger>
              <TabsTrigger value="annonces" className="flex items-center gap-1 text-xs px-2">
                <Megaphone className="h-3 w-3" />
                Annonces
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-1 text-xs px-2">
                <MessageSquare className="h-3 w-3" />
                Messages
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Feed Content */}
      <div className="p-4 space-y-4">
        {loading && posts.length === 0 && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-destructive space-y-2">
            <p>{error}</p>
            <Button
              onClick={refreshFeed}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
          </div>
        )}

        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {posts.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            {activeTab === 'all' && "Aucun post à afficher. Créez le premier post ou explorez les autres catégories !"}
            {activeTab === 'prestations' && "Aucune prestation disponible pour le moment."}
            {activeTab === 'events' && "Aucun événement à afficher actuellement."}
            {activeTab === 'annonces' && "Aucune annonce publiée pour le moment."}
            {activeTab === 'messages' && "Aucun message à afficher dans cette catégorie."}
          </div>
        )}

        {hasMore && !loading && (
          <div className="flex justify-center py-4">
            <Button
              onClick={loadMore}
              variant="outline"
              size="sm"
            >
              Charger plus
            </Button>
          </div>
        )}

        {loading && posts.length > 0 && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}