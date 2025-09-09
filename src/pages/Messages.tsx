import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MessageCircle, Send, Plus, Ban, AlertTriangle, ArrowLeft } from "lucide-react";
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
      const cleanup = subscribeToMessages(selectedConversation);
      
      // Find conversation details
      const convDetails = conversations.find(c => c.id === selectedConversation);
      setSelectedConversationDetails(convDetails || null);
      
      return cleanup;
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
        
        // Deduplication: For direct conversations, keep only one per peer user
        const conversationMap = new Map();
        conversationsWithDetails.forEach(conv => {
          const key = conv.type === 'direct' && conv.other_participant?.user_id 
            ? conv.other_participant.user_id 
            : conv.id;
          
          if (!conversationMap.has(key)) {
            conversationMap.set(key, conv);
          } else {
            const existing = conversationMap.get(key);
            // Keep the one with the most recent last_message_at or created_at
            const existingTime = new Date(existing.last_message_at || existing.created_at);
            const currentTime = new Date(conv.last_message_at || conv.created_at);
            
            if (currentTime > existingTime) {
              conversationMap.set(key, conv);
            }
          }
        });
        
        // Convert back to array and sort
        const dedupedConversations = Array.from(conversationMap.values())
          .sort((a, b) => {
            const timeA = new Date(a.last_message_at || a.created_at);
            const timeB = new Date(b.last_message_at || b.created_at);
            return timeB.getTime() - timeA.getTime();
          });
        
        setConversations(dedupedConversations);
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
      .channel(`messages-${conversationId}`)
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
    <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold mb-2">Messages</h1>
        <p className="text-muted-foreground text-sm sm:text-base xl:text-lg">Connect with artists, agents, and venues</p>
        
        {/* Legal disclaimer */}
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-muted/50 rounded-lg border">
          <p className="text-xs sm:text-sm text-muted-foreground">
            <strong>Information importante :</strong> Cette messagerie conserve toutes les conversations de manière sécurisée et chiffrée. 
            En cas de litige contractuel ou de problème lié à une prestation, ces conversations peuvent être utilisées 
            comme preuves et consultées par les parties concernées et les autorités compétentes si nécessaire.
          </p>
        </div>
      </div>

      {/* Mobile-first layout: Single column on mobile, grid on larger screens */}
      <div className="flex flex-col lg:grid lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 h-[calc(100vh-8rem)] sm:h-[calc(100vh-12rem)]">
        {/* Conversations List - Full width on mobile, column on desktop */}
        {(!selectedConversation || window.innerWidth >= 1024) && (
          <Card className="lg:col-span-1 xl:col-span-2 mobile-card">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-12rem)] sm:h-[calc(100vh-18rem)]">
                {conversations.length === 0 ? (
                  <div className="p-4 sm:p-6 text-center text-muted-foreground">
                    <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 xl:w-10 xl:h-10 mx-auto mb-2" />
                    <p className="text-sm sm:text-base xl:text-lg">Aucune conversation</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {conversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation.id)}
                        className={`w-full p-3 sm:p-4 text-left hover:bg-muted/50 transition-colors touch-target ${
                          selectedConversation === conversation.id ? 'bg-muted' : ''
                        } ${conversation.is_blocked ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-start gap-3 sm:gap-4">
                          <Avatar className="w-10 h-10 sm:w-12 sm:h-12 shrink-0">
                            <AvatarImage src={conversation.other_participant?.avatar_url || undefined} />
                            <AvatarFallback className="text-sm sm:text-base xl:text-lg">
                              {conversation.other_participant?.display_name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-start gap-2">
                              <p className="font-medium truncate text-sm sm:text-base xl:text-lg text-left">
                                {conversation.other_participant?.display_name || 'Utilisateur inconnu'}
                              </p>
                              {conversation.other_participant?.profile_type && (
                                <span className="text-xs sm:text-sm px-2 py-1 rounded-full bg-primary/10 text-primary capitalize shrink-0">
                                  {conversation.other_participant.profile_type}
                                </span>
                              )}
                              {conversation.is_blocked && <Ban className="w-3 h-3 sm:w-4 sm:h-4 text-destructive shrink-0" />}
                            </div>
                            <p className="text-xs sm:text-sm xl:text-base text-muted-foreground truncate text-left">
                              {conversation.last_message?.content || 'Aucun message'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {conversation.last_message_at ? 
                                  new Date(conversation.last_message_at).toLocaleDateString() :
                                  new Date(conversation.created_at).toLocaleDateString()
                                }
                              </p>
                              {!conversation.reply_received && conversation.last_message?.sender_id === user?.id && (
                                <span className="text-xs sm:text-sm text-amber-600 bg-amber-100 px-1 sm:px-2 rounded">En attente</span>
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
        )}

        {/* Messages Panel - Full width on mobile when selected, column on desktop */}
        {(selectedConversation || window.innerWidth >= 1024) && (
          <Card className="lg:col-span-3 xl:col-span-3 mobile-card">
            {selectedConversation && selectedConversationDetails ? (
              <>
                <CardHeader className="flex flex-row items-center justify-between py-3 sm:py-6">
                  {/* Mobile back button */}
                  <div className="lg:hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedConversation(null)}
                      className="mr-2 h-9 w-9"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-xl">
                    <Avatar className="w-7 h-7 sm:w-8 sm:h-8 xl:w-10 xl:h-10">
                      <AvatarImage src={selectedConversationDetails.other_participant?.avatar_url || undefined} />
                      <AvatarFallback className="text-sm sm:text-base xl:text-lg">
                        {selectedConversationDetails.other_participant?.display_name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm sm:text-base xl:text-lg">
                        {selectedConversationDetails.other_participant?.display_name || 'Utilisateur inconnu'}
                      </p>
                      {selectedConversationDetails.other_participant?.profile_type && (
                        <span className="text-xs sm:text-sm text-muted-foreground capitalize">
                          {selectedConversationDetails.other_participant.profile_type}
                        </span>
                      )}
                    </div>
                  </CardTitle>

                  {selectedConversationDetails.other_participant?.user_id && !selectedConversationDetails.is_blocked && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-destructive border-destructive/30 hover:bg-destructive/10">
                          <Ban className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="mx-4 sm:mx-0">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-warning" />
                            Bloquer cet utilisateur
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-sm">
                            Êtes-vous sûr de vouloir bloquer {selectedConversationDetails.other_participant?.display_name} ? 
                            Cette action empêchera cet utilisateur de vous envoyer des messages.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                          <AlertDialogCancel className="mobile-button">Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => blockUser(selectedConversationDetails.other_participant!.user_id)}
                            className="mobile-button bg-destructive hover:bg-destructive/90"
                          >
                            Bloquer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </CardHeader>

                <ScrollArea className="flex-1 px-3 sm:px-6 h-[calc(100vh-16rem)] sm:h-[calc(100vh-20rem)]">
                  <div className="space-y-3 sm:space-y-4 py-2">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-2 sm:gap-3 ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.sender_id !== user?.id && (
                          <Avatar className="w-6 h-6 sm:w-8 sm:h-8 mt-1">
                            <AvatarImage src={message.sender?.avatar_url || undefined} />
                            <AvatarFallback className="text-xs sm:text-sm">
                              {message.sender?.display_name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[80%] sm:max-w-[70%] rounded-xl px-3 py-2 sm:px-4 sm:py-3 ${
                            message.sender_id === user?.id
                              ? 'bg-primary text-primary-foreground ml-auto'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm sm:text-base break-words">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        {message.sender_id === user?.id && (
                          <Avatar className="w-6 h-6 sm:w-8 sm:h-8 mt-1">
                            <AvatarImage src={profile?.avatar_url || undefined} />
                            <AvatarFallback className="text-xs sm:text-sm">
                              {profile?.display_name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {selectedConversationDetails.is_blocked ? (
                  <div className="p-3 sm:p-6 border-t bg-muted/50">
                    <p className="text-center text-sm text-muted-foreground">
                      Cette conversation est bloquée
                    </p>
                  </div>
                ) : !selectedConversationDetails.can_send_message ? (
                  <div className="p-3 sm:p-6 border-t bg-warning/10">
                    <p className="text-center text-sm text-warning-foreground">
                      Vous devez attendre une réponse avant d'envoyer un autre message
                    </p>
                  </div>
                ) : (
                  <form onSubmit={sendMessage} className="p-3 sm:p-6 border-t">
                    <div className="flex gap-2 sm:gap-4">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Tapez votre message..."
                        className="flex-1 mobile-input"
                        disabled={sendingMessage}
                      />
                      <Button 
                        type="submit" 
                        disabled={!newMessage.trim() || sendingMessage}
                        className="mobile-button h-12 w-12 p-0 sm:h-12 sm:w-auto sm:px-6"
                      >
                        <Send className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Envoyer</span>
                      </Button>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <div className="h-full flex items-center justify-center p-6">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg sm:text-xl font-medium mb-2">Sélectionnez une conversation</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Choisissez une conversation dans la liste pour commencer à échanger
                  </p>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
