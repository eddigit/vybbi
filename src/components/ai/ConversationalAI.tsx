import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Send, 
  Brain, 
  Zap, 
  Lightbulb, 
  Target, 
  TrendingUp,
  Users,
  Calendar,
  Mail,
  Phone,
  BarChart3,
  Settings,
  Sparkles,
  Mic,
  MicOff
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    type?: 'analysis' | 'recommendation' | 'prediction' | 'general';
    confidence?: number;
    actionable?: boolean;
    relatedProspects?: string[];
  };
}

interface AICapability {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  active: boolean;
}

const AI_CAPABILITIES: AICapability[] = [
  {
    id: 'prospect-analysis',
    name: 'Analyse Prospects',
    description: 'Analyse comportementale et scoring prédictif',
    icon: <Users className="w-4 h-4" />,
    active: true
  },
  {
    id: 'conversion-prediction',
    name: 'Prédiction Conversion',
    description: 'Probabilités de conversion et timing optimal',
    icon: <TrendingUp className="w-4 h-4" />,
    active: true
  },
  {
    id: 'strategy-recommendation',
    name: 'Recommandations Stratégiques',
    description: 'Conseils personnalisés par prospect',
    icon: <Lightbulb className="w-4 h-4" />,
    active: true
  },
  {
    id: 'performance-analytics',
    name: 'Analytics Performance',
    description: 'Métriques et KPIs avancés',
    icon: <BarChart3 className="w-4 h-4" />,
    active: true
  }
];

export default function ConversationalAI() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant IA Vybbi. Je peux vous aider à analyser vos prospects, prédire les conversions, et optimiser vos stratégies commerciales. Que souhaitez-vous analyser aujourd\'hui ?',
      timestamp: new Date(),
      metadata: { type: 'general' }
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Appel à l'edge function Vybbi AI améliorée
      const { data, error } = await supabase.functions.invoke('vybbi-ai', {
        body: {
          message: inputMessage,
          conversationHistory: messages.slice(-5), // Derniers 5 messages pour contexte
          capabilities: AI_CAPABILITIES.filter(c => c.active).map(c => c.id),
          enhanced: true
        }
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Désolé, je n\'ai pas pu traiter votre demande.',
        timestamp: new Date(),
        metadata: {
          type: data.type || 'general',
          confidence: data.confidence,
          actionable: data.actionable,
          relatedProspects: data.relatedProspects
        }
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Afficher des actions suggérées si disponibles
      if (data.suggestedActions && data.suggestedActions.length > 0) {
        setTimeout(() => {
          const actionMessage: ChatMessage = {
            id: (Date.now() + 2).toString(),
            role: 'assistant',
            content: `Actions suggérées :\n${data.suggestedActions.map((action: string, idx: number) => `${idx + 1}. ${action}`).join('\n')}`,
            timestamp: new Date(),
            metadata: { type: 'recommendation', actionable: true }
          };
          setMessages(prev => [...prev, actionMessage]);
        }, 1000);
      }

    } catch (error) {
      console.error('Erreur IA conversationnelle:', error);
      toast({
        title: "Erreur",
        description: "Impossible de communiquer avec l'assistant IA",
        variant: "destructive"
      });

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Désolé, je rencontre des difficultés techniques. Veuillez réessayer dans quelques instants.',
        timestamp: new Date(),
        metadata: { type: 'general' }
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'fr-FR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast({
          title: "Erreur",
          description: "Impossible d'utiliser la reconnaissance vocale",
          variant: "destructive"
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      toast({
        title: "Non supporté",
        description: "Votre navigateur ne supporte pas la reconnaissance vocale",
        variant: "destructive"
      });
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'analysis': return <Brain className="w-4 h-4 text-primary" />;
      case 'recommendation': return <Lightbulb className="w-4 h-4 text-warning" />;
      case 'prediction': return <TrendingUp className="w-4 h-4 text-success" />;
      default: return <MessageSquare className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const suggestedQuestions = [
    "Analyse mes prospects avec le score le plus élevé",
    "Quels sont mes prospects à risque de décrochage ?",
    "Recommande-moi les meilleures actions pour cette semaine",
    "Prédis mes revenus pour les 30 prochains jours",
    "Quels canaux de communication sont les plus efficaces ?",
    "Analyse les tendances de conversion de mon équipe"
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[800px]">
      {/* Panneau de capacités IA */}
      <div className="lg:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Capacités IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {AI_CAPABILITIES.map((capability) => (
                <div key={capability.id} className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                  <div className="mt-0.5">{capability.icon}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{capability.name}</div>
                    <div className="text-xs text-muted-foreground">{capability.description}</div>
                    <Badge 
                      variant={capability.active ? "default" : "secondary"} 
                      className="mt-1 text-xs"
                    >
                      {capability.active ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              Questions Suggérées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {suggestedQuestions.slice(0, 4).map((question, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full text-left justify-start text-xs h-auto p-2 whitespace-normal"
                  onClick={() => setInputMessage(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat principal */}
      <div className="lg:col-span-3">
        <Card className="h-full flex flex-col">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Brain className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">Assistant IA Vybbi</h3>
                  <p className="text-xs text-muted-foreground">Intelligence Artificielle Avancée</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  Temps réel
                </Badge>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Brain className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                      <div
                        className={`p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground ml-auto'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        {message.metadata?.type && getMessageTypeIcon(message.metadata.type)}
                        <span>{message.timestamp.toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}</span>
                        {message.metadata?.confidence && (
                          <Badge variant="outline" className="text-xs">
                            {message.metadata.confidence}% confiance
                          </Badge>
                        )}
                        {message.metadata?.actionable && (
                          <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                            Actionnable
                          </Badge>
                        )}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Brain className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin">
                          <Brain className="w-4 h-4" />
                        </div>
                        <span className="text-sm">L'IA analyse vos données...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Posez votre question à l'IA Vybbi..."
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    onClick={startVoiceRecognition}
                    disabled={isLoading || isListening}
                  >
                    {isListening ? (
                      <MicOff className="w-4 h-4 text-destructive animate-pulse" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              {isListening && (
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                  <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                  Écoute en cours...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}