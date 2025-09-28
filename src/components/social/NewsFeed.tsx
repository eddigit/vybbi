import { useState, useCallback, useRef } from "react";
import { useSocialFeed } from "@/hooks/useSocialFeed";
import { PostCreator } from "./PostCreator";
import { PostCard } from "./PostCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Loader2 } from "lucide-react";
import { MobileOptimizedCard } from "@/components/MobileOptimizedCard";
import { useIsMobile } from "@/hooks/use-mobile";

export function NewsFeed() {
  const [activeTab, setActiveTab] = useState<'all' | 'prestations' | 'events' | 'annonces' | 'messages'>('all');
  const { posts, loading, error, hasMore, loadMore, refreshFeed } = useSocialFeed('all', activeTab === 'all' ? 'all' : activeTab);
  const loadingRef = useRef(false);
  const isMobile = useIsMobile();

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && !loadingRef.current) {
      loadingRef.current = true;
      loadMore();
      // Reset flag after a short delay to prevent rapid successive calls
      setTimeout(() => {
        loadingRef.current = false;
      }, 1000);
    }
  }, [loading, hasMore, loadMore]);

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Post Creator */}
      <PostCreator />

      {/* Mobile-optimized Tab Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/30 pb-3 -mx-2 px-2">
        {isMobile ? (
          // Mobile: Horizontal scroll tabs
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            <Button
              variant={activeTab === 'all' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('all')}
              className="rounded-full transition-all hover:scale-105 text-xs px-4 flex-shrink-0"
            >
              Tous
              <Badge variant="outline" className="ml-2 bg-background/50 text-xs">
                {posts.length}
              </Badge>
            </Button>
            
            <Button
              variant={activeTab === 'prestations' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('prestations')}
              className="rounded-full transition-all hover:scale-105 text-xs px-4 flex-shrink-0"
            >
              🤝 Prestations
            </Button>
            
            <Button
              variant={activeTab === 'events' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('events')}
              className="rounded-full transition-all hover:scale-105 text-xs px-4 flex-shrink-0"
            >
              📅 Événements
            </Button>
            
            <Button
              variant={activeTab === 'annonces' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('annonces')}
              className="rounded-full transition-all hover:scale-105 text-xs px-4 flex-shrink-0"
            >
              📢 Annonces
            </Button>
            
            <Button
              variant={activeTab === 'messages' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('messages')}
              className="rounded-full transition-all hover:scale-105 text-xs px-4 flex-shrink-0"
            >
              💬 Messages
            </Button>
          </div>
        ) : (
          // Desktop: Centered flex wrap
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={activeTab === 'all' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('all')}
              className="rounded-full transition-all hover:scale-105"
            >
              Tous
              <Badge variant="outline" className="ml-2 bg-background/50 text-xs">
                {posts.length}
              </Badge>
            </Button>
            
            <Button
              variant={activeTab === 'prestations' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('prestations')}
              className="rounded-full transition-all hover:scale-105"
            >
              🤝 Prestations
            </Button>
            
            <Button
              variant={activeTab === 'events' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('events')}
              className="rounded-full transition-all hover:scale-105"
            >
              📅 Événements
            </Button>
            
            <Button
              variant={activeTab === 'annonces' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('annonces')}
              className="rounded-full transition-all hover:scale-105"
            >
              📢 Annonces
            </Button>
            
            <Button
              variant={activeTab === 'messages' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('messages')}
              className="rounded-full transition-all hover:scale-105"
            >
              💬 Messages
            </Button>
          </div>
        )}
      </div>

      {/* Feed Content with mobile-optimized spacing */}
      <div className="space-y-3 sm:space-y-4">
        {loading && posts.length === 0 && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <MobileOptimizedCard className="text-center py-6 text-destructive space-y-2">
            <p className="text-sm">{error}</p>
            <Button
              onClick={refreshFeed}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
          </MobileOptimizedCard>
        )}

        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {posts.length === 0 && !loading && (
          <MobileOptimizedCard className="text-center py-8 text-muted-foreground">
            <div className="space-y-2">
              {activeTab === 'all' && (
                <>
                  <div className="text-2xl">📝</div>
                  <p className="text-sm">Aucun post à afficher. Créez le premier post ou explorez les autres catégories !</p>
                </>
              )}
              {activeTab === 'prestations' && (
                <>
                  <div className="text-2xl">🤝</div>
                  <p className="text-sm">Aucune prestation disponible pour le moment.</p>
                </>
              )}
              {activeTab === 'events' && (
                <>
                  <div className="text-2xl">📅</div>
                  <p className="text-sm">Aucun événement à afficher actuellement.</p>
                </>
              )}
              {activeTab === 'annonces' && (
                <>
                  <div className="text-2xl">📢</div>
                  <p className="text-sm">Aucune annonce publiée pour le moment.</p>
                </>
              )}
              {activeTab === 'messages' && (
                <>
                  <div className="text-2xl">💬</div>
                  <p className="text-sm">Aucun message à afficher dans cette catégorie.</p>
                </>
              )}
            </div>
          </MobileOptimizedCard>
        )}

        {hasMore && !loading && (
          <div className="flex justify-center py-4">
            <Button
              onClick={handleLoadMore}
              variant="outline"
              size="sm"
              className="rounded-full hover:scale-105 transition-all"
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