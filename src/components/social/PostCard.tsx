import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ServiceRequestCard } from "./ServiceRequestCard";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { SocialPost, ServiceRequest } from "@/types/social";
import { useSocialActions } from "@/hooks/useSocialActions";
import { FollowButton } from "@/components/social/FollowButton";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface PostCardProps {
  post: SocialPost;
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const { toggleLike, addComment } = useSocialActions();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [serviceRequest, setServiceRequest] = useState<ServiceRequest | null>(null);

  // Fetch service request data if this is a service request post
  useEffect(() => {
    const fetchServiceRequest = async () => {
      if (post.post_type === 'service_request' && post.related_id) {
        try {
          const { data, error } = await supabase
            .from('service_requests')
            .select('*')
            .eq('id', post.related_id)
            .single();
          
          if (error) throw error;
          setServiceRequest(data as ServiceRequest);
        } catch (error) {
          console.error('Error fetching service request:', error);
        }
      }
    };

    fetchServiceRequest();
  }, [post.post_type, post.related_id]);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      await toggleLike(post.id);
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsCommenting(true);
    try {
      await addComment(post.id, newComment.trim());
      setNewComment("");
      setShowComments(true);
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsCommenting(false);
    }
  };

  const getProfileTypeColor = (profileType: string) => {
    switch (profileType) {
      case "artist":
        return "bg-primary/10 text-primary border border-primary/20";
      case "agent":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "lieu":
        return "bg-green-500/10 text-green-400 border border-green-500/20";
      case "manager":
        return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
      default:
        return "bg-muted/50 text-muted-foreground border border-border";
    }
  };

  const getProfileTypeLabel = (profileType: string) => {
    switch (profileType) {
      case "artist":
        return "Artiste";
      case "agent":
        return "Agent";
      case "lieu":
        return "Lieu";
      case "manager":
        return "Manager";
      default:
        return profileType;
    }
  };

  const getPostTypeIcon = (postType: string) => {
    switch (postType) {
      case "music":
        return "🎵";
      case "event":
        return "📅";
      case "image":
        return "📷";
      case "video":
        return "🎬";
      case "service_request":
        return "🤝";
      default:
        return null;
    }
  };

  // If this is a service request post and we have the data, render ServiceRequestCard
  if (post.post_type === 'service_request' && serviceRequest) {
    return (
      <ServiceRequestCard
        serviceRequest={serviceRequest}
        authorName={post.author_display_name}
        authorAvatar={post.author_avatar_url}
        authorProfileType={getProfileTypeLabel(post.author_profile_type)}
        onApply={() => {
          // TODO: Implement application logic
          console.log('Apply to service request:', serviceRequest.id);
        }}
      />
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50 shadow-md hover:shadow-lg transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <Link to={`/profiles/${post.author_profile_id}`}>
              <Avatar className="w-12 h-12 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                <AvatarImage src={post.author_avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {post.author_display_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <Link 
                  to={`/profiles/${post.author_profile_id}`}
                  className="font-semibold text-foreground hover:text-primary transition-colors truncate"
                >
                  {post.author_display_name}
                </Link>
                <Badge className={`${getProfileTypeColor(post.author_profile_type)} text-xs px-2 py-1 rounded-full font-medium`}>
                  {getProfileTypeLabel(post.author_profile_type)}
                </Badge>
                {getPostTypeIcon(post.post_type) && (
                  <span className="text-lg flex-shrink-0">{getPostTypeIcon(post.post_type)}</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { 
                  addSuffix: true, 
                  locale: fr 
                })}
              </p>
            </div>
            
            {/* Follow Button - only show if not own post */}
            {user && post.user_id !== user.id && (
              <FollowButton
                targetUserId={post.user_id}
                targetProfileId={post.author_profile_id}
                targetDisplayName={post.author_display_name}
                className="flex-shrink-0"
              />
            )}
          </div>

          <Button variant="ghost" size="xs" className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Post Content */}
        <div className="mb-4">
          <p className="text-base leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Media Attachments */}
        {post.media_attachments && post.media_attachments.length > 0 && (
          <div className="mb-4">
            <div className="grid gap-2">
              {post.media_attachments.map((media: any) => (
                <div key={media.id} className="rounded-lg overflow-hidden">
                  {media.media_type === "image" && (
                    <img
                      src={media.media_url}
                      alt={media.alt_text || "Image"}
                      className="w-full h-auto max-h-96 object-cover"
                    />
                  )}
                  {media.media_type === "video" && (
                    <video
                      src={media.media_url}
                      poster={media.thumbnail_url}
                      controls
                      className="w-full h-auto max-h-96"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interaction Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <div className="flex items-center space-x-4">
            {post.likes_count > 0 && (
              <span>{post.likes_count} j'aime</span>
            )}
            {post.comments_count > 0 && (
              <span>{post.comments_count} commentaire{post.comments_count > 1 ? "s" : ""}</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-around border-t border-border/50 pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className={`flex-1 rounded-full h-8 transition-all text-xs ${
              post.user_has_liked 
                ? "text-red-500 hover:text-red-600 bg-red-500/10 hover:bg-red-500/20" 
                : "hover:bg-muted/50"
            }`}
          >
            <Heart className={`w-3 h-3 mr-1 transition-all ${post.user_has_liked ? "fill-current scale-110" : ""}`} />
            J'aime
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex-1 rounded-full h-8 hover:bg-muted/50 transition-all text-xs"
          >
            <MessageCircle className="w-3 h-3 mr-1" />
            Commenter
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex-1 rounded-full h-8 hover:bg-muted/50 transition-all text-xs"
          >
            <Share2 className="w-3 h-3 mr-1" />
            Partager
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 space-y-4 border-t border-border/50 pt-4">
            {/* Add Comment Form */}
            {user && (
              <form onSubmit={handleComment} className="flex space-x-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {user.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Écrire un commentaire..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[60px] resize-none border-border/50 bg-muted/30 rounded-lg"
                  />
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      size="xs" 
                      disabled={!newComment.trim() || isCommenting}
                      className="rounded-full"
                    >
                      {isCommenting ? "Publication..." : "Publier"}
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {/* Comments Display - This would be implemented with a separate component */}
            {post.comments_count > 0 && (
              <div className="text-center text-sm text-muted-foreground">
                {post.comments_count} commentaire{post.comments_count > 1 ? "s" : ""}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}