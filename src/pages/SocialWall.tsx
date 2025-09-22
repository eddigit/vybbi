import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PostCreator } from "@/components/social/PostCreator";
import { PostCard } from "@/components/social/PostCard";
import { OnlineUsers } from "@/components/social/OnlineUsers";
import { useSocialFeed } from "@/hooks/useSocialFeed";
import { useUserPresence } from "@/hooks/useUserPresence";
import { Loader2, Users, Compass, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SocialWall() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'following' | 'discover'>('all');
  
  // Use different hooks based on active tab
  const allFeed = useSocialFeed('all');
  const followingFeed = useSocialFeed('following');
  const discoverFeed = useSocialFeed('discover');
  
  // Get the current feed based on active tab
  const currentFeed = activeTab === 'following' ? followingFeed : 
                     activeTab === 'discover' ? discoverFeed : allFeed;
  
  const { posts, loading, error, loadMore, hasMore } = currentFeed;
  useUserPresence(); // Track user's online status

  useEffect(() => {
    // Auto-load initial posts when component mounts
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold mb-4">Connectez-vous pour accéder au feed social</h2>
          <p className="text-muted-foreground">Rejoignez la communauté Vybbi pour partager et découvrir du contenu.</p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link to="/auth?tab=signin">Se connecter</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/auth?tab=signup">S'inscrire</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <div className="flex w-full">
        {/* Main Feed */}
        <div className="flex-1 lg:pr-80">
          <div className="max-w-2xl mx-auto">
            <div className="sticky top-0 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 z-20 border-b border-border/50 shadow-sm">
              <div className="p-6 pb-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Mur Social Vybbi
                  </h1>
                </div>
                <PostCreator />
              </div>
              
              {/* Feed Tabs */}
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
                <TabsList className="w-full justify-start rounded-none border-0 bg-transparent p-0 h-auto">
                  <TabsTrigger 
                    value="all" 
                    className="flex items-center space-x-2 px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 hover:bg-muted/50 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="font-medium">Tous</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="following" 
                    className="flex items-center space-x-2 px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 hover:bg-muted/50 transition-all"
                  >
                    <Users className="w-4 h-4" />
                    <span className="font-medium">Abonnements</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="discover" 
                    className="flex items-center space-x-2 px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 hover:bg-muted/50 transition-all"
                  >
                    <Compass className="w-4 h-4" />
                    <span className="font-medium">Découvrir</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="p-6 space-y-6">
              {loading && posts.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Chargement du feed...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12 text-red-500">
                  <p>Erreur lors du chargement: {error}</p>
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
        </div>

        {/* Online Users Sidebar - Fixed to the right */}
        <div className="hidden lg:block fixed right-0 top-0 w-80 h-screen border-l border-border/50 bg-gradient-to-b from-background/95 to-background/90 backdrop-blur-sm z-10">
          <OnlineUsers />
        </div>
      </div>
    </div>
  );
}