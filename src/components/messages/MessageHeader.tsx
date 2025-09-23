import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, MoreVertical, Ban, Info, ArrowLeft } from 'lucide-react';
import { ConversationWithDetails } from '@/hooks/useConversations';
import { TypingUser } from '@/hooks/useTypingPresence';

interface MessageHeaderProps {
  conversation: ConversationWithDetails | null;
  typingUsers: TypingUser[];
  onBack: () => void;
  onOpenInfo: () => void;
  onBlockUser: () => void;
  showBackButton?: boolean;
}

export default function MessageHeader({
  conversation,
  typingUsers,
  onBack,
  onOpenInfo,
  onBlockUser,
  showBackButton = false,
}: MessageHeaderProps) {
  if (!conversation) {
    return (
      <div className="h-16 border-b flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Sélectionnez une conversation</p>
      </div>
    );
  }

  const displayName = conversation.peer_display_name || 'Utilisateur inconnu';
  const isTyping = typingUsers.length > 0;

  return (
    <div className="h-16 border-b flex items-center justify-between px-4 bg-background">
      <div className="flex items-center gap-3">
        {showBackButton && (
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        
        <Avatar className="h-10 w-10">
          <AvatarImage src={conversation.peer_avatar_url || ''} alt={displayName} />
          <AvatarFallback>
            {displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold truncate">{displayName}</h2>
          {isTyping ? (
            <p className="text-xs text-primary">
              {typingUsers.length === 1
                ? `${typingUsers[0].display_name} tape...`
                : `${typingUsers.length} personnes tapent...`
              }
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {conversation.peer_profile_type === 'artist' && 'Artiste'}
              {conversation.peer_profile_type === 'agent' && 'Agent'}
              {conversation.peer_profile_type === 'manager' && 'Manager'}
              {conversation.peer_profile_type === 'lieu' && 'Lieu & Événement'}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="p-2">
          <Search className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onOpenInfo}>
              <Info className="mr-2 h-4 w-4" />
              Informations du contact
            </DropdownMenuItem>
            {!conversation.is_blocked && (
              <DropdownMenuItem onClick={onBlockUser} className="text-destructive">
                <Ban className="mr-2 h-4 w-4" />
                Bloquer l'utilisateur
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}