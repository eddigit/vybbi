import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Bot, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  provider?: 'google' | 'huggingface';
}

interface DualAIChatProps {
  className?: string;
  showProviderBadge?: boolean;
}

const DualAIChat: React.FC<DualAIChatProps> = ({ 
  className = '', 
  showProviderBadge = false 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<'google' | 'huggingface' | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Validate message length
    if (inputMessage.length > 500) {
      toast({
        title: "Message trop long",
        description: "Veuillez limiter votre message à 500 caractères maximum.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Get conversation history (last 5 messages for context)
      const conversationHistory = messages.slice(-5).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('dual-ai-chat', {
        body: {
          message: userMessage.content,
          conversation_history: conversationHistory
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to get AI response');
      }

      if (!data.success) {
        throw new Error(data.error || 'AI service unavailable');
      }

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        provider: data.provider
      };

      setMessages(prev => [...prev, aiMessage]);
      setCurrentProvider(data.provider);

      if (showProviderBadge) {
        console.log(`Response from: ${data.provider}`);
      }

    } catch (error) {
      console.error('Chat error:', error);
      
      toast({
        title: "Erreur de communication",
        description: error instanceof Error ? error.message : "Impossible de contacter le service d'IA",
        variant: "destructive",
      });

      // Add error message to chat
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "Désolé, je rencontre des difficultés techniques. Veuillez réessayer dans quelques instants.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className={`flex flex-col h-full max-h-[600px] ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Assistant IA</h3>
        </div>
        {showProviderBadge && currentProvider && (
          <Badge variant="secondary" className="text-xs">
            {currentProvider === 'google' ? 'Google AI' : 'Hugging Face'}
          </Badge>
        )}
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Commencez une conversation avec l'assistant IA</p>
              <p className="text-sm mt-2">Tapez votre message ci-dessous (max 500 caractères)</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                </div>
              )}
              
              <div className={`flex flex-col max-w-[80%] ${
                message.role === 'user' ? 'items-end' : 'items-start'
              }`}>
                <div
                  className={`px-4 py-2 rounded-2xl break-words ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1 px-2">
                  {formatTime(message.timestamp)}
                </span>
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-md">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">L'assistant réfléchit...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message... (max 500 caractères)"
              disabled={isLoading}
              maxLength={500}
              className="pr-16"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {inputMessage.length}/500
            </div>
          </div>
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DualAIChat;