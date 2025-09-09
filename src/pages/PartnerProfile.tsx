import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, ExternalLink, MessageSquare, Star, Users, Briefcase, Mail, Phone } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';

export default function PartnerProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [partner, setPartner] = useState<Profile | null>(null);
  const [artists, setArtists] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPartnerData();
    }
  }, [id]);

  const fetchPartnerData = async () => {
    try {
      // Fetch partner profile
      const { data: partnerData, error: partnerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .in('profile_type', ['agent', 'manager'])
        .single();

      if (partnerError || !partnerData) {
        console.error('Partner not found:', partnerError);
        return;
      }

      setPartner(partnerData);

      // Fetch associated artists
      let artistsData: Profile[] = [];
      if (partnerData.profile_type === 'agent') {
        const { data: agentArtists } = await supabase
          .from('agent_artists')
          .select('artist_profile_id')
          .eq('agent_profile_id', id);

        if (agentArtists && agentArtists.length > 0) {
          const artistIds = agentArtists.map(aa => aa.artist_profile_id);
          const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .in('id', artistIds)
            .eq('is_public', true);
          artistsData = profiles || [];
        }
      } else if (partnerData.profile_type === 'manager') {
        const { data: managerArtists } = await supabase
          .from('manager_artists')
          .select('artist_profile_id')
          .eq('manager_profile_id', id);

        if (managerArtists && managerArtists.length > 0) {
          const artistIds = managerArtists.map(ma => ma.artist_profile_id);
          const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .in('id', artistIds)
            .eq('is_public', true);
          artistsData = profiles || [];
        }
      }

      setArtists(artistsData);
    } catch (error) {
      console.error('Error fetching partner data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="container mx-auto px-6 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Partenaire non trouvé</h1>
        <p className="text-muted-foreground mb-8">Le profil que vous recherchez n'existe pas ou n'est pas accessible.</p>
        <Button asChild>
          <Link to="/profiles">Retour à l'annuaire</Link>
        </Button>
      </div>
    );
  }

  const partnerType = partner.profile_type === 'agent' ? 'Agent' : 'Manager';
  const partnerIcon = partner.profile_type === 'agent' ? <Users className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />;

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header Section */}
      <div className="relative mb-8">
        {(partner as any).header_url && (
          <div 
            className="w-full h-64 bg-cover bg-center rounded-lg mb-6"
            style={{ 
              backgroundImage: `url(${(partner as any).header_url})`,
              backgroundPosition: `center ${(partner as any).header_position_y || 50}%`
            }}
          />
        )}
        
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
            <AvatarImage src={partner.avatar_url || undefined} />
            <AvatarFallback className="text-2xl bg-gradient-primary text-white">
              {partner.display_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">{partner.display_name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                    {partnerIcon}
                    <span className="ml-1">{partnerType}</span>
                  </Badge>
                  {partner.location && (
                    <Badge variant="outline">
                      <MapPin className="w-3 h-3 mr-1" />
                      {partner.location}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                {user ? (
                  user.id !== partner.user_id && (
                    <Button asChild>
                      <Link to={`/messages?partner=${partner.id}`}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Contacter
                      </Link>
                    </Button>
                  )
                ) : (
                  <Button asChild>
                    <Link to="/auth">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Créer un compte pour contacter
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio & Info */}
          {partner.bio && (
            <Card>
              <CardHeader>
                <CardTitle>À propos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{partner.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Artists Roster */}
          {artists.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  {partner.profile_type === 'agent' ? 'Artistes représentés' : 'Artistes managés'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {artists.map((artist) => (
                    <div key={artist.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={artist.avatar_url || undefined} />
                          <AvatarFallback>
                            {artist.display_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{artist.display_name}</h4>
                          {artist.location && (
                            <p className="text-sm text-muted-foreground">{artist.location}</p>
                          )}
                          {artist.genres && artist.genres.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {artist.genres.slice(0, 2).map((genre) => (
                                <Badge key={genre} variant="secondary" className="text-xs">
                                  {genre}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/artists/${artist.id}`}>Voir</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Contact & Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contact Methods */}
              <div className="space-y-4">
                {/* Email Contact */}
                {partner.email && (
                  <div className="group border border-border/50 rounded-xl p-4 transition-all duration-200 hover:border-border hover:shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate text-sm">{partner.email}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Adresse email</p>
                          </div>
                          <div className="flex flex-col xs:flex-row gap-2 flex-shrink-0">
                            <Button size="sm" className="text-xs font-medium" asChild>
                              {user ? (
                                <Link to={`/messages?partner=${partner.id}`}>
                                  <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                                  Message
                                </Link>
                              ) : (
                                <Link to="/auth">
                                  <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                                  Créer un compte
                                </Link>
                              )}
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs" asChild>
                              <a href={`mailto:${partner.email}`}>
                                <Mail className="w-3.5 h-3.5 mr-1.5" />
                                Email
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Phone Contact */}
                {partner.phone && (
                  <div className="group border border-border/50 rounded-xl p-4 transition-all duration-200 hover:border-border hover:shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center group-hover:bg-green-500/15 transition-colors">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium text-foreground text-sm">{partner.phone}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Numéro de téléphone</p>
                          </div>
                          <div className="flex flex-col xs:flex-row gap-2 flex-shrink-0">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs font-medium" asChild>
                              <a 
                                href={`https://wa.me/${partner.phone.replace(/[^0-9]/g, '')}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                                WhatsApp
                              </a>
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs" asChild>
                              <a href={`tel:${partner.phone}`}>
                                <Phone className="w-3.5 h-3.5 mr-1.5" />
                                Appeler
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Main Actions */}
              <div className="space-y-3 pt-2 border-t border-border/30">
                {user ? (
                  user.id !== partner.user_id && (
                    <Button className="w-full h-12 text-sm font-semibold rounded-xl" asChild>
                      <Link to={`/messages?partner=${partner.id}`}>
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Contacter le {partnerType.toLowerCase()}
                      </Link>
                    </Button>
                  )
                ) : (
                  <Button className="w-full h-12 text-sm font-semibold rounded-xl" asChild>
                    <Link to="/auth">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Créer un compte pour contacter
                    </Link>
                  </Button>
                )}
                
                {partner.website && (
                  <Button variant="outline" className="w-full h-12 text-sm font-medium rounded-xl" asChild>
                    <a href={partner.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Visiter le site web
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          {partner.experience && (
            <Card>
              <CardHeader>
                <CardTitle>Expérience</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{partner.experience}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}