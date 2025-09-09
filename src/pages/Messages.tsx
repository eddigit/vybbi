import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MessageCircle, Send, Plus, Ban, AlertTriangle } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Conversation, Message, Profile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface ConversationWithDetails extends Conversation {
  other_participant?: {
    user_id: string;
    display_name: string;
    avatar_url?: string;
    profile_type?: string;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id?: string;
  };
  last_message_at?: string;
  reply_received?: boolean;
  is_blocked?: boolean;
  can_send_message?: boolean;
}

interface MessageWithSender extends Omit<Message, 'sender'> {
  sender?: {
    display_name: string;
    avatar_url: string;
  };
}

export default function Messages() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedConversationDetails, setSelectedConversationDetails] = useState<ConversationWithDetails | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConversations();
      handleContactParameter();
    }
  }, [user, location.search]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      subscribeToMessages(selectedConversation);
      
      // Find conversation details
      const convDetails = conversations.find(c => c.id === selectedConversation);
      setSelectedConversationDetails(convDetails || null);
    }
  }, [selectedConversation, conversations]);

  const handleContactParameter = async () => {
    const searchParams = new URLSearchParams(location.search);
    const contactUserId = searchParams.get('contact');
    const partnerProfileId = searchParams.get('partner');
    
    // Handle navigation from notification with specific conversation ID
    if (location.state?.selectedConversationId) {
      const selectedConversationId = location.state.selectedConversationId;
      
      // Wait for conversations to be loaded if not already
      if (conversations.length === 0) {
        await fetchConversations();
      }
      
      // Find and select the conversation
      const conversation = conversations.find(c => c.id === selectedConversationId);
      if (conversation) {
        setSelectedConversation(selectedConversationId);
        // Clear the state to prevent re-navigation
        navigate('/messages', { replace: true });
        return;
      }
    }
    
    if ((contactUserId || partnerProfileId) && user) {
      try {
        let targetUserId = contactUserId;
        
        // If partner profile ID is provided, get the user_id for that profile
        if (partnerProfileId) {
          const { data: partnerProfile } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('id', partnerProfileId)
            .maybeSingle();
          
          if (partnerProfile) {
            targetUserId = partnerProfile.user_id;
          }
        }
        
        if (targetUserId) {
          const { data: conversationId, error } = await supabase.rpc('start_direct_conversation', {
            target_user_id: targetUserId
          });
          
          if (error) {
            if (error.message.includes('blocked user')) {
              toast({
                title: "Impossible de contacter",
                description: "Vous ne pouvez pas contacter cet utilisateur.",
                variant: "destructive",
              });
            } else {
              toast({
                title: "Erreur",
                description: "Impossible de démarrer la conversation.",
                variant: "destructive",
              });
            }
            navigate('/messages', { replace: true });
            return;
          }
          
          if (conversationId) {
            setSelectedConversation(conversationId);
            await fetchConversations();
            navigate('/messages', { replace: true });
          }
        }
      } catch (error) {
        console.error('Error starting conversation:', error);
        toast({
          title: "Erreur",
          description: "Impossible de démarrer la conversation.",
          variant: "destructive",
        });
        navigate('/messages', { replace: true });
      }
    }
  };

  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      const { data: conversationsData, error } = await supabase.rpc('get_conversations_with_peers');

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }
      
      if (conversationsData) {
        const conversationsWithDetails = conversationsData.map((conv: any) => {
          const otherParticipant = conv.peer_user_id ? {
            user_id: conv.peer_user_id,
            display_name: conv.peer_display_name || 'Utilisateur inconnu',
            avatar_url: conv.peer_avatar_url,
            profile_type: conv.peer_profile_type
          } : null;

          const lastMessage = conv.last_message_content ? {
            content: conv.last_message_content,
            created_at: conv.last_message_created_at,
            sender_id: null // We don't need this for display in conversation list
          } : null;

          // Determine if user can send message
          const canSendMessage = !conv.is_blocked && (
            conv.reply_received || 
            !lastMessage
          );
          
          return {
            id: conv.conversation_id,
            type: conv.conversation_type,
            title: conv.conversation_title,
            created_at: new Date().toISOString(), // We can use a default since we order by last_message_at
            updated_at: new Date().toISOString(), // Add required field
            last_message_at: conv.last_message_at,
            reply_received: conv.reply_received,
            other_participant: otherParticipant,
            last_message: lastMessage,
            is_blocked: conv.is_blocked,
            can_send_message: canSendMessage
          };
        });
        
        setConversations(conversationsWithDetails);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (data) {
        // Fetch sender details separately to avoid relation issues
        const messagesWithSenders = await Promise.all(
          data.map(async (message) => {
            console.log('Fetching sender for message from user_id:', message.sender_id);
            const { data: senderData } = await supabase
              .from('profiles')
              .select('display_name, avatar_url')
              .eq('user_id', message.sender_id)
              .maybeSingle();
            
            console.log('Sender data retrieved:', senderData);
            
            return {
              ...message,
              sender: senderData || { display_name: 'Utilisateur inconnu', avatar_url: null }
            };
          })
        );
        
        setMessages(messagesWithSenders);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const subscribeToMessages = (conversationId: string) => {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // For real-time messages, we need to fetch sender info
          const fetchSenderAndAddMessage = async () => {
            const { data: senderData } = await supabase
              .from('profiles')
              .select('display_name, avatar_url')
              .eq('user_id', payload.new.sender_id)
              .maybeSingle();
            
            const messageWithSender = {
              ...payload.new,
              sender: senderData || { display_name: 'Utilisateur inconnu', avatar_url: null }
            } as MessageWithSender;
            
            setMessages(prev => [...prev, messageWithSender]);
          };
          
          fetchSenderAndAddMessage();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !user || sendingMessage) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation,
          sender_id: user.id,
          content: newMessage.trim(),
        });
      
      if (error) {
        if (error.message.includes('Cannot send more messages until recipient replies')) {
          toast({
            title: "Message non envoyé",
            description: "Vous devez attendre une réponse avant d'envoyer un autre message.",
            variant: "destructive",
          });
        } else if (error.message.includes('blocked user')) {
          toast({
            title: "Message non envoyé",
            description: "Vous ne pouvez pas envoyer de message à cet utilisateur.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erreur",
            description: "Impossible d'envoyer le message.",
            variant: "destructive",
          });
        }
      } else {
        setNewMessage('');
        // Refresh conversation details
        await fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message.",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const blockUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('blocked_users')
        .insert({
          blocker_user_id: user?.id,
          blocked_user_id: userId
        });
      
      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de bloquer cet utilisateur.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Utilisateur bloqué",
          description: "L'utilisateur a été bloqué avec succès.",
        });
        await fetchConversations();
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      toast({
        title: "Erreur",
        description: "Impossible de bloquer cet utilisateur.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-6 py-8 text-center">
        <p>Please sign in to access messages.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="animate-pulse">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl xl:text-4xl font-bold mb-2">Messages</h1>
        <p className="text-muted-foreground xl:text-lg">Connect with artists, agents, and venues</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-6 h-[calc(100vh-12rem)]">
        {/* Conversations List */}
        <Card className="lg:col-span-1 xl:col-span-2">
          <CardHeader className="xl:pb-6">
            <CardTitle className="xl:text-xl">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-18rem)]">
              {conversations.length === 0 ? (
                <div className="p-4 xl:p-6 text-center text-muted-foreground">
                  <MessageCircle className="w-8 h-8 xl:w-10 xl:h-10 mx-auto mb-2" />
                  <p className="xl:text-lg">Aucune conversation</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`w-full p-3 xl:p-4 text-left hover:bg-muted/50 transition-colors ${
                        selectedConversation === conversation.id ? 'bg-muted' : ''
                      } ${conversation.is_blocked ? 'opacity-50' : ''}`}
                    >
        <div className="flex items-center gap-3 xl:gap-4">
          <Avatar className="w-10 h-10 xl:w-12 xl:h-12">
            <AvatarImage src={conversation.other_participant?.avatar_url || undefined} />
            <AvatarFallback className="xl:text-lg">
              {conversation.other_participant?.display_name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate xl:text-lg">
                              {conversation.other_participant?.display_name || 'Utilisateur inconnu'}
                            </p>
                            {conversation.other_participant?.profile_type && (
                              <span className="text-xs xl:text-sm px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
                                {conversation.other_participant.profile_type}
                              </span>
                            )}
                            {conversation.is_blocked && <Ban className="w-3 h-3 xl:w-4 xl:h-4 text-destructive" />}
                          </div>
                          <p className="text-sm xl:text-base text-muted-foreground truncate">
                            {conversation.last_message?.content || 'Aucun message'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs xl:text-sm text-muted-foreground">
                              {conversation.last_message_at ? 
                                new Date(conversation.last_message_at).toLocaleDateString() :
                                new Date(conversation.created_at).toLocaleDateString()
                              }
                            </p>
                            {!conversation.reply_received && conversation.last_message?.sender_id === user?.id && (
                              <span className="text-xs xl:text-sm text-amber-600 bg-amber-100 px-1 xl:px-2 rounded">En attente</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="lg:col-span-3 xl:col-span-3">
          {selectedConversation && selectedConversationDetails ? (
            <>
              <CardHeader className="flex flex-row items-center justify-between xl:py-6">
                <CardTitle className="flex items-center gap-2 xl:gap-3 xl:text-xl">
                <Avatar className="w-8 h-8 xl:w-10 xl:h-10">
                  <AvatarImage src={selectedConversationDetails.other_participant?.avatar_url || undefined} />
                  <AvatarFallback className="xl:text-lg">
                    {selectedConversationDetails.other_participant?.display_name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2">
                  <span>{selectedConversationDetails.other_participant?.display_name || 'Utilisateur inconnu'}</span>
                  {selectedConversationDetails.other_participant?.profile_type && (
                    <span className="text-xs xl:text-sm px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
                      {selectedConversationDetails.other_participant.profile_type}
                    </span>
                  )}
                  {selectedConversationDetails.is_blocked && <Ban className="w-4 h-4 xl:w-5 xl:h-5 text-destructive" />}
                </div>
                </CardTitle>
                {selectedConversationDetails.other_participant && !selectedConversationDetails.is_blocked && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="xl:h-10 xl:w-10">
                        <Ban className="w-4 h-4 xl:w-5 xl:h-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="xl:text-lg">Bloquer cet utilisateur ?</AlertDialogTitle>
                        <AlertDialogDescription className="xl:text-base">
                          Vous ne pourrez plus recevoir de messages de cet utilisateur et ne pourrez plus lui en envoyer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="xl:text-base">Annuler</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => blockUser(selectedConversationDetails.other_participant!.user_id)}
                          className="bg-destructive hover:bg-destructive/90 xl:text-base"
                        >
                          Bloquer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </CardHeader>
              <CardContent className="flex flex-col h-[calc(100vh-22rem)]">
                {selectedConversationDetails.is_blocked ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Ban className="w-12 h-12 xl:w-16 xl:h-16 mx-auto mb-4 text-destructive" />
                      <p className="xl:text-lg">Cette conversation est bloquée</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <ScrollArea className="flex-1 mb-4 xl:mb-6">
                      <div className="space-y-4 xl:space-y-6 pr-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div className={`flex items-start gap-2 xl:gap-3 max-w-[70%] ${
                              message.sender_id === user?.id ? 'flex-row-reverse' : 'flex-row'
                            }`}>
                              <Avatar className="w-8 h-8 xl:w-10 xl:h-10">
                                <AvatarImage src={message.sender?.avatar_url} />
                                <AvatarFallback className="xl:text-lg">
                                  {message.sender?.display_name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className={`rounded-lg p-3 xl:p-4 ${
                                message.sender_id === user?.id
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}>
                                <p className="text-sm xl:text-base leading-relaxed">{message.content}</p>
                                <p className={`text-xs xl:text-sm mt-1 xl:mt-2 ${
                                  message.sender_id === user?.id
                                    ? 'text-primary-foreground/70'
                                    : 'text-muted-foreground'
                                }`}>
                                  {new Date(message.created_at).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    {!selectedConversationDetails.can_send_message ? (
                      <div className="p-3 xl:p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
                        <AlertTriangle className="w-4 h-4 xl:w-5 xl:h-5 text-amber-600 mx-auto mb-1 xl:mb-2" />
                        <p className="text-sm xl:text-base text-amber-800">
                          {!selectedConversationDetails.reply_received && selectedConversationDetails.last_message?.sender_id === user?.id
                            ? "Vous devez attendre une réponse avant d'envoyer un autre message"
                            : "Vous ne pouvez plus envoyer de messages dans cette conversation"
                          }
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={sendMessage} className="flex gap-2 xl:gap-3">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Tapez votre message..."
                          className="flex-1 xl:text-base xl:h-12"
                          disabled={sendingMessage}
                        />
                        <Button 
                          type="submit" 
                          size="sm" 
                          className="xl:h-12 xl:w-12"
                          disabled={!newMessage.trim() || sendingMessage}
                        >
                          <Send className="w-4 h-4 xl:w-5 xl:h-5" />
                        </Button>
                      </form>
                    )}
                  </>
                )}
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-[calc(100vh-22rem)]">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="w-12 h-12 xl:w-16 xl:h-16 mx-auto mb-4" />
                <p className="xl:text-lg">Sélectionnez une conversation pour commencer</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}