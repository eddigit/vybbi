import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, MessageSquare, Users } from 'lucide-react';
import { AutoTranslate } from '@/components/AutoTranslate';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  user: {
    display_name: string;
    avatar_url?: string;
    profile_type: string;
  };
}

interface WebTVChatRecord {
  id: string;
  event_id: string;
  user_id: string;
  message: string;
  created_at: string;
}

interface WebTVEventRecord {
  id: string;
  title: string;
  description?: string;
  youtube_video_id?: string;
  scheduled_for: string;
  is_live: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface WebTVChatProps {
  eventId: string;
  eventTitle: string;
  isLive: boolean;
}

export function WebTVChat({ eventId, eventTitle, isLive }: WebTVChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatChannel = useRef<any>(null);

  useEffect(() => {
    if (!eventId) return;

    fetchMessages();
    setupRealtimeChat();

    return () => {
      if (chatChannel.current) {
        chatChannel.current.unsubscribe();
      }
    };
  }, [eventId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('webtv_chat_messages' as any)
        .select(`
          id,
          user_id,
          message,
          created_at,
          profiles:user_id (
            display_name,
            avatar_url,
            profile_type
          )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      const formattedMessages = data?.map((msg: any) => ({
        id: msg.id,
        user_id: msg.user_id,
        message: msg.message,
        created_at: msg.created_at,
        user: {
          display_name: msg.profiles?.display_name || 'Utilisateur',
          avatar_url: msg.profiles?.avatar_url,
          profile_type: msg.profiles?.profile_type || 'user'
        }
      })) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const setupRealtimeChat = () => {
    if (chatChannel.current) {
      chatChannel.current.unsubscribe();
    }

    chatChannel.current = supabase
      .channel(`webtv_chat_${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'webtv_chat_messages',
          filter: `event_id=eq.${eventId}`,
        },
        async (payload) => {
          // Simplement ajouter le nouveau message depuis le payload
          const newMsg = {
            id: payload.new.id,
            user_id: payload.new.user_id,
            message: payload.new.message,
            created_at: payload.new.created_at,
            user: {
              display_name: 'Utilisateur',
              avatar_url: undefined,
              profile_type: 'user'
            }
          };

          setMessages(prev => [...prev, newMsg]);
          
          // Optionnellement, refetch les messages pour avoir les données complètes
          fetchMessages();
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const presenceState = chatChannel.current.presenceState();
        setOnlineUsers(Object.keys(presenceState).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track user presence
          if (profile) {
            await chatChannel.current.track({
              user_id: user?.id,
              display_name: profile.display_name,
            });
          }
        }
      });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !profile || isLoading) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('webtv_chat_messages' as any)
        .insert({
          event_id: eventId,
          user_id: user.id,
          message: newMessage.trim(),
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer le message',
        variant: 'destructive',
      });
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

  const getUserBadgeColor = (profileType: string) => {
    switch (profileType) {
      case 'artist': return 'bg-purple-500';
      case 'agent': return 'bg-blue-500';
      case 'manager': return 'bg-green-500';
      case 'lieu': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getUserBadgeText = (profileType: string) => {
    switch (profileType) {
      case 'artist': return 'Artiste';
      case 'agent': return 'Agent';
      case 'manager': return 'Manager';
      case 'lieu': return 'Lieu';
      default: return 'Viewer';
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <AutoTranslate text="Chat Live" />
          </CardTitle>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{onlineUsers}</span>
          </div>
        </div>
        {isLive && (
          <Badge variant="destructive" className="w-fit animate-pulse">
            🔴 <AutoTranslate text="EN DIRECT" />
          </Badge>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  <AutoTranslate text="Soyez le premier à commenter !" />
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={message.user.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {message.user.display_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">
                        {message.user.display_name}
                      </span>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getUserBadgeColor(message.user.profile_type)} text-white`}
                      >
                        {getUserBadgeText(message.user.profile_type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatDistanceToNow(new Date(message.created_at), { 
                          locale: fr, 
                          addSuffix: true 
                        })}
                      </span>
                    </div>
                    <p className="text-sm break-words">{message.message}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t">
          {user && profile ? (
            <div className="flex gap-2">
              <Input
                placeholder={isLive ? "Écrivez votre message..." : "Le chat sera disponible pendant le live"}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!isLive || isLoading}
                className="flex-1"
                maxLength={200}
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || !isLive || isLoading}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-2">
              <AutoTranslate text="Connectez-vous pour participer au chat" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}