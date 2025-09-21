import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Landing from "@/pages/Landing";

export function ConditionalHomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is authenticated, redirect to feed
  if (user) {
    return <Navigate to="/feed" replace />;
  }

  // If not authenticated, show landing page
  return <Landing />;
}