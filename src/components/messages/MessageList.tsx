import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageWithSender } from '@/hooks/useMessages';
import MessageBubble from './MessageBubble';
import { useAuth } from '@/hooks/useAuth';
import { getUserTimeZone, getDateKeyInTZ, formatDateLabel } from '@/utils/dateTime';
import { Loader2 } from 'lucide-react';

interface MessageListProps {
  messages: MessageWithSender[];
  loading: boolean;
}

export default function MessageList({ messages, loading }: MessageListProps) {
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
    <div className="flex flex-col h-full bg-gradient-to-b from-background via-background to-muted/10">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Chargement des messages...</p>
            </div>
          </div>
        ) : !messages || messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4 p-8">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center">
                <div className="text-5xl animate-bounce">💬</div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Aucun message</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Commencez la conversation en envoyant un message !
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 pb-24 space-y-6">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date} className="space-y-3 animate-in fade-in duration-300">
                {/* Date separator - Design moderne */}
                <div className="relative flex items-center justify-center my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/30"></div>
                  </div>
                  <div className="relative flex items-center gap-2 bg-background px-4">
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-1.5 rounded-full">
                      <span className="text-xs font-medium text-muted-foreground">
                        {formatDateLabel(date, timeZone)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Messages for this date */}
                <div className="space-y-2">
                  {dateMessages.map((message, index) => {
                    const prevMessage = index > 0 ? dateMessages[index - 1] : null;
                    const isOwnMessage = message.sender_id === user?.id;
                    const showAvatar = !prevMessage || prevMessage.sender_id !== message.sender_id;
                    const showSender = showAvatar && !isOwnMessage;
                    
                    return (
                      <div
                        key={message.id}
                        className="animate-in fade-in slide-in-from-bottom-2 duration-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <MessageBubble
                          message={message}
                          isOwnMessage={isOwnMessage}
                          showAvatar={showAvatar}
                          showSender={showSender}
                        />
                      </div>
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
