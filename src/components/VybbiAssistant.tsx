import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Send, Bot, User, Loader2, MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'vybbi';
  timestamp: Date;
  action?: string;
}

interface VybbiAssistantProps {
  context?: string; // Contexte de la page (ex: "recherche-artistes", "profile-artist")
  variant?: 'floating' | 'inline' | 'sheet';
  className?: string;
}

export function VybbiAssistant({ context = 'general', variant = 'floating', className }: VybbiAssistantProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: getWelcomeMessage(context, profile?.profile_type),
      sender: 'vybbi',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current && isOpen && !isMinimized) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isOpen, isMinimized]);

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
      // Enrichir le message avec le contexte
      const contextualMessage = `Contexte: ${context} | Profil utilisateur: ${profile?.profile_type} | Demande: ${currentInput}`;

      const { data, error } = await supabase.functions.invoke('vybbi-ai', {
        body: {
          message: contextualMessage,
          action: 'assistant',
          context: {
            page: context,
            userType: profile?.profile_type,
            userId: profile?.user_id
          }
        }
      });

      if (error) throw error;

      const vybbiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.reply,
        sender: 'vybbi',
        timestamp: new Date()
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

  const ChatContent = () => (
    <>
      <ScrollArea className="flex-1 pr-4 h-[400px]" ref={scrollAreaRef}>
        <div className="space-y-4 p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                }`}>
                  {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                
                <div className={`rounded-lg px-3 py-2 ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs opacity-50 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="flex gap-2 p-4 border-t">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Demande quelque chose à Vybbi..."
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
    </>
  );

  if (variant === 'sheet') {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className={className}>
            <Bot className="h-4 w-4 mr-2" />
            Assistant Vybbi
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[400px] sm:w-[500px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Assistant Vybbi
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full mt-4">
            <ChatContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (variant === 'inline') {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Assistant Vybbi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col h-[500px]">
            <ChatContent />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Variant floating (bouton flottant)
  return (
    <>
      {/* Bouton flottant */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Bot className="h-6 w-6" />
        </Button>
      )}

      {/* Fenêtre de chat flottante */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 z-50 w-80 h-[500px] shadow-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Vybbi
                <Badge variant="secondary" className="text-xs">Assistant IA</Badge>
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  onClick={() => setIsMinimized(!isMinimized)}
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                >
                  {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {!isMinimized && (
            <CardContent className="p-0">
              <div className="flex flex-col h-[420px]">
                <ChatContent />
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </>
  );
}

function getWelcomeMessage(context: string, profileType?: string): string {
  const roleMessages = {
    artist: "Salut ! Je suis Vybbi, ton assistant IA. Je peux t'aider à trouver des opportunités de concerts, analyser tes performances ou optimiser ton profil. Que veux-tu faire ?",
    agent: "Bonjour ! Je suis Vybbi. Je peux t'aider à découvrir de nouveaux talents, matcher tes artistes avec des événements ou analyser le marché. Comment puis-je t'assister ?",
    manager: "Salut ! Vybbi à ton service. Je peux t'aider avec la gestion de tes artistes, trouver des collaborations ou analyser les opportunités du marché. Dis-moi ce dont tu as besoin !",
    lieu: "Bonjour ! Je suis Vybbi, ton assistant pour les lieux. Je peux t'aider à trouver des artistes pour tes événements, analyser ton audience ou optimiser ta programmation. Que cherches-tu ?"
  };

  const contextMessages = {
    'recherche-artistes': "Je vois que tu cherches des artistes ! Je peux t'aider à affiner ta recherche avec des critères précis ou te suggérer des profils correspondant à tes besoins.",
    'profile-edit': "Tu édites ton profil ? Je peux te donner des conseils pour l'optimiser et attirer plus d'opportunités !",
    'events': "Tu organises un événement ? Je peux t'aider à trouver les artistes parfaits pour ton événement !",
    'annonces': "Tu regardes les annonces ? Je peux t'aider à analyser les opportunités et identifier celles qui te correspondent le mieux."
  };

  if (contextMessages[context as keyof typeof contextMessages]) {
    return contextMessages[context as keyof typeof contextMessages];
  }

  if (profileType && roleMessages[profileType as keyof typeof roleMessages]) {
    return roleMessages[profileType as keyof typeof roleMessages];
  }

  return "Salut ! Je suis Vybbi, ton assistant IA personnalisé. Je connais toute la plateforme et peux t'aider avec tes recherches, recommandations et analyses. Que veux-tu faire ?";
}