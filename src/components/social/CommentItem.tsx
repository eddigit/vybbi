import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Comment } from "@/hooks/usePostComments";

interface CommentItemProps {
  comment: Comment;
}

export function CommentItem({ comment }: CommentItemProps) {
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

  return (
    <div className="flex space-x-3 p-3 rounded-lg bg-card/50 border border-border/30">
      <Link to={`/profiles/${comment.profile_id}`} className="flex-shrink-0">
        <Avatar className="w-8 h-8 ring-1 ring-border">
          <AvatarImage src={comment.author_avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {comment.author_display_name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
      </Link>
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <Link 
            to={`/profiles/${comment.profile_id}`}
            className="font-medium text-sm text-foreground hover:text-primary transition-colors"
          >
            {comment.author_display_name}
          </Link>
          <Badge className={`${getProfileTypeColor(comment.author_profile_type)} text-xs px-1.5 py-0.5 rounded-full`}>
            {getProfileTypeLabel(comment.author_profile_type)}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { 
              addSuffix: true, 
              locale: fr 
            })}
          </span>
        </div>
        
        <p className="text-sm text-foreground leading-relaxed break-words">
          {comment.comment_text}
        </p>
      </div>
    </div>
  );
}