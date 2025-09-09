import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageWithSender } from '@/hooks/useMessages';
import MessageBubble from './MessageBubble';
import { useAuth } from '@/hooks/useAuth';

interface MessageListProps {
  messages: MessageWithSender[];
  loading: boolean;
}

export default function MessageList({ messages, loading }: MessageListProps) {
  console.log('MessageList rendering:', { messagesCount: messages?.length || 0, loading });
  
  const { user } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Group messages by date
  const groupedMessages = messages?.reduce((groups, message) => {
    const date = new Date(message.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, MessageWithSender[]>) || {};

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hier";
    } else {
      return date.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  if (loading) {
    console.log('MessageList - Loading messages...');
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Chargement des messages...</p>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    console.log('MessageList - No messages to display');
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">Aucun message pour l'instant</p>
          <p className="text-sm text-muted-foreground">
            Commencez une conversation en envoyant un message
          </p>
        </div>
      </div>
    );
  }

  console.log('MessageList - Rendering messages:', messages.length);

  return (
    <div className="flex-1 flex flex-col">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4 space-y-4">
          {Object.entries(groupedMessages).map(([date, dayMessages]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex items-center justify-center my-4">
                <div className="bg-muted px-3 py-1 rounded-full">
                  <span className="text-xs text-muted-foreground font-medium">
                    {formatDate(date)}
                  </span>
                </div>
              </div>

              {/* Messages for this day */}
              <div className="space-y-2">
                {dayMessages.map((message, index) => {
                  const isOwnMessage = message.sender_id === user?.id;
                  const previousMessage = index > 0 ? dayMessages[index - 1] : null;
                  const isConsecutive = 
                    previousMessage &&
                    previousMessage.sender_id === message.sender_id &&
                    new Date(message.created_at).getTime() - new Date(previousMessage.created_at).getTime() < 5 * 60 * 1000; // 5 minutes

                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwnMessage={isOwnMessage}
                      showAvatar={!isConsecutive}
                      showSender={!isOwnMessage && !isConsecutive}
                    />
                  );
                })}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
}