import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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

export default function Profiles() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profiles, setProfiles] = useState<Profile[]>([]);
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
      matchesType = profile.profile_type === 'agent' || profile.profile_type === 'manager';
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
      case 'manager':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'lieu':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default:
        return 'bg-muted';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
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
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="artist">Artistes</SelectItem>
            <SelectItem value="partner">Partenaires</SelectItem>
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
                <Button size="sm" className="flex-1">
                  View Profile
                </Button>
                {user && user.id !== profile.id && (
                  <Button size="sm" variant="outline">
                    Message
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredProfiles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No profiles found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}