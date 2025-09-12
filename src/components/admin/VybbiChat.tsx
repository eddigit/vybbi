import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'vybbi';
  timestamp: Date;
  action?: string;
  searchResults?: any;
}

export function VybbiChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Salut ! Je suis Vybbi, ton assistant IA. Je peux t'aider à analyser les données de la plateforme, faire du matching entre artistes et événements, ou effectuer des recherches complexes. Que veux-tu que je fasse ?",
      sender: 'vybbi',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('chat');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const actions = [
    { value: 'chat', label: 'Chat général', icon: '💬' },
    { value: 'search', label: 'Recherche avancée', icon: '🔍' },
    { value: 'match', label: 'Matching automatique', icon: '🎯' },
    { value: 'recommend', label: 'Recommandations', icon: '⭐' },
    { value: 'analyze', label: 'Analyse de données', icon: '📊' }
  ];

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    const currentInput = input;
    setInput('');

    try {
      const { data, error } = await supabase.functions.invoke('vybbi-ai', {
        body: {
          message: currentInput,
          action: selectedAction,
          filters: {}
        }
      });

      if (error) throw error;

      const vybbiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.reply,
        sender: 'vybbi',
        timestamp: new Date(),
        action: data.action,
        searchResults: data.searchResults
      };

      setMessages(prev => [...prev, vybbiMessage]);

    } catch (error) {
      console.error('Erreur Vybbi:', error);
      toast({
        title: "Erreur",
        description: "Impossible de communiquer avec Vybbi",
        variant: "destructive"
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Désolé, j'ai rencontré un problème technique. Peux-tu reformuler ta demande ?",
        sender: 'vybbi',
        timestamp: new Date()
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

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Chat avec Vybbi
        </CardTitle>
        
        <div className="flex flex-wrap gap-1">
          {actions.map(action => (
            <Badge
              key={action.value}
              variant={selectedAction === action.value ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => setSelectedAction(action.value)}
            >
              {action.icon} {action.label}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4">
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground'
                  }`}>
                    {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  
                  <div className={`rounded-lg px-3 py-2 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    {message.action && (
                      <div className="text-xs opacity-70 mt-1">
                        Action: {actions.find(a => a.value === message.action)?.label}
                      </div>
                    )}
                    <div className="text-xs opacity-50 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex gap-2 mt-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tape ta question à Vybbi..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage} 
            disabled={isLoading || !input.trim()}
            size="icon"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}