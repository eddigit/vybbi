import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Handshake, MessageSquare, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

interface Partner {
  id: string;
  partner_profile_id: string;
  partnership_type: string;
  is_visible: boolean;
  allow_direct_contact: boolean;
  description: string | null;
  partner: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    bio: string | null;
    city: string | null;
    profile_type: string;
    user_id: string;
  };
}

interface VenuePartnersProps {
  venueProfileId: string;
}

export function VenuePartners({ venueProfileId }: VenuePartnersProps) {
  const { user } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
  }, [venueProfileId]);

  const fetchPartners = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('venue_partners')
        .select(`
          *,
          partner:partner_profile_id (
            id,
            display_name,
            avatar_url,
            bio,
            city,
            profile_type,
            user_id
          )
        `)
        .eq('venue_profile_id', venueProfileId)
        .eq('is_visible', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPartners((data as any) || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPartnershipTypeLabel = (type: string) => {
    const types = {
      'agent': 'Agent',
      'manager': 'Manager',
      'booker': 'Booker',
      'tournee': 'Tourneur'
    };
    return types[type as keyof typeof types] || type;
  };

  const getPartnershipTypeColor = (type: string) => {
    const colors = {
      'agent': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'manager': 'bg-green-500/10 text-green-500 border-green-500/20',
      'booker': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      'tournee': 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Handshake className="h-5 w-5" />
            Nos partenaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-24 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (partners.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Handshake className="h-5 w-5" />
            Nos partenaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun partenaire référencé pour le moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Handshake className="h-5 w-5" />
          Nos partenaires
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {partners.map((partnership) => (
          <div key={partnership.id} className="flex items-start gap-3 p-3 border rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={partnership.partner.avatar_url || ''} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary-foreground text-white">
                {partnership.partner.display_name ? 
                  partnership.partner.display_name.charAt(0).toUpperCase() : 
                  <User className="h-6 w-6" />
                }
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm truncate">
                  {partnership.partner.display_name}
                </h4>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getPartnershipTypeColor(partnership.partnership_type)}`}
                >
                  {getPartnershipTypeLabel(partnership.partnership_type)}
                </Badge>
              </div>
              
              {partnership.partner.city && (
                <p className="text-xs text-muted-foreground mb-2">
                  {partnership.partner.city}
                </p>
              )}
              
              {partnership.description && (
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {partnership.description}
                </p>
              )}
              
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                  <Link to={`/profiles/${partnership.partner.id}`}>
                    Voir le profil
                  </Link>
                </Button>
                
                {partnership.allow_direct_contact && user && (
                  <Button asChild size="sm" className="h-7 text-xs">
                    <Link 
                      to={`/messages?contact=${partnership.partner.user_id}`}
                      className="flex items-center gap-1"
                    >
                      <MessageSquare className="h-3 w-3" />
                      Contacter
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}