import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Send, Users, Hash, Radio, Settings } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Community {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  member_count: number;
}

interface Channel {
  id: string;
  name: string;
  description: string;
  type: string;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_profile: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    profile_type: string;
  } | null;
}

const CommunityChat = () => {
  const { communityId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [community, setCommunity] = useState<Community | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (communityId) {
      fetchCommunityData();
    }
  }, [communityId, user]);

  useEffect(() => {
    if (selectedChannel) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [selectedChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchCommunityData = async () => {
    if (!user || !communityId) return;

    try {
      // Check if user is member
      const { data: membershipData } = await supabase
        .from('community_members')
        .select('*')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single();

      if (!membershipData) {
        toast({
          title: "Accès refusé",
          description: "Vous n'êtes pas membre de cette communauté",
          variant: "destructive"
        });
        navigate('/communities');
        return;
      }

      // Fetch community info
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .select('*')
        .eq('id', communityId)
        .single();

      if (communityError) throw communityError;
      setCommunity(communityData);

      // Fetch channels
      const { data: channelsData, error: channelsError } = await supabase
        .from('community_channels')
        .select('*')
        .eq('community_id', communityId)
        .order('position');

      if (channelsError) throw channelsError;
      setChannels(channelsData);
      
      // Select first channel by default
      if (channelsData.length > 0) {
        setSelectedChannel(channelsData[0]);
      }
    } catch (error) {
      console.error('Error fetching community data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de la communauté",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedChannel) return;

    try {
      const { data, error } = await supabase
        .from('community_messages')
        .select(`
          id,
          content,
          created_at,
          sender_profile_id,
          profiles!community_messages_sender_profile_id_fkey (
            id,
            display_name,
            avatar_url,
            profile_type
          )
        `)
        .eq('channel_id', selectedChannel.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      const formattedMessages: Message[] = data.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        sender_profile: msg.profiles
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const subscribeToMessages = () => {
    if (!selectedChannel) return;

    const channel = supabase
      .channel(`community-messages-${selectedChannel.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${selectedChannel.id}`
        },
        async (payload) => {
          // Fetch the sender profile for the new message
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url, profile_type')
            .eq('id', payload.new.sender_profile_id)
            .single();

          const newMessage: Message = {
            id: payload.new.id,
            content: payload.new.content,
            created_at: payload.new.created_at,
            sender_profile: profileData
          };

          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel || !user || sending) return;

    setSending(true);
    try {
      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const { error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: selectedChannel.id,
          sender_id: user.id,
          sender_profile_id: profileData?.id,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'live_radio': return <Radio className="h-4 w-4" />;
      default: return <Hash className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de la communauté...</p>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Communauté non trouvée</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-64 border-r bg-card">
          <div className="p-4 border-b">
            <Button
              variant="ghost"
              onClick={() => navigate('/communities')}
              className="mb-2 p-0 h-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux communautés
            </Button>
            <h2 className="font-semibold truncate">{community.name}</h2>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <Users className="h-3 w-3" />
              <span>{community.member_count} membres</span>
            </div>
          </div>

          <div className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">CANAUX</h3>
            <div className="space-y-1">
              {channels.map((channel) => (
                <Button
                  key={channel.id}
                  variant={selectedChannel?.id === channel.id ? "secondary" : "ghost"}
                  className="w-full justify-start px-2 py-1 h-auto"
                  onClick={() => setSelectedChannel(channel)}
                >
                  {getChannelIcon(channel.type)}
                  <span className="ml-2 truncate">{channel.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChannel ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-card">
                <div className="flex items-center gap-2">
                  {getChannelIcon(selectedChannel.type)}
                  <h3 className="font-semibold">{selectedChannel.name}</h3>
                  {selectedChannel.type === 'live_radio' && (
                    <Badge variant="destructive" className="text-xs">
                      LIVE
                    </Badge>
                  )}
                </div>
                {selectedChannel.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedChannel.description}
                  </p>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.sender_profile?.avatar_url || undefined} />
                      <AvatarFallback>
                        {message.sender_profile?.display_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {message.sender_profile?.display_name || 'Utilisateur inconnu'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(message.created_at), {
                            addSuffix: true,
                            locale: fr
                          })}
                        </span>
                      </div>
                      <p className="text-sm break-words">{message.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t bg-card">
                <div className="flex gap-2">
                  <Input
                    placeholder={`Écrire dans #${selectedChannel.name}`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sending}
                    className="flex-1"
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={!newMessage.trim() || sending}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Sélectionnez un canal pour commencer</p>
              </div>
            </div>
          )}
        </div>
      </div>
  );
};

export default CommunityChat;