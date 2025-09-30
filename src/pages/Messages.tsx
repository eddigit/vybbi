import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';
import { useTypingPresence } from '@/hooks/useTypingPresence';
import ConversationList from '@/components/messages/ConversationList';
import MessageHeader from '@/components/messages/MessageHeader';
import MessageList from '@/components/messages/MessageList';
import Composer from '@/components/messages/Composer';
import RightInfoPanel from '@/components/messages/RightInfoPanel';

export default function Messages() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // State
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  
  // Ref to track if we've auto-selected a conversation
  const hasAutoSelectedRef = useRef(false);
  
  // Load conversations and messages
  const conversationsResult = useConversations();
  const messagesResult = useMessages(selectedConversationId);
  
  const typingResult = useTypingPresence(selectedConversationId);

  // Safe destructuring
  const {
    conversations = [],
    loading: conversationsLoading = false,
    error: conversationsError = null,
    refetch: refetchConversations,
    archiveConversation,
    unarchiveConversation,
    pinConversation,
    unpinConversation,
    deleteConversation
  } = conversationsResult || {};

  const {
    messages = [],
    loading: messagesLoading = false,
    error: messagesError = null,
    markAsRead,
    sendMessage
  } = messagesResult || {};

  const { typingUsers = [] } = typingResult || {};

  // Selected conversation details
  const selectedConversation = selectedConversationId 
    ? conversations.find(c => c.id === selectedConversationId) 
    : null;

  // Handle contact parameter - moved before useEffect to fix TDZ issue
  const handleContactParameter = useCallback(async () => {
    const searchParams = new URLSearchParams(location.search);
    const contactUserId = searchParams.get('contact');
    const conversationParam = searchParams.get('conversation');
    const partnerProfileId = searchParams.get('partner');
    
    // Handle direct conversation navigation
    if (conversationParam) {
      setSelectedConversationId(conversationParam);
      navigate('/messages', { replace: true });
      return;
    }
    
    if ((contactUserId || partnerProfileId) && user) {
      try {
        let targetUserId = contactUserId;
        
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
            setSelectedConversationId(conversationId);
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
  }, [location.search, navigate, user, toast, setSelectedConversationId]);

  useEffect(() => {
    if (user) {
      handleContactParameter();
    }
  }, [user, handleContactParameter]);

  useEffect(() => {
    // On mobile, hide conversation list when a conversation is selected
    if (isMobile && selectedConversationId) {
      setShowConversationList(false);
    }
  }, [selectedConversationId, isMobile]);

  // Auto-select the most recent conversation on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const hasUrlParams = searchParams.has('contact') || searchParams.has('conversation') || searchParams.has('partner');
    
    // Auto-select only if:
    // - We haven't already auto-selected
    // - No conversation is currently selected
    // - There are conversations available
    // - No URL parameters are present
    // - Not loading
    if (
      !hasAutoSelectedRef.current &&
      !selectedConversationId &&
      conversations.length > 0 &&
      !hasUrlParams &&
      !conversationsLoading
    ) {
      console.log('🎯 [Messages] Auto-selecting most recent conversation:', conversations[0].id);
      setSelectedConversationId(conversations[0].id);
      hasAutoSelectedRef.current = true;
      
      // On desktop, keep the chat visible
      // On mobile, keep the conversation list visible until user clicks
      if (isMobile) {
        setShowConversationList(true);
      }
    }
  }, [conversations, selectedConversationId, conversationsLoading, location.search, isMobile]);

  const handleSelectConversation = (conversationId: string) => {
    console.log('🔔 [Messages] Selecting conversation:', conversationId);
    setSelectedConversationId(conversationId);
    if (isMobile) {
      setShowConversationList(false);
    }
    // Trigger a refetch of conversations to update unread counts after a short delay
    setTimeout(() => {
      console.log('🔄 [Messages] Refetching conversations to update badges');
      refetchConversations();
    }, 500);
  };

  const handleBackToList = () => {
    setSelectedConversationId(null);
    setShowConversationList(true);
    setShowInfo(false);
  };

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!selectedConversationId || !user) return;

    try {
      await sendMessage(content, attachments);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Cannot send more messages until recipient replies')) {
        toast({
          title: "Message non envoyé",
          description: "Vous devez attendre une réponse avant d'envoyer un autre message.",
          variant: "destructive",
        });
      } else if (errorMessage.includes('blocked user')) {
        toast({
          title: "Message non envoyé",
          description: "Vous ne pouvez pas envoyer de message à cet utilisateur.",
          variant: "destructive",
        });
      } else if (errorMessage.includes('exclusive manager')) {
        toast({
          title: "Message non envoyé",
          description: "Cet artiste ne peut être contacté que par son manager exclusif.",
          variant: "destructive",
        });
      } else {
        console.error('Send message error:', errorMessage);
        toast({
          title: "Erreur",
          description: `Impossible d'envoyer le message: ${errorMessage}`,
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  const handleBlockUser = async () => {
    if (!selectedConversation?.peer_user_id || !user) return;

    try {
      const { error } = await supabase
        .from('blocked_users')
        .insert({
          blocker_user_id: user.id,
          blocked_user_id: selectedConversation.peer_user_id
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
    console.log('Messages - No user found');
    return (
      <div className="w-full px-4 py-8 text-center">
        <p>Connectez-vous pour accéder aux messages.</p>
      </div>
    );
  }

  console.log('Messages - User found:', user.id);

  if (conversationsLoading) {
    console.log('Messages - Loading conversations...');
    return (
      <div className="w-full px-4 py-8">
        <div className="animate-pulse">Chargement des conversations...</div>
      </div>
    );
  }

  // Show error state if there are hook errors
  if (conversationsError || messagesError) {
    console.log('Messages - Error:', conversationsError || messagesError);
    return (
      <div className="w-full px-4 py-8 text-center">
        <p className="text-red-500">
          Erreur: {conversationsError || messagesError}
        </p>
      </div>
    );
  }

  console.log('Messages - Rendering main UI');

  const canSendMessage = selectedConversation && !selectedConversation.is_blocked;

  // Desktop layout (lg and above) - LinkedIn style 3 columns
  if (!isMobile) {
    return (
      <div className="container mx-auto p-3 sm:p-6">
        <div className="min-h-[calc(100vh-200px)] flex bg-background border rounded-lg overflow-hidden">
          {/* Left Sidebar - Conversations (320px like LinkedIn) */}
          <div className="w-96 flex-shrink-0 border-r border-border bg-background">
            <ConversationList
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              onSelectConversation={handleSelectConversation}
              onArchiveConversation={archiveConversation || (() => {})}
              onUnarchiveConversation={unarchiveConversation || (() => {})}
              onPinConversation={pinConversation || (() => {})}
              onUnpinConversation={unpinConversation || (() => {})}
              onDeleteConversation={deleteConversation || (() => {})}
            />
          </div>

          {/* Center - Chat Window */}
          <div className="flex-1 flex flex-col min-w-0 border-r border-border">
            {selectedConversation ? (
              <>
                <MessageHeader
                  conversation={selectedConversation}
                  typingUsers={typingUsers}
                  onBack={handleBackToList}
                  onOpenInfo={() => setShowInfo(!showInfo)}
                  onBlockUser={handleBlockUser}
                />
                
                <div className="flex-1 overflow-hidden">
                  <MessageList messages={messages} loading={messagesLoading} />
                </div>
                
                <div className="border-t border-border bg-background p-4">
                  <Composer
                    conversationId={selectedConversationId}
                    onSendMessage={handleSendMessage}
                    disabled={!canSendMessage}
                    placeholder={
                      selectedConversation?.is_blocked
                        ? "Vous ne pouvez pas envoyer de message à cet utilisateur"
                        : "Tapez votre message..."
                    }
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-muted/30">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Sélectionnez une conversation</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Choisissez une conversation dans la liste pour commencer à échanger
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Info Panel (ALWAYS visible like LinkedIn) */}
          <div className="w-75 flex-shrink-0 bg-background">
            <RightInfoPanel
              conversation={selectedConversation}
              isOpen={true}
              onClose={() => setShowInfo(false)}
              onBlockUser={handleBlockUser}
              onPinConversation={() => selectedConversationId && pinConversation && pinConversation(selectedConversationId)}
              onUnpinConversation={() => selectedConversationId && unpinConversation && unpinConversation(selectedConversationId)}
              onArchiveConversation={() => selectedConversationId && archiveConversation && archiveConversation(selectedConversationId)}
              onUnarchiveConversation={() => selectedConversationId && unarchiveConversation && unarchiveConversation(selectedConversationId)}
            />
          </div>
        </div>
      </div>
    );
  }

  // Mobile layout
  return (
    <div className="h-screen flex flex-col pb-20">
      {/* Mobile: Show conversation list OR chat */}
      {showConversationList ? (
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          onArchiveConversation={archiveConversation || (() => {})}
          onUnarchiveConversation={unarchiveConversation || (() => {})}
          onPinConversation={pinConversation || (() => {})}
          onUnpinConversation={unpinConversation || (() => {})}
          onDeleteConversation={deleteConversation || (() => {})}
        />
      ) : (
        <div className="flex flex-col h-full pb-20">
          <MessageHeader
            conversation={selectedConversation}
            typingUsers={typingUsers}
            onBack={handleBackToList}
            onOpenInfo={() => setShowInfo(true)}
            onBlockUser={handleBlockUser}
            showBackButton={true}
          />
          
          <div className="flex-1 overflow-hidden">
            <MessageList messages={messages} loading={messagesLoading} />
          </div>
          
          <div className="relative z-40">
            <Composer
              conversationId={selectedConversationId}
              onSendMessage={handleSendMessage}
              disabled={!canSendMessage}
              placeholder={
                selectedConversation?.is_blocked
                  ? "Vous ne pouvez pas envoyer de message à cet utilisateur"
                  : "Tapez votre message..."
              }
            />
          </div>
        </div>
      )}

      {/* Mobile Info Panel as Drawer */}
      <Drawer open={showInfo} onOpenChange={setShowInfo}>
        <DrawerContent>
          <RightInfoPanel
            conversation={selectedConversation}
            isOpen={showInfo}
            onClose={() => setShowInfo(false)}
            onBlockUser={handleBlockUser}
            onPinConversation={() => selectedConversationId && pinConversation && pinConversation(selectedConversationId)}
            onUnpinConversation={() => selectedConversationId && unpinConversation && unpinConversation(selectedConversationId)}
            onArchiveConversation={() => selectedConversationId && archiveConversation && archiveConversation(selectedConversationId)}
            onUnarchiveConversation={() => selectedConversationId && unarchiveConversation && unarchiveConversation(selectedConversationId)}
          />
        </DrawerContent>
      </Drawer>
    </div>
  );
}