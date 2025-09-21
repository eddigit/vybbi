import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, ExternalLink, Music2, Instagram, Music, Edit, MessageCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { Profile, MediaAsset, Review } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { getLanguageByCode } from '@/lib/languages';
import { getTalentById } from '@/lib/talents';
import EnhancedReviewForm from '@/components/EnhancedReviewForm';
import { ImageGallerySlider } from '@/components/ImageGallerySlider';
import RadioStatsDisplay from '@/components/RadioStatsDisplay';
import { ProfileEvents } from '@/components/ProfileEvents';
import { MusicReleaseWidget } from '@/components/MusicReleaseWidget';
import { ResolvedProfile } from '@/hooks/useProfileResolver';
import ArtistEventManager from '@/components/ArtistEventManager';
import { ProfileShareTools } from '@/components/ProfileShareTools';
import { ProfileCTA } from '@/components/ProfileCTA';
import { ProfileAnalytics } from '@/components/ProfileAnalytics';
import { useProfileTracking } from '@/hooks/useProfileTracking';
import { DirectContactForm } from '@/components/DirectContactForm';
import { PricingIndicator } from '@/components/PricingIndicator';
import { ArtistAvailabilityCalendar } from '@/components/ArtistAvailabilityCalendar';
import { PressKitGenerator } from '@/components/PressKitGenerator';
import { RiderTechnicalManager } from '@/components/RiderTechnicalManager';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { ProfileShareButton } from '@/components/ProfileShareButton';
import { LazyLoadAnalytics } from '@/components/LazyLoadAnalytics';
import { SEOHead } from '@/components/SEOHead';
import { ProductionsSlider } from '@/components/ProductionsSlider';
import { MusicPlayer } from '@/components/MusicPlayer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMusicReleases } from '@/hooks/useMusicReleases';
import ArtistStatsWidget from '@/components/ArtistStatsWidget';

interface ArtistProfileProps {
  resolvedProfile?: Profile | ResolvedProfile | null;
}

export default function ArtistProfile({ resolvedProfile }: ArtistProfileProps) {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const [artist, setArtist] = useState<Profile | null>(null);
  
  // Track profile view - use resolvedProfile ID or fallback to artist ID
  const trackingProfileId = resolvedProfile?.id || artist?.id;
  useProfileTracking(trackingProfileId, 'full_profile', window.location.pathname);
  
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewers, setReviewers] = useState<{ [key: string]: Profile }>({});
  const [userHasReview, setUserHasReview] = useState(false);
  const [preferredContact, setPreferredContact] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Music Player states
  const [selectedTrack, setSelectedTrack] = useState<any | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);

  useEffect(() => {
    if (resolvedProfile) {
      // Use the resolved profile from parent component
      setArtist(resolvedProfile as Profile);
      fetchRelatedData(resolvedProfile.id);
    } else if (id) {
      // Fallback to original logic for direct ID access
      fetchArtistData();
    }
  }, [id, resolvedProfile]);

  const fetchRelatedData = async (profileId: string) => {
    try {
      // Fetch preferred contact if exists
      if (resolvedProfile?.preferred_contact_profile_id) {
        const { data: contactData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', resolvedProfile.preferred_contact_profile_id)
          .maybeSingle();
        
        setPreferredContact(contactData);
      }

      // Fetch media assets
      const { data: mediaData } = await supabase
        .from('media_assets')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });
      
      setMedia(mediaData || []);

      // Fetch reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewed_profile_id', profileId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      setReviews(reviewsData || []);

      // Fetch reviewer profiles if there are reviews
      if (reviewsData && reviewsData.length > 0) {
        const reviewerIds = [...new Set(reviewsData.map(review => review.reviewer_id))];
        const { data: reviewerProfiles } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', reviewerIds);
        
        const reviewerMap: { [key: string]: Profile } = {};
        reviewerProfiles?.forEach(reviewer => {
          reviewerMap[reviewer.user_id] = reviewer;
        });
        setReviewers(reviewerMap);
      }

      // Check if current user has already reviewed this artist
      if (user) {
        const { data: existingReview } = await supabase
          .from('reviews')
          .select('id')
          .eq('reviewed_profile_id', profileId)
          .eq('reviewer_id', user.id)
          .maybeSingle();
        
        setUserHasReview(!!existingReview);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching related data:', error);
      setLoading(false);
    }
  };

  const fetchArtistData = async () => {
    if (!id) return;

    try {
      const { data: artistData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .eq('profile_type', 'artist')
        .maybeSingle();

      if (error) throw error;
      
      if (!artistData) {
        setLoading(false);
        return;
      }

      setArtist(artistData);
      fetchRelatedData(artistData.id);
    } catch (error) {
      console.error('Error fetching artist:', error);
      setLoading(false);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const handleReviewSubmitted = () => {
    // Refresh the artist data to show the new review
    if (id && !resolvedProfile) {
      fetchArtistData();
    } else if (artist) {
      fetchRelatedData(artist.id);
    }
  };

  const canLeaveReview = profile && 
    ['agent', 'manager', 'lieu'].includes(profile.profile_type) &&
    artist && 'user_id' in artist && artist.user_id !== user?.id;

  // Music Player functions
  const { data: musicReleases = [] } = useMusicReleases(artist?.id || '', 'published');
  const publishedReleases = musicReleases?.filter(r => r.status === 'published') || [];

  const playTrack = (track: any, playlist: any[] = []) => {
    setSelectedTrack(track);
    const trackIndex = playlist.findIndex((t: any) => t.id === track.id);
    setCurrentPlaylistIndex(trackIndex >= 0 ? trackIndex : 0);
    setIsPlayerOpen(true);
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsSliderOpen(true);
  };

  const imageMedia = media.filter(item => item.media_type === 'image');
  const sliderImages = imageMedia.map(item => ({
    id: item.id,
    url: item.file_url,
    description: item.description || item.file_name || null,
    position_y: undefined
  }));

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'spotify': return <Music className="h-4 w-4" />;
      case 'soundcloud': return <Music2 className="h-4 w-4" />;
      case 'youtube': return <Music className="h-4 w-4" />;
      case 'tiktok': return <Music2 className="h-4 w-4" />;
      default: return <ExternalLink className="h-4 w-4" />;
    }
  };

  const getSpotifyEmbedUrl = (url: string) => {
    if (url.includes('open.spotify.com')) {
      return url.replace('open.spotify.com', 'open.spotify.com/embed');
    }
    return null;
  };

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

  const socialLinks = [
    { platform: 'instagram', url: artist.instagram_url, label: 'Instagram' },
    { platform: 'spotify', url: artist.spotify_url, label: 'Spotify' },
    { platform: 'soundcloud', url: artist.soundcloud_url, label: 'SoundCloud' },
    { platform: 'youtube', url: artist.youtube_url, label: 'YouTube' },
    { platform: 'tiktok', url: artist.tiktok_url, label: 'TikTok' },
  ].filter(link => link.url);

  const isOwner = user && 'user_id' in artist && artist.user_id === user.id;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        profile={{
          id: artist.id,
          display_name: artist.display_name,
          profile_type: 'artist',
          bio: artist.bio,
          location: artist.location,
          talents: (artist as any).talents,
          languages: (artist as any).languages,
          avatar_url: artist.avatar_url,
          slug: (artist as any).slug
        }}
      />
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header Section with Cover Image */}
      <div 
        className="relative h-56 sm:h-64 md:h-80 rounded-xl mb-6 sm:mb-8 overflow-hidden"
        style={{
          backgroundImage: (artist as any).header_url 
            ? `url(${(artist as any).header_url})` 
            : 'linear-gradient(to right, rgba(var(--primary) / 0.2), rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))',
          backgroundSize: 'cover',
          backgroundPosition: (artist as any).header_url 
            ? `center ${(artist as any).header_position_y || 50}%`
            : 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/10"></div>
        
        {/* Share Tools - Top Right */}
        <div className="absolute top-4 sm:top-6 right-4 sm:right-6">
          <ProfileShareTools
            profileUrl={window.location.href}
            artistName={artist.display_name}
          />
        </div>

        <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 flex items-end gap-3 sm:gap-6">
          <Avatar className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-32 lg:w-32 ring-2 sm:ring-4 ring-white/20">
            <AvatarImage src={artist.avatar_url || ''} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary-foreground text-white text-sm sm:text-xl md:text-2xl font-bold">
              {artist.display_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="text-white min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 drop-shadow-lg" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.9)'}}>{artist.display_name}</h1>
            <div className="flex items-center gap-2 sm:gap-4 text-white/90 text-xs sm:text-sm">
              {artist.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="truncate">{artist.location}</span>
                </div>
              )}
              {artist.experience && (
                <span className="hidden sm:inline truncate">{artist.experience}</span>
              )}
            </div>
            {/* Language flags prominently displayed */}
            {(artist as any).languages && (artist as any).languages.length > 0 && (
              <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                {(artist as any).languages.slice(0, 4).map((langCode: string) => {
                  const lang = getLanguageByCode(langCode);
                  return lang ? (
                    <div key={langCode} className="group relative">
                      <span className="text-lg sm:text-2xl" title={lang.name}>
                        {lang.flag}
                      </span>
                      <span className="sr-only">{lang.name}</span>
                    </div>
                  ) : null;
                })}
              </div>
            )}
            
            {/* Talents display */}
            {(artist as any).talents && (artist as any).talents.length > 0 && (
              <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 sm:mt-3">
                {(artist as any).talents.slice(0, 4).map((talentId: string) => {
                  const talent = getTalentById(talentId);
                  return talent ? (
                    <div 
                      key={talentId} 
                      className="bg-white/30 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium"
                      title={talent.label}
                    >
                      <span className="text-xs sm:text-sm">{talent.icon}</span>
                      <span className="hidden sm:inline">{talent.label}</span>
                    </div>
                  ) : null;
                })}
                {(artist as any).talents.length > 4 && (
                  <div className="bg-white/30 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    +{(artist as any).talents.length - 4}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
          
          {/* Bio Section - Moved to top priority */}
          {artist.bio && (
            <Card className="mobile-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl">À propos</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm sm:text-base">
                  {artist.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Sets & Productions Slider */}
          <ProductionsSlider
            profileId={artist.id}
            onPlayTrack={(track, playlist) => playTrack(track, playlist)}
            className="mobile-card"
          />

          {/* New Vybbi Statistics Widget */}
          <ArtistStatsWidget artistId={artist.id} />

          {/* Tabbed Content */}
          <Tabs defaultValue="events" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-auto">
              <TabsTrigger value="events" className="text-xs sm:text-sm py-2 sm:py-2.5">Événements</TabsTrigger>
              <TabsTrigger value="portfolio" className="text-xs sm:text-sm py-2 sm:py-2.5">Portfolio</TabsTrigger>
              <TabsTrigger value="pricing" className="text-xs sm:text-sm py-2 sm:py-2.5">Tarifs</TabsTrigger>
              {isOwner && <TabsTrigger value="manage-events" className="text-xs sm:text-sm py-2 sm:py-2.5">Gestion</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="events" className="mt-4 sm:mt-6">
              <Card className="mobile-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg sm:text-xl">Événements à venir</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ProfileEvents profileId={artist.id} profileType="artist" />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="portfolio" className="mt-4 sm:mt-6">
              <Card className="mobile-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg sm:text-xl">Portfolio</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {imageMedia.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                      {imageMedia.map((item, index) => (
                        <div 
                          key={item.id}
                          className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity touch-target"
                          onClick={() => handleImageClick(index)}
                        >
                          <img
                            src={item.file_url}
                            alt={item.description || item.file_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-6 sm:py-8 text-sm sm:text-base">
                      Aucune image dans le portfolio pour le moment.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing" className="mt-6">
              <div className="space-y-6">
                <PricingIndicator artist={artist} />
                <RiderTechnicalManager profileId={artist.id} />
                <DirectContactForm
                  artistId={artist.id}
                  artistName={artist.display_name}
                  preferredContactId={preferredContact?.id}
                  preferredContactName={preferredContact?.display_name}
                />
                <ArtistAvailabilityCalendar
                  artistId={artist.id}
                  isOwner={isOwner}
                />
              </div>
            </TabsContent>

            {isOwner && (
              <TabsContent value="manage-events" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Gérer mes événements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ArtistEventManager artistProfileId={artist.id} isOwner={true} />
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Sidebar - Mobile: Integrate into main flow, Desktop: Traditional sidebar */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6 order-first lg:order-last">
          
          {/* Professional CTA Card */}
          <ProfileCTA 
            artist={artist} 
            preferredContact={preferredContact}
          />

          {/* Owner Edit Button - Mobile optimized */}
          {isOwner && (
            <Card className="mobile-card">
              <CardContent className="p-4">
                <Button className="w-full mobile-button" variant="outline" asChild>
                  <Link to={`/artists/${id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier mon profil
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Testimonials - Hidden on mobile to save space */}
          <div className="hidden lg:block">
            <TestimonialsSection 
              profileId={artist.id} 
              isOwner={isOwner}
            />
          </div>

          {/* Social Links - Mobile optimized */}
          {socialLinks.length > 0 && (
            <Card className="mobile-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl">Social Media</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-2">
                  {socialLinks.map((link) => (
                    <Button 
                      key={link.platform}
                      variant="outline" 
                      className="justify-start text-xs sm:text-sm touch-target" 
                      asChild
                    >
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        {getSocialIcon(link.platform)}
                        <span className="ml-1 sm:ml-2 truncate">{link.label}</span>
                      </a>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ImageGallerySlider 
        images={sliderImages}
        selectedIndex={selectedImageIndex}
        isOpen={isSliderOpen}
        onClose={() => setIsSliderOpen(false)}
      />

      {/* Music Player Dialog */}
      <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lecture en cours</DialogTitle>
          </DialogHeader>
          
          {selectedTrack && (
            <div className="space-y-6">
              {/* Track Info */}
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24 rounded-lg">
                  <AvatarImage src={selectedTrack.cover_image_url} alt={selectedTrack.title} />
                  <AvatarFallback className="rounded-lg">
                    <Music className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <h2 className="text-xl font-bold">{selectedTrack.title}</h2>
                  <p className="text-lg text-muted-foreground">{selectedTrack.artist_name}</p>
                  {selectedTrack.album_name && (
                    <p className="text-muted-foreground">Album: {selectedTrack.album_name}</p>
                  )}
                </div>
              </div>
              
              <MusicPlayer
                track={selectedTrack as any}
                playlist={publishedReleases as any}
                currentIndex={currentPlaylistIndex}
                onTrackChange={(index) => {
                  setCurrentPlaylistIndex(index);
                  setSelectedTrack(publishedReleases[index]);
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}