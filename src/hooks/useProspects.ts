import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SupabaseProspect {
  id: string;
  prospect_type: string;
  company_name?: string;
  contact_name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  website?: string;
  social_media?: any;
  status: string;
  qualification_score?: number;
  notes?: string;
  source?: string;
  assigned_agent_id?: string;
  assigned_at?: string;
  last_contact_at?: string;
  next_follow_up_at?: string;
  converted_user_id?: string;
  converted_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  instagram_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  tiktok_url?: string;
  youtube_url?: string;
  facebook_url?: string;
  tags?: string[];
  priority_level?: string;
  industry_sector?: string;
  company_size?: string;
  estimated_budget?: number;
  influence_score?: number;
  whatsapp_number?: string;
  region?: string;
  country?: string;
  timezone?: string;
  referral_source?: string;
  referral_prospect_id?: string;
  collaboration_potential?: string;
  last_engagement_score?: number;
  engagement_history?: any;
  auto_scoring_enabled?: boolean;
}

export interface ProspectFilters {
  status?: string[];
  prospect_type?: string[];
  assigned_agent_id?: string;
  priority_level?: string[];
  tags?: string[];
}

export interface ProspectStats {
  totalProspects: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  avgQualificationScore: number;
  avgInfluenceScore: number;
  totalEstimatedBudget: number;
}

export function useProspects(filters?: ProspectFilters) {
  const [prospects, setProspects] = useState<SupabaseProspect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadProspects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('prospects')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters with any casting to avoid strict typing issues
      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status as any);
      }
      
      if (filters?.prospect_type && filters.prospect_type.length > 0) {
        query = query.in('prospect_type', filters.prospect_type as any);
      }
      
      if (filters?.assigned_agent_id) {
        query = query.eq('assigned_agent_id', filters.assigned_agent_id);
      }
      
      if (filters?.priority_level && filters.priority_level.length > 0) {
        query = query.in('priority_level', filters.priority_level);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      
      setProspects(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: `Impossible de charger les prospects: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProspectStatus = async (prospectId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('prospects')
        .update({ 
        status: newStatus as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', prospectId);

      if (error) throw error;

      // Update local state
      setProspects(prev => 
        prev.map(p => 
          p.id === prospectId 
            ? { ...p, status: newStatus, updated_at: new Date().toISOString() }
            : p
        )
      );

      toast({
        title: "Succès",
        description: "Statut du prospect mis à jour",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour le statut: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const createProspect = async (prospectData: Partial<SupabaseProspect>) => {
    try {
      // Ensure required fields are present
      const newProspect = {
        contact_name: prospectData.contact_name || 'Nouveau prospect',
        prospect_type: prospectData.prospect_type || 'artist',
        status: prospectData.status || 'new',
        ...prospectData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('prospects')
        .insert(newProspect as any)
        .select()
        .single();

      if (error) throw error;

      setProspects(prev => [data, ...prev]);
      
      toast({
        title: "Succès",
        description: "Nouveau prospect créé",
      });
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      toast({
        title: "Erreur",
        description: `Impossible de créer le prospect: ${errorMessage}`,
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    loadProspects();
  }, [filters]);

  return {
    prospects,
    loading,
    error,
    refetch: loadProspects,
    updateProspectStatus,
    createProspect
  };
}

export function useProspectStats() {
  const [stats, setStats] = useState<ProspectStats>({
    totalProspects: 0,
    byStatus: {},
    byType: {},
    avgQualificationScore: 0,
    avgInfluenceScore: 0,
    totalEstimatedBudget: 0
  });
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      const { data: prospects, error } = await supabase
        .from('prospects')
        .select('status, prospect_type, qualification_score, influence_score, estimated_budget');

      if (error) throw error;

      if (prospects) {
        const byStatus: Record<string, number> = {};
        const byType: Record<string, number> = {};
        let totalQualificationScore = 0;
        let totalInfluenceScore = 0;
        let totalBudget = 0;
        let qualificationCount = 0;
        let influenceCount = 0;
        let budgetCount = 0;

        prospects.forEach(prospect => {
          // Count by status
          byStatus[prospect.status] = (byStatus[prospect.status] || 0) + 1;
          
          // Count by type
          byType[prospect.prospect_type] = (byType[prospect.prospect_type] || 0) + 1;
          
          // Average scores and budget
          if (prospect.qualification_score) {
            totalQualificationScore += prospect.qualification_score;
            qualificationCount++;
          }
          
          if (prospect.influence_score) {
            totalInfluenceScore += prospect.influence_score;
            influenceCount++;
          }
          
          if (prospect.estimated_budget) {
            totalBudget += prospect.estimated_budget;
            budgetCount++;
          }
        });

        setStats({
          totalProspects: prospects.length,
          byStatus,
          byType,
          avgQualificationScore: qualificationCount > 0 ? totalQualificationScore / qualificationCount : 0,
          avgInfluenceScore: influenceCount > 0 ? totalInfluenceScore / influenceCount : 0,
          totalEstimatedBudget: totalBudget
        });
      }
    } catch (err) {
      console.error('Error loading prospect stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return { stats, loading, refetch: loadStats };
}

export function useHotProspects() {
  const [hotProspects, setHotProspects] = useState<SupabaseProspect[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHotProspects = async () => {
    try {
      setLoading(true);
      
      const { data: prospects, error } = await supabase
        .from('prospects')
        .select('*')
        .gte('qualification_score', 70)
        .or('priority_level.eq.high,priority_level.eq.critical')
        .order('last_engagement_score', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      setHotProspects(prospects || []);
    } catch (err) {
      console.error('Error loading hot prospects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHotProspects();
  }, []);

  return { hotProspects, loading, refetch: loadHotProspects };
}