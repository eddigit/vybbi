import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import SocialWall from "@/pages/SocialWall";

export function ConditionalHomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is authenticated, show social wall directly
  if (user) {
    return <SocialWall />;
  }

  // If not authenticated, show landing page
  return <Landing />;
}