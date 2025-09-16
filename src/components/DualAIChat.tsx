import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Bot, User, Search, TrendingUp, Users, MapPin, Music, Calendar, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';
import vybbiLogo from '@/assets/vybbi-logo.png';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: string;
  searchResults?: {
    profiles?: any[];
    events?: any[];
    annonces?: any[];
    availability?: any[];
  };
}

interface VybbiChatProps {
  className?: string;
}

const VybbiChat: React.FC<VybbiChatProps> = ({ 
  className = ''
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState('assistant');
  const [stats, setStats] = useState({ profiles: 0, events: 0, annonces: 0 });
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const location = useLocation();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  // Focus input on mount and load welcome message
  useEffect(() => {
    inputRef.current?.focus();
    
    // Add welcome message based on user type
    const welcomeMessage = getWelcomeMessage();
    if (welcomeMessage) {
      const welcome: Message = {
        id: 'welcome-1',
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date(),
      };
      setMessages([welcome]);
    }
  }, [profile]);

  const getWelcomeMessage = () => {
    if (!user || !profile) {
      return "👋 Salut ! Je suis Vybbi, l'assistant intelligent de la plateforme. Je connais tous les profils, événements et opportunités disponibles. Comment puis-je t'aider aujourd'hui ?";
    }

    const userName = profile.display_name || 'ami';
    const userType = profile.profile_type;

    switch (userType) {
      case 'artist':
        return `🎵 Salut ${userName} ! En tant qu'artiste, je peux t'aider à trouver des concerts, analyser tes performances, ou découvrir de nouveaux contacts dans l'industrie. Que recherches-tu ?`;
      case 'agent':
        return `🎯 Bonjour ${userName} ! En tant qu'agent, je peux t'aider à découvrir de nouveaux talents, matcher tes artistes avec des opportunités, ou analyser le marché. Comment puis-je t'assister ?`;
      case 'manager':
        return `💼 Salut ${userName} ! En tant que manager, je peux t'aider à trouver des artistes à représenter, organiser des collaborations, ou optimiser tes stratégies. Que veux-tu explorer ?`;
      case 'lieu':
        return `🏛️ Bonjour ${userName} ! Pour votre lieu, je peux suggérer des artistes parfaits pour vos événements, analyser votre programmation, ou vous aider à optimiser vos bookings. Comment puis-je vous aider ?`;
      default:
        return `👋 Salut ${userName} ! Je suis là pour t'accompagner sur la plateforme. Je connais tous les profils et opportunités disponibles. Que cherches-tu ?`;
    }
  };

  const getQuickActions = () => {
    if (!profile) return [];

    const userType = profile.profile_type;

    switch (userType) {
      case 'artist':
        return [
          { label: "🎤 Trouve-moi des concerts", action: "search", query: "concerts disponibles pour artiste" },
          { label: "📊 Analyse ma performance", action: "recommend", query: "analyse ma performance et visibilité" },
          { label: "🤝 Nouveaux contacts", action: "match", query: "agents et managers disponibles" }
        ];
      case 'agent':
        return [
          { label: "🔍 Découvre nouveaux talents", action: "search", query: "artistes prometteurs disponibles" },
          { label: "🎯 Match mes artistes", action: "match", query: "opportunités pour mes artistes" },
          { label: "📈 Analyse du marché", action: "recommend", query: "tendances et opportunités du marché" }
        ];
      case 'manager':
        return [
          { label: "🎵 Nouveaux artistes", action: "search", query: "artistes cherchant management" },
          { label: "🤝 Collaborations", action: "match", query: "opportunités de collaborations" },
          { label: "💡 Stratégies", action: "recommend", query: "optimiser stratégies management" }
        ];
      case 'lieu':
        return [
          { label: "🎪 Suggère des artistes", action: "search", query: "artistes pour nos prochains événements" },
          { label: "📅 Optimise programmation", action: "recommend", query: "analyse programmation et suggestions" },
          { label: "🎯 Line-up parfait", action: "match", query: "artistes correspondant à notre audience" }
        ];
      default:
        return [
          { label: "🔍 Explorer la plateforme", action: "search", query: "présente-moi la plateforme" },
          { label: "🎵 Découvrir artistes", action: "search", query: "artistes populaires" }
        ];
    }
  };

  const sendMessage = async (messageText?: string, action?: string) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || isLoading) return;

    // Validate message length
    if (textToSend.length > 1000) {
      toast({
        title: "Message trop long",
        description: "Veuillez limiter votre message à 1000 caractères maximum.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build context for Vybbi
      const context = {
        page: location.pathname,
        userType: profile?.profile_type || null,
        userId: user?.id || null,
        profileId: profile?.id || null,
        isAuthenticated: !!user,
        displayName: profile?.display_name || null,
        location: profile?.location || null,
        genres: profile?.genres || null
      };

      // Détection simple d'intention de recherche côté client
      const intentSearch = /\b(recherche|chercher|trouve|search|find)\b/.test(textToSend.toLowerCase());
      const actionToSend = action || (intentSearch ? 'search' : selectedAction);
      const clientFilters = intentSearch ? { q: textToSend } : {};

      const { data, error } = await supabase.functions.invoke('vybbi-ai', {
        body: {
          message: textToSend,
          action: actionToSend,
          context: context,
          filters: clientFilters
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to get Vybbi response');
      }

      const aiMessage: Message = {
        id: `vybbi-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Désolé, je n\'ai pas pu traiter votre demande.',
        timestamp: new Date(),
        action: data.action,
        searchResults: data.searchResults
      };

      setMessages(prev => [...prev, aiMessage]);

      // Update stats if search results are available
      if (data.searchResults) {
        setStats({
          profiles: data.searchResults.profiles?.length || 0,
          events: data.searchResults.events?.length || 0,
          annonces: data.searchResults.annonces?.length || 0
        });
      }

    } catch (error) {
      console.error('Vybbi error:', error);
      
      toast({
        title: "Erreur de communication",
        description: error instanceof Error ? error.message : "Impossible de contacter Vybbi",
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

  const handleQuickAction = (query: string, action: string) => {
    setSelectedAction(action);
    sendMessage(query, action);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderSearchResults = (results: any) => {
    if (!results) return null;

    const { profiles, events, annonces, availability } = results;
    const hasResults = profiles?.length || events?.length || annonces?.length || availability?.length;

    if (!hasResults) return null;

    return (
      <div className="mt-3 space-y-3 border-t pt-3">
        {profiles?.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Users className="h-3 w-3" />
              Profils trouvés ({profiles.length})
            </h4>
            <div className="grid gap-2 max-h-32 overflow-y-auto">
              {profiles.slice(0, 3).map((profile: any, index: number) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded bg-muted/50 text-xs">
                  <Badge variant="outline" className="text-xs">
                    {profile.profile_type || 'Profil'}
                  </Badge>
                  <span className="font-medium">{profile.display_name}</span>
                  {profile.location && (
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {profile.location}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {events?.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Événements ({events.length})
            </h4>
            <div className="grid gap-2 max-h-32 overflow-y-auto">
              {events.slice(0, 3).map((event: any, index: number) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded bg-muted/50 text-xs">
                  <Badge variant="outline" className="text-xs">Événement</Badge>
                  <span className="font-medium">{event.title}</span>
                  {event.event_date && (
                    <span className="text-muted-foreground">{new Date(event.event_date).toLocaleDateString('fr-FR')}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {annonces?.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              Annonces ({annonces.length})
            </h4>
            <div className="grid gap-2 max-h-32 overflow-y-auto">
              {annonces.slice(0, 3).map((annonce: any, index: number) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded bg-muted/50 text-xs">
                  <Badge variant="outline" className="text-xs">Annonce</Badge>
                  <span className="font-medium">{annonce.title}</span>
                  {annonce.budget_max && (
                    <span className="text-muted-foreground">Budget: {annonce.budget_max}€</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const actionOptions = [
    { id: 'assistant', label: 'Assistant', icon: MessageCircle, description: 'Chat général' },
    { id: 'search', label: 'Recherche', icon: Search, description: 'Trouvez des profils' },
    { id: 'match', label: 'Match', icon: TrendingUp, description: 'Opportunités' },
    { id: 'recommend', label: 'Conseils', icon: Bot, description: 'Recommandations' }
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className={`flex flex-col h-full max-h-[600px] ${className}`}>
      {/* Header */}
      <div className="flex flex-col gap-3 p-4 border-b bg-gradient-to-r from-primary/10 to-purple-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <img src={vybbiLogo} alt="Vybbi IA" className="h-8 w-8 rounded-full" />
            </div>
            <div>
              <h3 className="font-bold text-lg bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Vybbi
              </h3>
              <p className="text-xs text-muted-foreground">Assistant Intelligent</p>
            </div>
          </div>
          {user && (
            <Badge variant="secondary" className="text-xs">
              {profile?.display_name || 'Utilisateur connecté'}
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          {actionOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.id}
                variant={selectedAction === option.id ? "default" : "outline"}
                size="sm"
                className="text-xs h-8 flex items-center gap-1"
                onClick={() => setSelectedAction(option.id)}
              >
                <Icon className="h-3 w-3" />
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden bg-muted/20 flex items-center justify-center">
                <img src={vybbiLogo} alt="Vybbi IA" className="w-full h-full rounded-full object-cover" />
              </div>
              <p>Commencez une conversation avec Vybbi</p>
              <p className="text-sm mt-2">Tapez votre message ci-dessous (max 1000 caractères)</p>
              
              {/* Quick Actions */}
              {profile && (
                <div className="mt-6 space-y-3">
                  <p className="text-sm font-medium">Suggestions pour vous :</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {getQuickActions().map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => handleQuickAction(action.query, action.action)}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
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
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    <img src={vybbiLogo} alt="Vybbi" className="w-full h-full rounded-full object-cover" />
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
                  {message.role === 'assistant' && message.searchResults && renderSearchResults(message.searchResults)}
                  {message.role === 'assistant' && message.action && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      Mode: {message.action}
                    </Badge>
                  )}
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
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  <img src={vybbiLogo} alt="Vybbi" className="w-full h-full rounded-full object-cover" />
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
              placeholder={`Demandez quelque chose à Vybbi... (max 1000 caractères)`}
              disabled={isLoading}
              maxLength={1000}
              className="pr-16"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {inputMessage.length}/1000
            </div>
          </div>
          <Button
            onClick={() => sendMessage()}
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

export default VybbiChat;