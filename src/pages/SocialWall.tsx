import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ProfileSidebar } from "@/components/social/ProfileSidebar";
import { NewsFeed } from "@/components/social/NewsFeed";
import { RightSidebar } from "@/components/social/RightSidebar";
import { useUserPresence } from "@/hooks/useUserPresence";
import { Button } from "@/components/ui/button";
import { AdBanner } from "@/components/social/AdBanner";

export default function SocialWall() {
  const { user } = useAuth();
  useUserPresence(); // Track user's online status

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center space-y-6 max-w-md mx-auto p-8">
          <div className="space-y-2">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Rejoignez le feed social Vybbi
            </h2>
            <p className="text-muted-foreground text-lg">
              Connectez-vous avec la communauté musicale et partagez vos moments.
            </p>
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 space-y-4">
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Partagez vos créations musicales</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Découvrez de nouveaux talents</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Connectez-vous avec la communauté</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg">
              <Link to="/auth?tab=signin">Se connecter</Link>
            </Button>
            <Button variant="outline" asChild className="border-primary/20 hover:bg-primary/5">
              <Link to="/auth?tab=signup">Créer un compte</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* LinkedIn-like 3-column layout */}
      <div className="flex w-full gap-6">
        
        {/* Left Sidebar - Profile & Navigation */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-0 space-y-6">
            <ProfileSidebar />
          </div>
        </div>

        {/* Main Feed - Center Column */}
        <div className="flex-1 min-w-0">
          <NewsFeed />
        </div>

        {/* Right Sidebar - Online Users & News */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-0 space-y-6">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}