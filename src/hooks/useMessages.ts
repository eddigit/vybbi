import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface MessageWithSender {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
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

  const markAsRead = async () => {
    if (!conversationId || !user) return;

    const { error } = await supabase
      .from('message_receipts')
      .upsert({
        conversation_id: conversationId,
        user_id: user.id,
        last_read_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    fetchMessages();
    markAsRead();

    // Subscribe to real-time messages
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
        async (payload) => {
          // Fetch sender info for the new message
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
          
          // Mark as read if the user is viewing this conversation
          if (payload.new.sender_id !== user?.id) {
            markAsRead();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user]);

  return {
    messages,
    loading,
    error,
    refetch: fetchMessages,
    markAsRead
  };
}