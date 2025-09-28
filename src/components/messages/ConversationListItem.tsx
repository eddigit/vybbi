import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pin, Archive, MoreVertical, PinOff, ArchiveRestore, Trash2 } from 'lucide-react';
import { ConversationWithDetails } from '@/hooks/useConversations';
import { formatTime } from '@/utils/formatTime';

interface ConversationListItemProps {
  conversation: ConversationWithDetails;
  isSelected: boolean;
  onSelect: () => void;
  onPin: () => void;
  onArchive: () => void;
  onDelete: () => void;
  isPinned: boolean;
  isArchived?: boolean;
}

export default function ConversationListItem({
  conversation,
  isSelected,
  onSelect,
  onPin,
  onArchive,
  onDelete,
  isPinned,
  isArchived = false,
}: ConversationListItemProps) {
  const [showMenu, setShowMenu] = useState(false);

  const displayName = conversation.peer_display_name || 'Utilisateur inconnu';
  const lastMessage = conversation.last_message_content || 'Pas de message';
  const unreadCount = conversation.unread_count;
  const hasUnread = unreadCount > 0;

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${Math.max(1, diffInMinutes)}min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}j`;
  };

  return (
    <div
      className={`
        group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200
        hover:bg-muted/60 active:scale-[0.99]
        ${isSelected ? 'bg-muted border-l-2 border-primary' : ''}
        ${hasUnread ? 'bg-accent/5' : ''}
      `}
      onClick={onSelect}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-14 w-14 ring-2 ring-background">
          <AvatarImage src={conversation.peer_avatar_url || ''} alt={displayName} />
          <AvatarFallback className="text-sm font-semibold">
            {displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {isPinned && (
          <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center">
            <Pin className="h-2.5 w-2.5 text-primary-foreground" fill="currentColor" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between">
          <h3 className={`text-base truncate ${hasUnread ? 'font-bold' : 'font-medium'}`}>
            {displayName}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            {hasUnread && (
              <Badge variant="default" className="h-5 min-w-[20px] px-1.5 text-xs rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
            {conversation.last_message_at && (
              <span className="text-xs text-muted-foreground">
                {formatLastMessageTime(conversation.last_message_at)}
              </span>
            )}
          </div>
        </div>
        
        <p className={`text-sm truncate leading-relaxed ${hasUnread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
          {lastMessage}
        </p>
      </div>

      {/* Actions - Only show on hover/focus */}
      <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onPin();
              setShowMenu(false);
            }}
          >
            {isPinned ? (
              <>
                <PinOff className="mr-2 h-4 w-4" />
                Désépingler
              </>
            ) : (
              <>
                <Pin className="mr-2 h-4 w-4" />
                Épingler
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onArchive();
              setShowMenu(false);
            }}
          >
            {isArchived ? (
              <>
                <ArchiveRestore className="mr-2 h-4 w-4" />
                Désarchiver
              </>
            ) : (
              <>
                <Archive className="mr-2 h-4 w-4" />
                Archiver
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
              setShowMenu(false);
            }}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}