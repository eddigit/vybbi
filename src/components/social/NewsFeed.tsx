import { useState } from "react";
import { PostCreator } from "./PostCreator";
import { PostCard } from "./PostCard";
import { useSocialFeed } from "@/hooks/useSocialFeed";
import { Loader2, Users, Compass, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function NewsFeed() {
  const [activeTab, setActiveTab] = useState<'all' | 'following' | 'discover'>('all');
  
  // Use different hooks based on active tab
  const allFeed = useSocialFeed('all');
  const followingFeed = useSocialFeed('following');
  const discoverFeed = useSocialFeed('discover');
  
  // Get the current feed based on active tab
  const currentFeed = activeTab === 'following' ? followingFeed : 
                     activeTab === 'discover' ? discoverFeed : allFeed;
  
  const { posts, loading, error, loadMore, hasMore } = currentFeed;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Post Creator Widget */}
      <div className="bg-gradient-to-br from-card to-card/80 border border-border/50 rounded-xl shadow-sm">
        <div className="p-4 lg:p-6">
          <PostCreator />
        </div>
      </div>

      {/* Sticky Feed Tabs */}
      <div className="sticky top-6 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 z-20 border border-border/50 rounded-xl shadow-sm">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="w-full justify-start rounded-none border-0 bg-transparent p-0 h-auto">
            <TabsTrigger 
              value="all" 
              className="flex items-center space-x-2 px-4 lg:px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 hover:bg-muted/50 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">Tous</span>
            </TabsTrigger>
            <TabsTrigger 
              value="following" 
              className="flex items-center space-x-2 px-4 lg:px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 hover:bg-muted/50 transition-all"
            >
              <Users className="w-4 h-4" />
              <span className="font-medium">Abonnements</span>
            </TabsTrigger>
            <TabsTrigger 
              value="discover" 
              className="flex items-center space-x-2 px-4 lg:px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 hover:bg-muted/50 transition-all"
            >
              <Compass className="w-4 h-4" />
              <span className="font-medium">Découvrir</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Feed Content */}
      <div className="space-y-6">
        {loading && posts.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Chargement du feed...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
              <div className="flex items-center space-x-3 text-destructive mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="font-semibold">Erreur de chargement</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Impossible de charger le feed social. Veuillez réessayer.
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Détail: {error}
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="w-full bg-destructive text-destructive-foreground px-4 py-2 rounded-md text-sm hover:bg-destructive/90 transition-colors"
              >
                Actualiser la page
              </button>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {activeTab === 'following' ? (
              <div>
                <p>Aucune publication de vos abonnements.</p>
                <p className="mt-2">Suivez des utilisateurs pour voir leurs publications ici !</p>
              </div>
            ) : activeTab === 'discover' ? (
              <div>
                <p>Aucune nouvelle publication à découvrir.</p>
                <p className="mt-2">Revenez plus tard pour découvrir du nouveau contenu !</p>
              </div>
            ) : (
              <div>
                <p>Aucune publication pour le moment.</p>
                <p className="mt-2">Soyez le premier à partager quelque chose !</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            
            {hasMore && (
              <div className="flex justify-center py-6">
                <Button
                  onClick={loadMore}
                  disabled={loading}
                  className="rounded-full px-8 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all hover:scale-105 font-semibold shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Chargement...
                    </>
                  ) : (
                    "Charger plus"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}