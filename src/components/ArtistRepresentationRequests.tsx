import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, X, Clock } from "lucide-react";
import { Profile } from "@/lib/types";

interface RepresentationRequest {
  id: string;
  requester_profile: Profile;
  requester_type: 'agent' | 'manager';
  requested_at: string;
  representation_status: 'pending' | 'accepted' | 'rejected' | 'revoked';
}

export function ArtistRepresentationRequests() {
  const { user, profile } = useAuth();
  const [agentRequests, setAgentRequests] = useState<RepresentationRequest[]>([]);
  const [managerRequests, setManagerRequests] = useState<RepresentationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile && profile.profile_type === 'artist') {
      fetchRequests();
    }
  }, [user, profile]);

  const fetchRequests = async () => {
    try {
      // Fetch agent requests
      const { data: agentData, error: agentError } = await supabase
        .from('agent_artists')
        .select(`
          id,
          representation_status,
          requested_at,
          agent_profile_id
        `)
        .eq('artist_profile_id', profile?.id)
        .eq('representation_status', 'pending');

      if (agentError) throw agentError;

      // Fetch manager requests
      const { data: managerData, error: managerError } = await supabase
        .from('manager_artists')
        .select(`
          id,
          representation_status,
          requested_at,
          manager_profile_id
        `)
        .eq('artist_profile_id', profile?.id)
        .eq('representation_status', 'pending');

      if (managerError) throw managerError;

      // Fetch agent profiles
      if (agentData && agentData.length > 0) {
        const agentIds = agentData.map(req => req.agent_profile_id);
        const { data: agentProfiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', agentIds);

        const agentRequestsWithProfiles = agentData.map(req => ({
          id: req.id,
          requester_profile: agentProfiles?.find(p => p.id === req.agent_profile_id) as Profile,
          requester_type: 'agent' as const,
          requested_at: req.requested_at,
          representation_status: req.representation_status
        }));
        
        setAgentRequests(agentRequestsWithProfiles);
      }

      // Fetch manager profiles
      if (managerData && managerData.length > 0) {
        const managerIds = managerData.map(req => req.manager_profile_id);
        const { data: managerProfiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', managerIds);

        const managerRequestsWithProfiles = managerData.map(req => ({
          id: req.id,
          requester_profile: managerProfiles?.find(p => p.id === req.manager_profile_id) as Profile,
          requester_type: 'manager' as const,
          requested_at: req.requested_at,
          representation_status: req.representation_status
        }));
        
        setManagerRequests(managerRequestsWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId: string, status: 'accepted' | 'rejected', type: 'agent' | 'manager') => {
    try {
      const table = type === 'agent' ? 'agent_artists' : 'manager_artists';
      
      const { error } = await supabase
        .from(table)
        .update({
          representation_status: status,
          responded_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success(status === 'accepted' ? 'Request accepted' : 'Request rejected');
      fetchRequests();
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    }
  };

  if (!user || !profile || profile.profile_type !== 'artist') {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading requests...</div>
        </CardContent>
      </Card>
    );
  }

  const totalRequests = agentRequests.length + managerRequests.length;

  if (totalRequests === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Representation Requests ({totalRequests})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {agentRequests.map((request) => (
          <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={request.requester_profile?.avatar_url} />
                <AvatarFallback>
                  {request.requester_profile?.display_name?.charAt(0)?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium">{request.requester_profile?.display_name}</h4>
                <p className="text-sm text-muted-foreground">
                  Wants to represent you as an agent
                </p>
                <Badge variant="outline" className="mt-1">
                  Agent
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleRequest(request.id, 'accepted', 'agent')}
              >
                <Check className="w-4 h-4" />
                Accept
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRequest(request.id, 'rejected', 'agent')}
              >
                <X className="w-4 h-4" />
                Reject
              </Button>
            </div>
          </div>
        ))}

        {managerRequests.map((request) => (
          <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg bg-purple-50">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={request.requester_profile?.avatar_url} />
                <AvatarFallback>
                  {request.requester_profile?.display_name?.charAt(0)?.toUpperCase() || 'M'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium">{request.requester_profile?.display_name}</h4>
                <p className="text-sm text-muted-foreground">
                  Wants to manage your career
                </p>
                <Badge variant="outline" className="mt-1">
                  Manager
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleRequest(request.id, 'accepted', 'manager')}
              >
                <Check className="w-4 h-4" />
                Accept
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRequest(request.id, 'rejected', 'manager')}
              >
                <X className="w-4 h-4" />
                Reject
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}