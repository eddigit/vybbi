import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ConversationWithDetails {
  id: string;
  type: string;
  title: string | null;
  last_message_at: string | null;
  reply_received: boolean;
  peer_user_id: string | null;
  peer_display_name: string | null;
  peer_avatar_url: string | null;
  peer_profile_type: string | null;
  last_message_content: string | null;
  last_message_created_at: string | null;
  is_blocked: boolean;
  is_archived: boolean;
  is_pinned: boolean;
  unread_count: number;
}

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('useConversations - user:', user);

  const fetchConversations = async () => {
    if (!user) {
      console.log('useConversations - no user, skipping fetch');
      setLoading(false);
      return;
    }

    console.log('useConversations - fetching conversations...');
    try {
      setError(null);
      const { data, error: fetchError } = await supabase.rpc('get_conversations_with_details');

      console.log('useConversations - RPC result:', { data, fetchError });

      if (fetchError) {
        console.error('Error fetching conversations:', fetchError);
        setError(fetchError.message);
        return;
      }

      // Map the database response to our interface
      const mappedConversations: ConversationWithDetails[] = (data || []).map((conv: any) => ({
        id: conv.conversation_id,
        type: conv.conversation_type,
        title: conv.conversation_title,
        last_message_at: conv.last_message_at,
        reply_received: conv.reply_received,
        peer_user_id: conv.peer_user_id,
        peer_display_name: conv.peer_display_name,
        peer_avatar_url: conv.peer_avatar_url,
        peer_profile_type: conv.peer_profile_type,
        last_message_content: conv.last_message_content,
        last_message_created_at: conv.last_message_created_at,
        is_blocked: conv.is_blocked,
        is_archived: conv.is_archived,
        is_pinned: conv.is_pinned,
        unread_count: conv.unread_count || 0
      }));

      setConversations(mappedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  const archiveConversation = async (conversationId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('conversation_archives')
      .insert({ user_id: user.id, conversation_id: conversationId });

    if (!error) {
      await fetchConversations();
    }
  };

  const unarchiveConversation = async (conversationId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('conversation_archives')
      .delete()
      .eq('user_id', user.id)
      .eq('conversation_id', conversationId);

    if (!error) {
      await fetchConversations();
    }
  };

  const pinConversation = async (conversationId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('conversation_pins')
      .insert({ user_id: user.id, conversation_id: conversationId });

    if (!error) {
      await fetchConversations();
    }
  };

  const unpinConversation = async (conversationId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('conversation_pins')
      .delete()
      .eq('user_id', user.id)
      .eq('conversation_id', conversationId);

    if (!error) {
      await fetchConversations();
    }
  };

  useEffect(() => {
    fetchConversations();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('conversations-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, fetchConversations)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversation_archives' }, fetchConversations)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversation_pins' }, fetchConversations)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchConversations)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    conversations,
    loading,
    error,
    refetch: fetchConversations,
    archiveConversation,
    unarchiveConversation,
    pinConversation,
    unpinConversation
  };
}