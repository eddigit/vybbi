import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSocialActions } from "@/hooks/useSocialActions";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FollowButtonProps {
  targetUserId: string;
  targetProfileId: string;
  targetDisplayName: string;
  className?: string;
}

export function FollowButton({ 
  targetUserId, 
  targetProfileId, 
  targetDisplayName,
  className = ""
}: FollowButtonProps) {
  const { user } = useAuth();
  const { followUser, unfollowUser } = useSocialActions();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingFollow, setCheckingFollow] = useState(true);

  // Check if user is already following this target
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user || user.id === targetUserId) {
        setCheckingFollow(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_follows')
          .select('id')
          .eq('follower_user_id', user.id)
          .eq('followed_user_id', targetUserId)
          .maybeSingle();

        if (error) throw error;
        setIsFollowing(!!data);
      } catch (error) {
        console.error('Error checking follow status:', error);
      } finally {
        setCheckingFollow(false);
      }
    };

    checkFollowStatus();
  }, [user, targetUserId]);

  const handleFollowToggle = async () => {
    if (!user || user.id === targetUserId || loading) return;

    setLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(targetUserId);
        setIsFollowing(false);
      } else {
        await followUser(targetUserId, targetProfileId);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show button if not authenticated or if it's the same user
  if (!user || user.id === targetUserId) {
    return null;
  }

  if (checkingFollow) {
    return (
      <Button variant="outline" size="sm" disabled className={className}>
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        Chargement...
      </Button>
    );
  }

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      onClick={handleFollowToggle}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          {isFollowing ? "Ne plus suivre..." : "Suivre..."}
        </>
      ) : isFollowing ? (
        <>
          <UserCheck className="w-4 h-4 mr-2" />
          Suivi
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4 mr-2" />
          Suivre
        </>
      )}
    </Button>
  );
}