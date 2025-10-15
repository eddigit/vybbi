import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BlockchainCertification {
  id: string;
  music_release_id: string;
  transaction_hash: string;
  blockchain_network: string;
  certification_hash: string;
  solana_signature?: string;
  block_number?: number;
  certification_data: any;
  qr_code_url?: string;
  certificate_url?: string;
  status: 'pending' | 'confirmed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface CertificationMetadata {
  title: string;
  artist: string;
  isrc: string;
  releaseDate: string;
  collaborators: Array<{
    name: string;
    role: string;
    royaltyPercentage: number;
  }>;
  audioHash?: string;
}

export const useBlockchainCertification = (musicReleaseId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing certification for a music release
  const { data: certification, isLoading } = useQuery({
    queryKey: ['blockchain-certification', musicReleaseId],
    queryFn: async () => {
      if (!musicReleaseId) return null;
      
      const { data, error } = await supabase
        .from('blockchain_certifications')
        .select('*')
        .eq('music_release_id', musicReleaseId)
        .maybeSingle();

      if (error) throw error;
      return data as BlockchainCertification | null;
    },
    enabled: !!musicReleaseId,
  });

  // Create blockchain certification
  const createCertification = useMutation({
    mutationFn: async ({ musicReleaseId, metadata }: { musicReleaseId: string; metadata: CertificationMetadata }) => {
      const { data, error } = await supabase.functions.invoke('blockchain-certify', {
        body: { musicReleaseId, metadata },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      return data.certification;
    },
    onSuccess: (data) => {
      toast({
        title: "Certification réussie",
        description: "Votre œuvre musicale a été certifiée sur la blockchain Solana avec succès.",
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ['blockchain-certification'] 
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur de certification",
        description: error.message || "Impossible de certifier l'œuvre sur la blockchain.",
        variant: "destructive",
      });
    },
  });

  return {
    certification,
    isLoading,
    createCertification: createCertification.mutate,
    isCreating: createCertification.isPending,
    isCertified: !!certification && certification.status === 'confirmed',
  };
};

// Hook for fetching all certifications for a profile
export const useProfileCertifications = (profileId?: string) => {
  return useQuery({
    queryKey: ['profile-certifications', profileId],
    queryFn: async () => {
      if (!profileId) return [];

      const { data, error } = await supabase
        .from('blockchain_certifications')
        .select(`
          *,
          music_releases!inner (
            id,
            title,
            artist_name,
            profile_id
          )
        `)
        .eq('music_releases.profile_id', profileId)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (BlockchainCertification & { music_releases: any })[];
    },
    enabled: !!profileId,
  });
};