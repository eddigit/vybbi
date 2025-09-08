import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Star, Users, ExternalLink, Music2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { supabase } from '@/integrations/supabase/client';
import { Profile, MediaAsset, Review, ManagerArtist, AgentArtist, Booking } from '@/lib/types';

export default function ArtistProfile() {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<Profile | null>(null);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [manager, setManager] = useState<ManagerArtist | null>(null);
  const [agents, setAgents] = useState<AgentArtist[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchArtistData();
    }
  }, [id]);

  const fetchArtistData = async () => {
    try {
      // Fetch artist profile
      const { data: artistData, error: artistError } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', id)
        .eq('profile_type', 'artist')
        .single();

      if (artistError) throw artistError;
      setArtist(artistData);

      // Fetch media assets
      const { data: mediaData } = await (supabase as any)
        .from('media_assets')
        .select('*')
        .eq('profile_id', id)
        .order('created_at', { ascending: false });
      
      setMedia(mediaData || []);

      // Fetch reviews
      const { data: reviewsData } = await (supabase as any)
        .from('reviews')
        .select(`
          *,
          author:profiles!reviews_author_id_fkey(*)
        `)
        .eq('subject_id', id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      setReviews(reviewsData || []);

      // Fetch active manager
      const { data: managerData } = await (supabase as any)
        .from('manager_artists')
        .select(`
          *,
          manager:profiles!manager_artists_manager_id_fkey(*)
        `)
        .eq('artist_id', id)
        .eq('status', 'active')
        .maybeSingle();
      
      setManager(managerData);

      // Fetch active agents
      const { data: agentsData } = await (supabase as any)
        .from('agent_artists')
        .select(`
          *,
          agent:profiles!agent_artists_agent_id_fkey(*)
        `)
        .eq('artist_id', id)
        .eq('status', 'active');
      
      setAgents(agentsData || []);

      // Fetch upcoming bookings
      const { data: bookingsData } = await (supabase as any)
        .from('bookings')
        .select(`
          *,
          event:events(
            *,
            host_lieu:profiles!events_host_lieu_id_fkey(*)
          )
        `)
        .eq('artist_id', id)
        .in('status', ['confirmed', 'proposed'])
        .gte('start_at', new Date().toISOString())
        .order('start_at', { ascending: true })
        .limit(5);
      
      setUpcomingBookings(bookingsData || []);

    } catch (error) {
      console.error('Error fetching artist data:', error);
    } finally {
      setLoading(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Artist not found</h2>
        <p className="text-muted-foreground">The artist profile you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header Section with Cover Image */}
      <div className="relative h-64 md:h-80 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 rounded-xl mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-6 left-6 flex items-end gap-6">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 ring-4 ring-white/20">
            <AvatarImage src={artist.avatar_url || ''} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary-foreground text-white text-2xl font-bold">
              {artist.display_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{artist.display_name}</h1>
            <div className="flex items-center gap-4 text-white/80">
              {artist.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {artist.location}
                </div>
              )}
              {artist.years_experience && (
                <span>{artist.years_experience} years experience</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Bio & Genres */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              {artist.bio && (
                <p className="text-muted-foreground mb-4 leading-relaxed">{artist.bio}</p>
              )}
              
              {artist.genres && artist.genres.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Genres</h4>
                  <div className="flex flex-wrap gap-2">
                    {artist.genres.map((genre) => (
                      <Badge key={genre} variant="secondary">{genre}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Media Gallery */}
          {media.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {media.slice(0, 6).map((item) => (
                    <div key={item.id} className="aspect-square bg-muted rounded-lg overflow-hidden group cursor-pointer">
                       {item.media_type === 'image' ? (
                         <img 
                           src={item.file_url} 
                           alt={item.file_name || 'Portfolio item'}
                           className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                         />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                           <Music2 className="h-8 w-8 text-primary" />
                           <span className="sr-only">{item.media_type} file</span>
                         </div>
                       )}
                    </div>
                  ))}
                </div>
                {media.length > 6 && (
                  <p className="text-sm text-muted-foreground mt-4">
                    +{media.length - 6} more items
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Upcoming Events */}
          {upcomingBookings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{booking.event?.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {booking.event?.host_lieu?.display_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(booking.start_at || booking.event?.start_at || '').toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Reviews ({reviews.length})
                </CardTitle>
                {averageRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{averageRating.toFixed(1)}</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="border-l-2 border-primary/20 pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={review.author?.avatar_url || ''} />
                          <AvatarFallback className="text-xs">
                            {review.author?.display_name?.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{review.author?.display_name}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Contact & Actions */}
          <Card>
            <CardContent className="p-6">
              <Button className="w-full mb-4">Contact Artist</Button>
              {artist.website_url && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={artist.website_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Website
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Manager */}
          {manager && manager.manager && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Manager</CardTitle>
              </CardHeader>
              <CardContent>
                <Link to={`/managers/${manager.manager.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={manager.manager.avatar_url || ''} />
                    <AvatarFallback>
                      {manager.manager.display_name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{manager.manager.display_name}</p>
                    <p className="text-sm text-muted-foreground">Manager</p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Agents */}
          {agents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Agents ({agents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {agents.map((agentRel) => (
                    <Link 
                      key={agentRel.id} 
                      to={`/agents/${agentRel.agent?.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={agentRel.agent?.avatar_url || ''} />
                        <AvatarFallback>
                          {agentRel.agent?.display_name?.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{agentRel.agent?.display_name}</p>
                        <p className="text-sm text-muted-foreground">Agent</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}