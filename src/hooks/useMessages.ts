import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
}

export interface MessageWithSender {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  attachments?: MessageAttachment[];
  sender?: {
    display_name: string;
    avatar_url: string | null;
  };
}

export function useMessages(conversationId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('useMessages - conversationId:', conversationId, 'user:', user);

  const fetchMessages = async () => {
    if (!conversationId) return;

    setLoading(true);
    try {
      setError(null);
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (data) {
        // Fetch attachments for all messages
        const messageIds = data.map(m => m.id);
        let attachments: MessageAttachment[] = [];
        
        if (messageIds.length > 0) {
          const { data: attachmentsData } = await supabase
            .from('message_attachments')
            .select('*')
            .in('message_id', messageIds);
          
          attachments = attachmentsData || [];
        }

        // Group attachments by message_id
        const attachmentsByMessage = attachments.reduce((acc, attachment: any) => {
          if (!acc[attachment.message_id]) {
            acc[attachment.message_id] = [];
          }
          acc[attachment.message_id].push(attachment);
          return acc;
        }, {} as Record<string, MessageAttachment[]>);

        // Fetch sender details separately to avoid relation issues
        const messagesWithSenders = await Promise.all(
          data.map(async (message) => {
            const { data: senderData } = await supabase
              .from('profiles')
              .select('display_name, avatar_url')
              .eq('user_id', message.sender_id)
              .maybeSingle();

            return {
              ...message,
              attachments: attachmentsByMessage[message.id] || [],
              sender: senderData || { display_name: 'Utilisateur inconnu', avatar_url: null }
            };
          })
        );

        setMessages(messagesWithSenders);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, attachments?: File[]) => {
    if (!conversationId || (!content.trim() && (!attachments || attachments.length === 0))) return;

    try {
      if (!user) throw new Error('User not authenticated');

      // Insert the message first
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: conversationId,
            sender_id: user.id,
            content: content || '' // Allow empty content if there are attachments
          }
        ])
        .select()
        .maybeSingle();

      if (messageError) throw messageError;

      // Handle file attachments if any
      let uploadedAttachments: MessageAttachment[] = [];
      if (attachments && attachments.length > 0) {
        const uploadPromises = attachments.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          
          // Upload file to storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('message-attachments')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          // Insert attachment record
          const { data: attachmentData, error: attachmentError } = await supabase
            .from('message_attachments')
            .insert([
              {
                message_id: messageData.id,
                file_name: file.name,
                file_url: fileName, // Store the storage path, not the full URL
                file_type: file.type,
                file_size: file.size
              }
            ])
            .select()
            .maybeSingle();

          if (attachmentError) throw attachmentError;

          return attachmentData;
        });

        uploadedAttachments = await Promise.all(uploadPromises);
      }

      // Don't add to local state here, let the real-time subscription handle it
      // Just refetch to ensure consistency
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const markAsRead = async (onSuccess?: () => void) => {
    if (!conversationId || !user) return;

    console.log('📬 [markAsRead] Marking conversation as read:', conversationId);

    const { error } = await supabase
      .from('message_receipts')
      .upsert({
        conversation_id: conversationId,
        user_id: user.id,
        last_read_at: new Date().toISOString()
      }, {
        onConflict: 'conversation_id,user_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('❌ [markAsRead] Error marking messages as read:', error);
    } else {
      console.log('✅ [markAsRead] Successfully marked as read, triggering callback');
      // Trigger callback if provided to refresh conversations
      onSuccess?.();
    }
  };

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    fetchMessages();
    
    // Mark as read immediately when opening conversation
    markAsRead();

    // Subscribe to real-time messages avec optimisations
    const channel = supabase
      .channel(`messages-realtime-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          console.log('💬 [useMessages] New message received in real-time:', payload);
          
          // Optimistic update immédiat pour la réactivité
          const newMessage = payload.new as any;
          
          // Fetch sender info for the new message
          const { data: senderData } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('user_id', newMessage.sender_id)
            .maybeSingle();

          // Fetch attachments for the new message
          const { data: attachmentsData } = await supabase
            .from('message_attachments')
            .select('*')
            .eq('message_id', newMessage.id);

          const messageWithSender: MessageWithSender = {
            ...newMessage,
            attachments: attachmentsData || [],
            sender: senderData || { display_name: 'Utilisateur inconnu', avatar_url: null }
          };

          setMessages(prev => {
            // Prevent duplicates by checking if message already exists
            const exists = prev.some(msg => msg.id === messageWithSender.id);
            if (exists) {
              console.log('💬 [useMessages] Message already exists, skipping:', messageWithSender.id);
              return prev;
            }
            console.log('💬 [useMessages] Adding new message:', messageWithSender.content.substring(0, 50) + '...');
            return [...prev, messageWithSender];
          });
          
          // Mark as read if the user is viewing this conversation and it's not their own message
          if (newMessage.sender_id !== user?.id) {
            console.log('💬 [useMessages] Marking conversation as read for incoming message');
            markAsRead();
          }
        }
      )
      .subscribe((status) => {
        console.log('💬 [useMessages] Subscription status for conversation', conversationId, ':', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user]);

  return {
    messages,
    loading,
    error,
    refetch: fetchMessages,
    markAsRead,
    sendMessage
  };
}