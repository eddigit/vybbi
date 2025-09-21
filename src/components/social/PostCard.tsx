import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { SocialPost } from "@/types/social";
import { useSocialActions } from "@/hooks/useSocialActions";

interface PostCardProps {
  post: SocialPost;
}

export function PostCard({ post }: PostCardProps) {
  const { toggleLike, addComment } = useSocialActions();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isLiking, setIsLiking] = useState(false);

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
    if (!commentText.trim()) return;

    try {
      await addComment(post.id, commentText.trim());
      setCommentText("");
      setShowComments(true);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const getProfileTypeColor = (profileType: string) => {
    switch (profileType) {
      case "artist":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-300";
      case "agent":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-300";
      case "lieu":
        return "bg-green-500/10 text-green-700 dark:text-green-300";
      case "manager":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-300";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-300";
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
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to={`/profiles/${post.author_profile_id}`}>
              <Avatar className="w-10 h-10 hover:ring-2 hover:ring-primary/20 transition-all">
                <AvatarImage src={post.author_avatar_url || undefined} />
                <AvatarFallback>
                  {post.author_display_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Link 
                  to={`/profiles/${post.author_profile_id}`}
                  className="font-semibold hover:underline"
                >
                  {post.author_display_name}
                </Link>
                <Badge className={getProfileTypeColor(post.author_profile_type)}>
                  {getProfileTypeLabel(post.author_profile_type)}
                </Badge>
                {getPostTypeIcon(post.post_type) && (
                  <span className="text-lg">{getPostTypeIcon(post.post_type)}</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { 
                  addSuffix: true, 
                  locale: fr 
                })}
              </p>
            </div>
          </div>

          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
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
        <div className="flex items-center justify-between border-t pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className={post.user_has_liked ? "text-red-500 hover:text-red-600" : ""}
          >
            <Heart className={`w-4 h-4 mr-2 ${post.user_has_liked ? "fill-current" : ""}`} />
            J'aime
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Commenter
          </Button>

          <Button variant="ghost" size="sm">
            <Share className="w-4 h-4 mr-2" />
            Partager
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 border-t pt-4">
            <form onSubmit={handleComment} className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Écrivez un commentaire..."
                  className="flex-1 px-3 py-2 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <Button type="submit" size="sm" disabled={!commentText.trim()}>
                  Envoyer
                </Button>
              </div>
            </form>

            {/* TODO: Display existing comments */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                Les commentaires seront affichés ici
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}