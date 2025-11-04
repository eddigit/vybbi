import { useState } from 'react';
import { MessageWithSender } from '@/hooks/useMessages';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatTimeOfDay, getUserTimeZone } from '@/utils/dateTime';
import { Check, CheckCheck, Smile, Reply, Copy, Trash2, MoreVertical, Heart } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: MessageWithSender;
  isOwnMessage: boolean;
  showAvatar: boolean;
  showSender: boolean;
}

export default function MessageBubble({
  message,
  isOwnMessage,
  showAvatar,
  showSender
}: MessageBubbleProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const timeZone = getUserTimeZone();

  const handleCopyMessage = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
    }
  };

  const quickReactions = ['❤️', '👍', '😂', '😮', '😢', '🔥'];

  return (
    <div 
      className={cn(
        "group flex gap-3 mb-1 transition-all duration-200",
        isOwnMessage ? 'justify-end' : 'justify-start'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Left avatar for received messages */}
      {!isOwnMessage && (
        <div className="flex-shrink-0">
          {showAvatar ? (
            <Avatar className="h-10 w-10 ring-2 ring-border/50 shadow-sm">
              <AvatarImage 
                src={message.sender?.avatar_url || ''} 
                alt={message.sender?.display_name || 'User'} 
              />
              <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-primary/20 to-primary/10">
                {message.sender?.display_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-10" />
          )}
        </div>
      )}

      <div className={cn(
        "flex flex-col max-w-[75%] sm:max-w-[65%] relative",
        isOwnMessage ? 'items-end' : 'items-start'
      )}>
        {/* Sender name for received messages */}
        {showSender && !isOwnMessage && (
          <span className="text-xs font-medium text-muted-foreground mb-1.5 px-1">
            {message.sender?.display_name || 'Utilisateur'}
          </span>
        )}
        
        <div className="relative">
          {/* Message bubble with hover effects */}
          <div
            className={cn(
              "relative px-4 py-3 break-words shadow-md transition-all duration-200",
              "hover:shadow-lg",
              isOwnMessage
                ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-2xl rounded-tr-md'
                : 'bg-card border border-border/50 text-foreground rounded-2xl rounded-tl-md backdrop-blur-sm'
            )}
          >
            {message.content && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            )}
            
            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 pt-2 border-t border-current/10">
                <p className="text-xs opacity-70">
                  📎 {message.attachments.length} pièce{message.attachments.length > 1 ? 's' : ''} jointe{message.attachments.length > 1 ? 's' : ''}
                </p>
              </div>
            )}
            
            {/* Message time & status */}
            <div className={cn(
              "flex items-center gap-1.5 mt-1.5",
              isOwnMessage ? 'justify-end' : 'justify-start'
            )}>
              <span className="text-xs opacity-70">
                {formatTimeOfDay(message.created_at, timeZone)}
              </span>
              {isOwnMessage && (
                <CheckCheck className="h-3 w-3 opacity-70" />
              )}
            </div>
          </div>

          {/* Quick Actions (shown on hover) */}
          <div className={cn(
            "absolute top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 transition-opacity duration-200",
            isHovered && "opacity-100",
            isOwnMessage ? "-left-20" : "-right-20"
          )}>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background"
              onClick={() => setShowReactions(!showReactions)}
            >
              <Smile className="h-3.5 w-3.5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwnMessage ? "end" : "start"}>
                <DropdownMenuItem onClick={handleCopyMessage}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copier
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Reply className="h-4 w-4 mr-2" />
                  Répondre
                </DropdownMenuItem>
                {isOwnMessage && (
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Quick Reactions Picker */}
          {showReactions && (
            <div className={cn(
              "absolute -bottom-12 bg-card border shadow-lg rounded-full px-2 py-1 flex gap-1 animate-in fade-in zoom-in-95 duration-200",
              isOwnMessage ? "right-0" : "left-0"
            )}>
              {quickReactions.map((emoji) => (
                <button
                  key={emoji}
                  className="hover:scale-125 transition-transform duration-150 text-lg p-1"
                  onClick={() => {
                    // TODO: Add reaction to message
                    setShowReactions(false);
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right avatar for sent messages */}
      {isOwnMessage && (
        <div className="flex-shrink-0">
          {showAvatar ? (
            <Avatar className="h-10 w-10 ring-2 ring-border/50 shadow-sm">
              <AvatarImage 
                src={message.sender?.avatar_url || ''} 
                alt={message.sender?.display_name || 'You'} 
              />
              <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-primary/20 to-primary/10">
                {message.sender?.display_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'V'}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-10" />
          )}
        </div>
      )}
    </div>
  );
}
