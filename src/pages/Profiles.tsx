import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star, Music, Users, Calendar } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { getProfileUrl } from '@/hooks/useProfileResolver';

export default function Profiles() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [preferredContacts, setPreferredContacts] = useState<{[key: string]: Profile}>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchProfiles();
    // Initialize filter from URL params
    const typeParam = searchParams.get('type');
    if (typeParam && ['artist', 'partner', 'lieu'].includes(typeParam)) {
      setTypeFilter(typeParam);
    }
  }, [searchParams]);

  const fetchProfiles = async () => {
    try {
      const { data } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      
      if (data) {
        setProfiles(data);
        
        // Fetch preferred contacts for artists who don't accept direct contact
        const artistsWithPreferredContact = data.filter((p: Profile) => 
          p.profile_type === 'artist' && 
          p.accepts_direct_contact === false && 
          p.preferred_contact_profile_id
        );
        
        if (artistsWithPreferredContact.length > 0) {
          const contactIds = artistsWithPreferredContact.map((a: Profile) => a.preferred_contact_profile_id).filter(Boolean);
          const { data: contactsData } = await supabase
            .from('profiles')
            .select('*')
            .in('id', contactIds);
          
          const contactsMap: {[key: string]: Profile} = {};
          contactsData?.forEach((contact: Profile) => {
            const artist = artistsWithPreferredContact.find((a: Profile) => a.preferred_contact_profile_id === contact.id);
            if (artist) {
              contactsMap[artist.id] = contact;
            }
          });
          setPreferredContacts(contactsMap);
        }
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.display_name.toLowerCase().includes(search.toLowerCase()) ||
                         profile.location?.toLowerCase().includes(search.toLowerCase());
    
    let matchesType = false;
    if (typeFilter === 'all') {
      matchesType = true;
    } else if (typeFilter === 'partner') {
      matchesType = ['agent', 'manager', 'academie', 'sponsors', 'media', 'agence', 'influenceur'].includes(profile.profile_type);
    } else {
      matchesType = profile.profile_type === typeFilter;
    }
    
    return matchesSearch && matchesType;
  });

  const getProfileIcon = (type: string) => {
    switch (type) {
      case 'artist':
        return <Music className="w-4 h-4" />;
      case 'agent':
      case 'manager':
        return <Users className="w-4 h-4" />;
      case 'academie':
        return <Users className="w-4 h-4" />;
      case 'sponsors':
        return <Users className="w-4 h-4" />;
      case 'media':
        return <Users className="w-4 h-4" />;
      case 'agence':
        return <Users className="w-4 h-4" />;
      case 'influenceur':
        return <Users className="w-4 h-4" />;
      case 'lieu':
        return <Calendar className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getProfileColor = (type: string) => {
    switch (type) {
      case 'artist':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'agent':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'manager':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'academie':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'sponsors':
        return 'bg-yellow-600/10 text-yellow-600 border-yellow-600/20';
      case 'media':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'agence':
        return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      case 'influenceur':
        return 'bg-pink-500/10 text-pink-500 border-pink-500/20';
      case 'lieu':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default:
        return 'bg-muted';
    }
  };

  if (loading) {
    return (
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Directory</h1>
        <p className="text-muted-foreground">Discover artists, agents, and venues in the music industry</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Input
            placeholder="Search by name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={(value) => {
          setTypeFilter(value);
          if (value === 'all') {
            setSearchParams({});
          } else {
            setSearchParams({ type: value });
          }
        }}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les profils</SelectItem>
            <SelectItem value="artist">Artistes</SelectItem>
            <SelectItem value="partner">Partenaires</SelectItem>
            <SelectItem value="agent">• Agents</SelectItem>
            <SelectItem value="manager">• Managers</SelectItem>
            <SelectItem value="academie">• Académies</SelectItem>
            <SelectItem value="sponsors">• Sponsors</SelectItem>
            <SelectItem value="media">• Média</SelectItem>
            <SelectItem value="agence">• Agences</SelectItem>
            <SelectItem value="influenceur">• Influenceurs</SelectItem>
            <SelectItem value="lieu">Lieux & Établissements</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfiles.map((profile) => (
          <Card key={profile.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback>
                    {profile.display_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{profile.display_name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                     <Badge variant="outline" className={getProfileColor(profile.profile_type)}>
                       {getProfileIcon(profile.profile_type)}
                        <span className="ml-1 capitalize">
                          {profile.profile_type === 'lieu' ? 'Lieu' : 
                           profile.profile_type === 'agent' ? 'Agent' :
                           profile.profile_type === 'manager' ? 'Manager' :
                           profile.profile_type === 'academie' ? 'Académie' :
                           profile.profile_type === 'sponsors' ? 'Sponsors' :
                           profile.profile_type === 'media' ? 'Média' :
                           profile.profile_type === 'agence' ? 'Agence' :
                           profile.profile_type === 'influenceur' ? 'Influenceur' :
                           profile.profile_type}
                        </span>
                     </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {profile.bio && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {profile.bio}
                </p>
              )}
              
              {profile.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <MapPin className="w-3 h-3" />
                  <span>{profile.location}</span>
                </div>
              )}
              
              {profile.genres && profile.genres.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {profile.genres.slice(0, 3).map((genre) => (
                    <Badge key={genre} variant="secondary" className="text-xs">
                      {genre}
                    </Badge>
                  ))}
                  {profile.genres.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{profile.genres.length - 3}
                    </Badge>
                  )}
                </div>
              )}
              
              {profile.experience && (
                <p className="text-xs text-muted-foreground mb-3">
                  {profile.experience}
                </p>
              )}
              
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" asChild>
                  <Link to={getProfileUrl(profile)}>
                    Voir le profil
                  </Link>
                </Button>
                {user && user.id !== profile.user_id && (
                  <>
                    {profile.profile_type === 'artist' && profile.accepts_direct_contact === false ? (
                      preferredContacts[profile.id] ? (
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/messages?partner=${preferredContacts[profile.id].id}`}>
                            Contacter {preferredContacts[profile.id].profile_type === 'agent' ? "l'agent" : "le manager"}
                          </Link>
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          Contact non disponible
                        </Button>
                      )
                    ) : (
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/messages?contact=${profile.user_id}`}>
                          Message
                        </Link>
                      </Button>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredProfiles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun profil ne correspond à vos critères.</p>
        </div>
      )}
    </div>
  );
}