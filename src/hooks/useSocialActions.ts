import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CreatePostData, CreateServiceRequestData } from "@/types/social";

export function useSocialActions() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const createPost = async (postData: CreatePostData) => {
    if (!user || !profile) throw new Error("User not authenticated");

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('social_posts')
        .insert({
          user_id: user.id,
          profile_id: profile.id,
          content: postData.content,
          post_type: postData.post_type,
          visibility: postData.visibility,
          related_id: postData.related_id
        })
        .select()
        .single();

      if (error) throw error;

      // TODO: Handle media file uploads if provided
      if (postData.media_files && postData.media_files.length > 0) {
        // Upload files and create post_media records
        console.log('Media files to upload:', postData.media_files);
      }

      return data;
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user || !profile) throw new Error("User not authenticated");

    try {
      // Check if user already liked this post
      const { data: existingLike, error: checkError } = await supabase
        .from('post_interactions')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .eq('interaction_type', 'like')
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingLike) {
        // Remove like
        const { error: deleteError } = await supabase
          .from('post_interactions')
          .delete()
          .eq('id', existingLike.id);

        if (deleteError) throw deleteError;
      } else {
        // Add like
        const { error: insertError } = await supabase
          .from('post_interactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            profile_id: profile.id,
            interaction_type: 'like'
          });

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  };

  const addComment = async (postId: string, commentText: string) => {
    if (!user || !profile) throw new Error("User not authenticated");

    try {
      const { data, error } = await supabase
        .from('post_interactions')
        .insert({
          post_id: postId,
          user_id: user.id,
          profile_id: profile.id,
          interaction_type: 'comment',
          comment_text: commentText
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  const followUser = async (targetUserId: string, targetProfileId: string) => {
    if (!user || !profile) throw new Error("User not authenticated");

    try {
      const { data, error } = await supabase
        .from('user_follows')
        .insert({
          follower_user_id: user.id,
          follower_profile_id: profile.id,
          followed_user_id: targetUserId,
          followed_profile_id: targetProfileId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  };

  const unfollowUser = async (targetUserId: string) => {
    if (!user) throw new Error("User not authenticated");

    try {
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_user_id', user.id)
        .eq('followed_user_id', targetUserId);

      if (error) throw error;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  };

  const createServiceRequest = async (serviceData: CreateServiceRequestData) => {
    if (!user || !profile) throw new Error("User not authenticated");

    setLoading(true);
    try {
      // Créer l'annonce dans la table annonces 
      const { data: serviceRequest, error: serviceError } = await supabase
        .from('annonces')
        .insert([{
          title: `${serviceData.request_type === 'offer' ? 'OFFRE' : 'DEMANDE'} - ${serviceData.service_category}`,
          description: serviceData.description,
          requirements: serviceData.requirements,
          location: serviceData.location,
          budget_min: serviceData.budget_min,
          budget_max: serviceData.budget_max,
          event_date: serviceData.event_date,
          deadline: serviceData.deadline,
          profile_types: serviceData.profile_types,
          status: 'published',
          user_id: user.id
        }])
        .select()
        .single();

      if (serviceError) throw serviceError;

      // Créer aussi un post social lié
      const { data: post, error: postError } = await supabase
        .from('social_posts')
        .insert({
          user_id: user.id,
          profile_id: profile.id,
          content: serviceData.description,
          post_type: 'service_request',
          visibility: 'public',
          related_id: serviceRequest.id
        })
        .select()
        .single();

      if (postError) throw postError;

      return { serviceRequest, post };
    } finally {
      setLoading(false);
    }
  };

  return {
    createPost,
    createServiceRequest,
    toggleLike,
    addComment,
    followUser,
    unfollowUser,
    loading
  };
}