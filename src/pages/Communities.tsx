import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Users, Radio, Trophy, Building, Star, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Community {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private' | 'invite_only';
  category: string;
  avatar_url: string | null;
  member_count: number;
  is_member: boolean;
  member_role?: string;
}

const Communities = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunities();
  }, [user]);

  const fetchCommunities = async () => {
    if (!user) return;

    try {
      // First, fetch all communities
      const { data: communitiesData, error: communitiesError } = await supabase
        .from('communities')
        .select(`
          id,
          name,
          description,
          type,
          category,
          avatar_url,
          member_count
        `)
        .eq('is_active', true)
        .order('member_count', { ascending: false });

      if (communitiesError) throw communitiesError;

      // Then, fetch user's memberships separately
      const { data: membershipsData, error: membershipsError } = await supabase
        .from('community_members')
        .select('community_id, role')
        .eq('user_id', user.id);

      if (membershipsError) throw membershipsError;

      // Create a map of memberships for quick lookup
      const membershipMap = new Map(
        membershipsData?.map(m => [m.community_id, m.role]) || []
      );

      const formattedCommunities: Community[] = communitiesData.map((community: any) => ({
        id: community.id,
        name: community.name,
        description: community.description,
        type: community.type,
        category: community.category,
        avatar_url: community.avatar_url,
        member_count: community.member_count,
        is_member: membershipMap.has(community.id),
        member_role: membershipMap.get(community.id)
      }));

      setCommunities(formattedCommunities);
    } catch (error) {
      console.error('Error fetching communities:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les communautés",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const joinCommunity = async (communityId: string) => {
    if (!user) return;

    try {
      // Get user's profile ID
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      const { error } = await supabase
        .from('community_members')
        .insert({
          community_id: communityId,
          user_id: user.id,
          profile_id: profileData.id
        });

      if (error) {
        // Handle unique constraint violation (user already member)
        if (error.code === '23505') {
          toast({
            title: "Information",
            description: "Vous êtes déjà membre de cette communauté",
          });
          return;
        }
        throw error;
      }

      await fetchCommunities();
      toast({
        title: "Succès",
        description: "Vous avez rejoint la communauté !",
      });
    } catch (error) {
      console.error('Error joining community:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rejoindre la communauté",
        variant: "destructive"
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'radio': return <Radio className="h-5 w-5" />;
      case 'genre': return <Trophy className="h-5 w-5" />;
      case 'professional': return <Building className="h-5 w-5" />;
      case 'venues': return <Building className="h-5 w-5" />;
      case 'influencers': return <Star className="h-5 w-5" />;
      default: return <Users className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'radio': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'genre': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'professional': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'venues': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'influencers': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des communautés...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Communautés Vybbi</h1>
        <p className="text-muted-foreground">
          Rejoignez des communautés passionnées et échangez avec d'autres artistes, agents et professionnels de l'industrie musicale.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communities.map((community) => (
          <Card key={community.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={community.avatar_url || undefined} />
                <AvatarFallback>
                  {getCategoryIcon(community.category)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{community.name}</h3>
                  {community.type !== 'public' && (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <Badge variant="secondary" className={getCategoryColor(community.category)}>
                  {community.category}
                </Badge>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {community.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{community.member_count} membres</span>
              </div>

              {community.is_member ? (
                <Button 
                  onClick={() => navigate(`/community/${community.id}`)}
                  variant="default"
                  size="sm"
                  className="gap-1"
                >
                  <MessageCircle className="h-4 w-4" />
                  Ouvrir
                </Button>
              ) : (
                <Button
                  onClick={() => joinCommunity(community.id)}
                  variant="outline"
                  size="sm"
                  disabled={community.type === 'invite_only'}
                >
                  {community.type === 'invite_only' ? 'Sur invitation' : 'Rejoindre'}
                </Button>
              )}
            </div>

            {community.is_member && community.member_role && (
              <div className="mt-3 pt-3 border-t">
                <Badge variant="outline" className="text-xs">
                  {community.member_role === 'owner' && 'Propriétaire'}
                  {community.member_role === 'admin' && 'Administrateur'}
                  {community.member_role === 'moderator' && 'Modérateur'}
                  {community.member_role === 'member' && 'Membre'}
                </Badge>
              </div>
            )}
          </Card>
        ))}
      </div>

      {communities.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune communauté disponible</h3>
          <p className="text-muted-foreground">
            Les communautés seront bientôt disponibles. Revenez plus tard !
          </p>
        </div>
      )}
    </div>
  );
};

export default Communities;