import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Smile } from 'lucide-react';
import { useTypingPresence } from '@/hooks/useTypingPresence';

interface ComposerProps {
  conversationId: string | null;
  onSendMessage: (content: string, attachments?: File[]) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export default function Composer({
  conversationId,
  onSendMessage,
  disabled = false,
  placeholder = "Tapez votre message..."
}: ComposerProps) {
  console.log('Composer rendering with:', { conversationId, disabled });
  
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { startTyping, stopTyping } = useTypingPresence(conversationId);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleTyping = () => {
    if (!conversationId) return;
    
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
    if (!message.trim() || sending || disabled || !conversationId) return;

    console.log('Composer - Sending message:', message.trim());
    setSending(true);
    stopTyping();
    
    try {
      await onSendMessage(message.trim());
      setMessage('');
      console.log('Composer - Message sent successfully');
    } catch (error) {
      console.error('Composer - Error sending message:', error);
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
    console.log('Composer - No conversation ID, not rendering');
    return null;
  }

  console.log('Composer - Rendering UI');

  return (
    <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0 z-[90]">
      <div className="p-4">
        <div className="flex gap-3 items-end max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="min-h-[48px] max-h-32 resize-none rounded-2xl border-muted bg-muted/30 focus-visible:ring-primary/50 pr-16"
              disabled={disabled || sending}
            />
            
            {/* Inline action buttons */}
            <div className="absolute right-2 bottom-2 flex gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                disabled={true}
                className="h-8 w-8 p-0 rounded-full hover:bg-muted"
                title="Pièces jointes (bientôt disponible)"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                disabled={true}
                className="h-8 w-8 p-0 rounded-full hover:bg-muted"
                title="Émojis (bientôt disponible)"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Button 
            onClick={handleSend} 
            disabled={!message.trim() || disabled || sending}
            size="sm"
            className="h-12 px-6 rounded-2xl shadow-sm"
          >
            {sending ? (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                Envoi
              </div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {disabled && (
          <div className="mt-3 p-3 bg-muted/50 rounded-lg max-w-4xl mx-auto">
            <p className="text-sm text-muted-foreground text-center">
              Impossible d'envoyer des messages dans cette conversation
            </p>
          </div>
        )}
      </div>
    </div>
  );
}