import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  profile_id: string;
  comment_text: string;
  created_at: string;
  author_display_name: string;
  author_avatar_url?: string;
  author_profile_type: string;
}

export function usePostComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    if (!postId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('post_interactions')
        .select(`
          id,
          post_id,
          user_id,
          profile_id,
          comment_text,
          created_at,
          profiles!inner(display_name, avatar_url, profile_type)
        `)
        .eq('post_id', postId)
        .eq('interaction_type', 'comment')
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      const formattedComments: Comment[] = (data || []).map((item: any) => ({
        id: item.id,
        post_id: item.post_id,
        user_id: item.user_id,
        profile_id: item.profile_id,
        comment_text: item.comment_text,
        created_at: item.created_at,
        author_display_name: item.profiles.display_name,
        author_avatar_url: item.profiles.avatar_url,
        author_profile_type: item.profiles.profile_type
      }));

      setComments(formattedComments);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Erreur lors du chargement des commentaires');
    } finally {
      setLoading(false);
    }
  };

  const refreshComments = () => {
    fetchComments();
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  return {
    comments,
    loading,
    error,
    refreshComments
  };
}