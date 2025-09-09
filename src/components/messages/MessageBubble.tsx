import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageWithSender } from '@/hooks/useMessages';

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
  showSender,
}: MessageBubbleProps) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`flex gap-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      {!isOwnMessage && (
        <div className="flex-shrink-0">
          {showAvatar ? (
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={message.sender?.avatar_url || ''} 
                alt={message.sender?.display_name || 'User'} 
              />
              <AvatarFallback className="text-xs">
                {message.sender?.display_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-8" />
          )}
        </div>
      )}

      <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        {showSender && !isOwnMessage && (
          <span className="text-xs text-muted-foreground mb-1 px-3">
            {message.sender?.display_name || 'Utilisateur'}
          </span>
        )}
        
        <div
          className={`
            px-3 py-2 rounded-2xl break-words
            ${isOwnMessage
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted text-foreground rounded-bl-md'
            }
          `}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        
        <span className="text-xs text-muted-foreground mt-1 px-3">
          {formatTime(message.created_at)}
        </span>
      </div>

      {isOwnMessage && (
        <div className="flex-shrink-0">
          {showAvatar ? (
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={message.sender?.avatar_url || ''} 
                alt={message.sender?.display_name || 'You'} 
              />
              <AvatarFallback className="text-xs">
                {message.sender?.display_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'V'}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-8" />
          )}
        </div>
      )}
    </div>
  );
}