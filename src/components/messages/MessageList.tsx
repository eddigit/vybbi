import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageWithSender } from '@/hooks/useMessages';
import MessageBubble from './MessageBubble';
import { useAuth } from '@/hooks/useAuth';
import { getUserTimeZone, getDateKeyInTZ, formatDateLabel } from '@/utils/dateTime';

interface MessageListProps {
  messages: MessageWithSender[];
  loading: boolean;
}

export default function MessageList({ messages, loading }: MessageListProps) {
  console.log('MessageList rendering:', { messagesCount: messages?.length || 0, loading });
  
  const { user } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const timeZone = getUserTimeZone();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Group messages by date in timezone
  const groupedMessages = messages?.reduce((groups, message) => {
    const dateKey = getDateKeyInTZ(message.created_at, timeZone);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
    return groups;
  }, {} as Record<string, MessageWithSender[]>) || {};

  return (
    <div className="flex flex-col h-full bg-background/50">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !messages || messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="space-y-2">
              <div className="text-4xl">💬</div>
              <p className="text-muted-foreground">
                Aucun message dans cette conversation
              </p>
              <p className="text-sm text-muted-foreground/80">
                Commencez la discussion !
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 pb-24">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date} className="mb-8">
                {/* Date separator - More elegant */}
                <div className="relative flex items-center justify-center my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-muted-foreground/20"></div>
                  </div>
                  <div className="relative bg-background px-4 py-2">
                    <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                      {formatDateLabel(date, timeZone)}
                    </span>
                  </div>
                </div>
                
                {/* Messages for this date */}
                <div className="space-y-1">
                  {dateMessages.map((message, index) => {
                    const prevMessage = index > 0 ? dateMessages[index - 1] : null;
                    const isOwnMessage = message.sender_id === user?.id;
                    const showAvatar = !prevMessage || prevMessage.sender_id !== message.sender_id;
                    const showSender = showAvatar && !isOwnMessage;
                    
                    return (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isOwnMessage={isOwnMessage}
                        showAvatar={showAvatar}
                        showSender={showSender}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>
    </div>
  );
}