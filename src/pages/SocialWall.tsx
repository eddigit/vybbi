import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ProfileSidebar } from "@/components/social/ProfileSidebar";
import { NewsFeed } from "@/components/social/NewsFeed";
import { RightSidebar } from "@/components/social/RightSidebar";
import { useUserPresence } from "@/hooks/useUserPresence";
import { Button } from "@/components/ui/button";

export default function SocialWall() {
  const { user } = useAuth();
  useUserPresence(); // Track user's online status

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
    <div className="w-full">
      {/* Header with title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Mur</h1>
        <p className="text-muted-foreground mt-1">Découvrez ce qui se passe dans la communauté Vybbi</p>
      </div>

      {/* LinkedIn-like 3-column layout */}
      <div className="flex w-full gap-6">
        
        {/* Left Sidebar - Profile & Navigation */}
        <div className="hidden xl:block w-80 flex-shrink-0">
          <div className="sticky top-6">
            <ProfileSidebar />
          </div>
        </div>

        {/* Main Feed - Center Column */}
        <div className="flex-1 min-w-0">
          <NewsFeed />
        </div>

        {/* Right Sidebar - Online Users & News */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-6">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}