import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Smile } from 'lucide-react';
import { useTypingPresence } from '@/hooks/useTypingPresence';

interface ComposerProps {
  conversationId: string | null;
  onSendMessage: (content: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export default function Composer({
  conversationId,
  onSendMessage,
  disabled = false,
  placeholder = "Tapez votre message..."
}: ComposerProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { startTyping, stopTyping } = useTypingPresence(conversationId);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleTyping = () => {
    startTyping();
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  };

  const handleSend = async () => {
    if (!message.trim() || sending || disabled) return;

    setSending(true);
    stopTyping();
    
    try {
      await onSendMessage(message.trim());
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (e.target.value.trim()) {
      handleTyping();
    } else {
      stopTyping();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  // Clear typing when component unmounts or conversation changes
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      stopTyping();
    };
  }, [conversationId]);

  if (!conversationId) {
    return null;
  }

  return (
    <div className="border-t bg-background">
      <div className="p-4">
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="sm" className="p-2 flex-shrink-0">
            <Paperclip className="h-4 w-4" />
          </Button>

          <div className="flex-1 min-w-0">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || sending}
              className="min-h-[40px] max-h-[120px] resize-none"
              rows={1}
            />
          </div>

          <Button variant="ghost" size="sm" className="p-2 flex-shrink-0">
            <Smile className="h-4 w-4" />
          </Button>

          <Button
            onClick={handleSend}
            disabled={!message.trim() || sending || disabled}
            size="sm"
            className="flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {disabled && (
          <p className="text-xs text-muted-foreground mt-2 px-2">
            Vous ne pouvez pas envoyer de message pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}