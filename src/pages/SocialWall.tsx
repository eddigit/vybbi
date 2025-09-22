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
    <div className="flex min-h-screen bg-background">
      {/* Main Feed */}
      <div className="flex-1 max-w-2xl mx-auto">
        <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 border-b">
          <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Mur Social Vybbi</h1>
            <PostCreator />
          </div>
          
          {/* Feed Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-0 bg-transparent p-0">
              <TabsTrigger 
                value="all" 
                className="flex items-center space-x-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Sparkles className="w-4 h-4" />
                <span>Tous</span>
              </TabsTrigger>
              <TabsTrigger 
                value="following" 
                className="flex items-center space-x-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Users className="w-4 h-4" />
                <span>Abonnements</span>
              </TabsTrigger>
              <TabsTrigger 
                value="discover" 
                className="flex items-center space-x-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Compass className="w-4 h-4" />
                <span>Découvrir</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="p-4 space-y-6">
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
              <p>Aucune publication pour le moment.</p>
              <p className="mt-2">Soyez le premier à partager quelque chose !</p>
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
              
              {hasMore && (
                <div className="flex justify-center py-4">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Chargement...
                      </>
                    ) : (
                      "Charger plus"
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Online Users Sidebar */}
      <div className="hidden lg:block w-80 border-l">
        <div className="sticky top-0 h-screen">
          <OnlineUsers />
        </div>
      </div>
    </div>
  );
}