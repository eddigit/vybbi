import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Smile, X, Image as ImageIcon, File } from 'lucide-react';
import { useTypingPresence } from '@/hooks/useTypingPresence';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ComposerProps {
  conversationId: string | null;
  onSendMessage: (content: string, attachments?: File[]) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

// Emojis populaires organisés par catégorie
const emojiCategories = {
  'Sourires': ['😊', '😂', '🤣', '😍', '🥰', '😎', '🤔', '😅', '😉', '😇'],
  'Gestes': ['👍', '👎', '👋', '🙏', '💪', '✌️', '🤝', '👏', '🙌', '🤞'],
  'Cœurs': ['❤️', '💕', '💖', '💗', '💓', '💞', '💝', '💘', '💙', '💚'],
  'Symboles': ['✅', '❌', '⭐', '🔥', '💯', '⚡', '🎉', '🎊', '🎁', '🏆'],
};

export default function Composer({
  conversationId,
  onSendMessage,
  disabled = false,
  placeholder = "Tapez votre message..."
}: ComposerProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { startTyping, stopTyping } = useTypingPresence(conversationId);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleTyping = () => {
    if (!conversationId) return;
    
    startTyping();
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  };

  const handleSend = async () => {
    if ((!message.trim() && attachments.length === 0) || sending || disabled || !conversationId) return;

    setSending(true);
    stopTyping();
    
    try {
      await onSendMessage(message.trim(), attachments.length > 0 ? attachments : undefined);
      setMessage('');
      setAttachments([]);
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

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    textareaRef.current?.focus();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
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
    <div 
      className={cn(
        "bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 border-t border-border/50 transition-colors duration-200",
        isDragging && "bg-primary/5 border-primary"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="p-4 max-w-5xl mx-auto">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-muted/50 border rounded-lg px-3 py-2 text-sm"
              >
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="h-4 w-4 text-primary" />
                ) : (
                  <File className="h-4 w-4 text-primary" />
                )}
                <span className="truncate max-w-[150px]">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 hover:bg-destructive/20"
                  onClick={() => handleRemoveAttachment(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Drag & Drop Overlay */}
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/10 border-2 border-dashed border-primary rounded-lg z-10 pointer-events-none">
            <div className="text-center">
              <Paperclip className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium text-primary">
                Déposez vos fichiers ici
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2 items-end">
          {/* Action Buttons - Left */}
          <div className="flex gap-1">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,application/pdf,.doc,.docx"
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 rounded-full hover:bg-primary/10"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              title="Joindre un fichier"
            >
              <Paperclip className="h-5 w-5" />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 rounded-full hover:bg-primary/10"
                  disabled={disabled}
                  title="Ajouter un émoji"
                >
                  <Smile className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3" align="start">
                <div className="space-y-3">
                  {Object.entries(emojiCategories).map(([category, emojis]) => (
                    <div key={category}>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">
                        {category}
                      </p>
                      <div className="grid grid-cols-10 gap-1">
                        {emojis.map((emoji) => (
                          <button
                            key={emoji}
                            className="hover:bg-accent rounded p-1 text-xl transition-colors"
                            onClick={() => handleEmojiSelect(emoji)}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Message Input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={cn(
                "min-h-[48px] max-h-[150px] resize-none rounded-2xl",
                "border-2 border-border/50 bg-background/50",
                "focus-visible:border-primary/50 focus-visible:ring-0",
                "pr-4 transition-all duration-200",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              disabled={disabled || sending}
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={(!message.trim() && attachments.length === 0) || disabled || sending}
            size="lg"
            className={cn(
              "h-12 w-12 p-0 rounded-full shadow-lg transition-all duration-200",
              "hover:shadow-xl hover:scale-105 active:scale-95"
            )}
          >
            {sending ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>

        {disabled && (
          <div className="mt-3 p-3 bg-muted/50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              Impossible d'envoyer des messages dans cette conversation
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
