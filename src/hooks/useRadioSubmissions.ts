import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RadioSubmissionStatus {
  trackId: string;
  mediaAssetId: string;
  playlistId: string;
  playlistName: string;
  isApproved: boolean;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export const useRadioSubmissions = (profileId: string) => {
  const [submissions, setSubmissions] = useState<RadioSubmissionStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profileId) {
      fetchSubmissions();
    }
  }, [profileId]);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('radio_playlist_tracks')
        .select(`
          id,
          media_asset_id,
          playlist_id,
          is_approved,
          added_at,
          radio_playlists!inner(name),
          media_assets!inner(
            profiles!inner(id)
          )
        `)
        .eq('media_assets.profiles.id', profileId);

      if (error) throw error;

      const submissionMap: { [key: string]: RadioSubmissionStatus } = {};

      data?.forEach(item => {
        const key = item.media_asset_id;
        submissionMap[key] = {
          trackId: item.id,
          mediaAssetId: item.media_asset_id,
          playlistId: item.playlist_id,
          playlistName: item.radio_playlists.name,
          isApproved: item.is_approved,
          status: item.is_approved ? 'approved' : 'pending',
          submittedAt: item.added_at
        };
      });

      setSubmissions(Object.values(submissionMap));
    } catch (error) {
      console.error('Error fetching radio submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionStatus = (mediaAssetId: string): RadioSubmissionStatus | null => {
    return submissions.find(sub => sub.mediaAssetId === mediaAssetId) || null;
  };

  const hasAnySubmission = (mediaAssets: Array<{ id: string; media_type: string }>): RadioSubmissionStatus | null => {
    const audioAsset = mediaAssets.find(asset => asset.media_type === 'audio');
    if (!audioAsset) return null;
    return getSubmissionStatus(audioAsset.id);
  };

  const refreshSubmissions = () => {
    fetchSubmissions();
  };

  return {
    submissions,
    loading,
    getSubmissionStatus,
    hasAnySubmission,
    refreshSubmissions
  };
};