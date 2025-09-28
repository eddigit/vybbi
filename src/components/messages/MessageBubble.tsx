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
  console.log('MessageBubble rendering:', message.id);
  
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`flex gap-2 mb-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      {/* Left avatar for received messages */}
      {!isOwnMessage && (
        <div className="flex-shrink-0">
          {showAvatar ? (
            <Avatar className="h-9 w-9 ring-2 ring-background">
              <AvatarImage 
                src={message.sender?.avatar_url || ''} 
                alt={message.sender?.display_name || 'User'} 
              />
              <AvatarFallback className="text-xs font-semibold">
                {message.sender?.display_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-9" />
          )}
        </div>
      )}

      <div className={`flex flex-col max-w-[75%] sm:max-w-[65%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        {/* Sender name for received messages */}
        {showSender && !isOwnMessage && (
          <span className="text-xs font-medium text-muted-foreground mb-1 px-1">
            {message.sender?.display_name || 'Utilisateur'}
          </span>
        )}
        
        {/* Message bubble */}
        <div
          className={`
            relative px-4 py-2.5 break-words shadow-sm
            ${isOwnMessage
              ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-lg'
              : 'bg-background border text-foreground rounded-2xl rounded-bl-lg'
            }
          `}
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
          
          {/* Message time */}
          <span className={`text-xs mt-1 block opacity-70 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
            {formatTime(message.created_at)}
          </span>
        </div>
      </div>

      {/* Right avatar for sent messages */}
      {isOwnMessage && (
        <div className="flex-shrink-0">
          {showAvatar ? (
            <Avatar className="h-9 w-9 ring-2 ring-background">
              <AvatarImage 
                src={message.sender?.avatar_url || ''} 
                alt={message.sender?.display_name || 'You'} 
              />
              <AvatarFallback className="text-xs font-semibold">
                {message.sender?.display_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'V'}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-9" />
          )}
        </div>
      )}
    </div>
  );
}