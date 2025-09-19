import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/lib/types';
import { getProfileUrl } from '@/hooks/useProfileResolver';

interface FeaturedArtistsStripProps {
  className?: string;
}

export default function FeaturedArtistsStrip({ className }: FeaturedArtistsStripProps) {
  const [featuredArtists, setFeaturedArtists] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    fetchFeaturedArtists();
  }, []);

  const fetchFeaturedArtists = async () => {
    try {
      // Try to fetch featured artists (this will work once the database is updated)
      // For now, fallback to recent public artists
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('profile_type', 'artist')
        .eq('is_public', true)
        .not('avatar_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) throw error;
      setFeaturedArtists(data || []);
    } catch (error) {
      console.error('Error fetching featured artists:', error);
      setFeaturedArtists([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading || featuredArtists.length === 0) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 border-b ${className}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Artistes mis en avant</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="md:hidden"
          >
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
            <span className="sr-only">
              {isCollapsed ? 'Afficher' : 'Masquer'} les artistes mis en avant
            </span>
          </Button>
        </div>
        
        {!isCollapsed && (
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 pb-2">
              {featuredArtists.map((artist) => (
                <Link
                  key={artist.id}
                  to={getProfileUrl(artist)}
                  className="flex-shrink-0 group"
                >
                  <div className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                    <Avatar className="h-14 w-14 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                      <AvatarImage 
                        src={artist.avatar_url || ''} 
                        alt={artist.display_name}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                        {artist.display_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center max-w-20">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {artist.display_name}
                      </p>
                      {artist.location && (
                        <p className="text-xs text-muted-foreground truncate">
                          {artist.location.split(',')[0]}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </div>
    </div>
  );
}