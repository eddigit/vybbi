import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface RadioRequest {
  id: string;
  user_id: string;
  media_asset_id: string;
  music_release_id?: string;
  status: 'pending' | 'queued' | 'playing' | 'played' | 'rejected';
  priority: number;
  requested_at: string;
  queued_at?: string;
  played_at?: string;
  message?: string;
  votes_count: number;
  created_at: string;
  updated_at: string;
  // Joined data
  file_url?: string;
  file_name?: string;
  artist_name?: string;
  artist_avatar?: string;
  artist_profile_id?: string;
  requester_name?: string;
  music_release?: {
    title: string;
    cover_image_url?: string;
  };
}

export interface RadioQueue {
  queue_id: string;
  request_id?: string;
  media_asset_id: string;
  position: number;
  estimated_play_time?: string;
  is_priority: boolean;
  file_url: string;
  file_name: string;
  artist_name: string;
  artist_avatar?: string;
  artist_profile_id: string;
  requester_name?: string;
  votes_count: number;
  message?: string;
}

export const useRadioRequests = () => {
  const [requests, setRequests] = useState<RadioRequest[]>([]);
  const [queue, setQueue] = useState<RadioQueue[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch user's requests
  const fetchUserRequests = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('radio_requests')
        .select(`
          *,
          media_assets!inner(
            file_url,
            file_name,
            profiles!inner(
              display_name,
              avatar_url,
              id
            )
          ),
          music_releases(
            title,
            cover_image_url
          )
        `)
        .eq('user_id', user.id)
        .order('requested_at', { ascending: false });

      if (error) throw error;

      const formattedRequests: RadioRequest[] = (data || []).map(req => ({
        ...req,
        file_url: req.media_assets.file_url,
        file_name: req.media_assets.file_name,
        artist_name: req.media_assets.profiles.display_name,
        artist_avatar: req.media_assets.profiles.avatar_url,
        artist_profile_id: req.media_assets.profiles.id,
        music_release: req.music_releases
      }));

      setRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching user requests:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos demandes",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  // Fetch current queue
  const fetchQueue = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_radio_queue');

      if (error) throw error;
      setQueue(data || []);
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
  }, []);

  // Submit a music request
  const submitRequest = useCallback(async (
    mediaAssetId: string,
    musicReleaseId?: string,
    message?: string,
    priority: number = 1
  ) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour faire une demande",
        variant: "destructive"
      });
      return false;
    }

    setSubmitting(true);

    try {
      // Check if user already has a pending request for this track
      const { data: existing } = await supabase
        .from('radio_requests')
        .select('id')
        .eq('user_id', user.id)
        .eq('media_asset_id', mediaAssetId)
        .in('status', ['pending', 'queued'])
        .single();

      if (existing) {
        toast({
          title: "Demande déjà soumise",
          description: "Vous avez déjà une demande en cours pour ce morceau",
          variant: "default"
        });
        return false;
      }

      const { error } = await supabase
        .from('radio_requests')
        .insert({
          user_id: user.id,
          media_asset_id: mediaAssetId,
          music_release_id: musicReleaseId,
          message,
          priority
        });

      if (error) throw error;

      toast({
        title: "Demande soumise !",
        description: "Votre demande a été ajoutée à la file d'attente",
        variant: "default"
      });

      // Refresh data
      fetchUserRequests();
      fetchQueue();
      return true;
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Erreur",
        description: "Impossible de soumettre votre demande",
        variant: "destructive"
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [user, toast, fetchUserRequests, fetchQueue]);

  // Vote for a request
  const voteForRequest = useCallback(async (
    requestId: string,
    voteType: 'up' | 'down'
  ) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour voter",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('radio_request_votes')
        .select('id, vote_type')
        .eq('request_id', requestId)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote if same type
          await supabase
            .from('radio_request_votes')
            .delete()
            .eq('id', existingVote.id);
        } else {
          // Update vote type
          await supabase
            .from('radio_request_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);
        }
      } else {
        // Create new vote
        await supabase
          .from('radio_request_votes')
          .insert({
            request_id: requestId,
            user_id: user.id,
            vote_type: voteType
          });
      }

      // Refresh queue to show updated votes
      fetchQueue();
      return true;
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre vote",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast, fetchQueue]);

  // Cancel a request
  const cancelRequest = useCallback(async (requestId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('radio_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Demande annulée",
        description: "Votre demande a été annulée",
        variant: "default"
      });

      fetchUserRequests();
      fetchQueue();
      return true;
    } catch (error) {
      console.error('Error canceling request:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'annuler votre demande",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast, fetchUserRequests, fetchQueue]);

  // Get user's vote for a request
  const getUserVote = useCallback(async (requestId: string) => {
    if (!user) return null;

    try {
      const { data } = await supabase
        .from('radio_request_votes')
        .select('vote_type')
        .eq('request_id', requestId)
        .eq('user_id', user.id)
        .single();

      return data?.vote_type || null;
    } catch (error) {
      return null;
    }
  }, [user]);

  // Real-time subscriptions
  useEffect(() => {
    // Subscribe to queue changes
    const queueSubscription = supabase
      .channel('radio_queue_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'radio_queue' },
        () => fetchQueue()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'radio_requests' },
        () => {
          fetchQueue();
          if (user) fetchUserRequests();
        }
      )
      .subscribe();

    return () => {
      queueSubscription.unsubscribe();
    };
  }, [fetchQueue, fetchUserRequests, user]);

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchQueue(),
        user ? fetchUserRequests() : Promise.resolve()
      ]);
      setLoading(false);
    };

    loadData();
  }, [fetchQueue, fetchUserRequests, user]);

  return {
    requests,
    queue,
    loading,
    submitting,
    submitRequest,
    voteForRequest,
    cancelRequest,
    getUserVote,
    refreshData: () => {
      fetchQueue();
      if (user) fetchUserRequests();
    }
  };
};