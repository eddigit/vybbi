import { useState, useEffect } from 'react';
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
import ChatHeader from '@/components/messages/ChatHeader';
import MessageList from '@/components/messages/MessageList';
import Composer from '@/components/messages/Composer';
import RightInfoPanel from '@/components/messages/RightInfoPanel';

export default function Messages() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  console.log('Messages component loaded, user:', user);
  
  // State
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  
  // Test if hooks are working properly
  console.log('Loading conversations...');
  const conversationsResult = useConversations();
  console.log('Conversations result:', conversationsResult);
  
  console.log('Loading messages for conversation:', selectedConversationId);
  const messagesResult = useMessages(selectedConversationId);
  console.log('Messages result:', messagesResult);
  
  const typingResult = useTypingPresence(selectedConversationId);

  // Safe destructuring
  const {
    conversations = [],
    loading: conversationsLoading = false,
    error: conversationsError = null,
    archiveConversation,
    unarchiveConversation,
    pinConversation,
    unpinConversation
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

  useEffect(() => {
    if (user) {
      handleContactParameter();
    }
  }, [user, location.search]);

  useEffect(() => {
    // On mobile, hide conversation list when a conversation is selected
    if (isMobile && selectedConversationId) {
      setShowConversationList(false);
    }
  }, [selectedConversationId, isMobile]);

  const handleContactParameter = async () => {
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
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    if (isMobile) {
      setShowConversationList(false);
    }
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
    } catch (error: any) {
      if (error.message?.includes('Cannot send more messages until recipient replies')) {
        toast({
          title: "Message non envoyé",
          description: "Vous devez attendre une réponse avant d'envoyer un autre message.",
          variant: "destructive",
        });
      } else if (error.message?.includes('blocked user')) {
        toast({
          title: "Message non envoyé",
          description: "Vous ne pouvez pas envoyer de message à cet utilisateur.",
          variant: "destructive",
        });
      } else if (error.message?.includes('exclusive manager')) {
        toast({
          title: "Message non envoyé",
          description: "Cet artiste ne peut être contacté que par son manager exclusif.",
          variant: "destructive",
        });
      } else {
        console.error('Send message error:', error.message);
        toast({
          title: "Erreur",
          description: `Impossible d'envoyer le message: ${error.message}`,
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
      <div className="container mx-auto px-6 py-8 text-center">
        <p>Connectez-vous pour accéder aux messages.</p>
      </div>
    );
  }

  console.log('Messages - User found:', user.id);

  if (conversationsLoading) {
    console.log('Messages - Loading conversations...');
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="animate-pulse">Chargement des conversations...</div>
      </div>
    );
  }

  // Show error state if there are hook errors
  if (conversationsError || messagesError) {
    console.log('Messages - Error:', conversationsError || messagesError);
    return (
      <div className="container mx-auto px-6 py-8 text-center">
        <p className="text-red-500">
          Erreur: {conversationsError || messagesError}
        </p>
      </div>
    );
  }

  console.log('Messages - Rendering main UI');

  const canSendMessage = selectedConversation && !selectedConversation.is_blocked;

  // Desktop layout (lg and above)
  if (!isMobile) {
    return (
      <div className="h-screen flex">
        {/* Left Sidebar - Conversations */}
        <div className="w-80 flex-shrink-0">
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            onArchiveConversation={archiveConversation || (() => {})}
            onUnarchiveConversation={unarchiveConversation || (() => {})}
            onPinConversation={pinConversation || (() => {})}
            onUnpinConversation={unpinConversation || (() => {})}
          />
        </div>

        {/* Center - Chat Window */}
        <div className={`flex-1 flex flex-col ${showInfo ? 'border-r' : ''}`}>
          <ChatHeader
            conversation={selectedConversation}
            typingUsers={typingUsers}
            onBack={handleBackToList}
            onOpenInfo={() => setShowInfo(!showInfo)}
            onBlockUser={handleBlockUser}
          />
          
          <MessageList messages={messages} loading={messagesLoading} />
          
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

        {/* Right Sidebar - Info Panel */}
        {showInfo && (
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
        )}
      </div>
    );
  }

  // Mobile layout
  return (
    <div className="h-screen flex flex-col">
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
        />
      ) : (
        <div className="flex flex-col h-full">
          <ChatHeader
            conversation={selectedConversation}
            typingUsers={typingUsers}
            onBack={handleBackToList}
            onOpenInfo={() => setShowInfo(true)}
            onBlockUser={handleBlockUser}
            showBackButton={true}
          />
          
          <MessageList messages={messages} loading={messagesLoading} />
          
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