import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, ExternalLink, Music2, Instagram, Music, Edit, MessageCircle, Calendar, ImageIcon } from 'lucide-react';
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
import { RiderTechnicalManager } from '@/components/RiderTechnicalManager';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { ProfileShareButton } from '@/components/ProfileShareButton';
import { LazyLoadAnalytics } from '@/components/LazyLoadAnalytics';
import { SEOHead } from '@/components/SEOHead';
import { ProductionsSlider } from '@/components/ProductionsSlider';
import { MusicPlayer } from '@/components/MusicPlayer';
import { FollowButton } from '@/components/social/FollowButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMusicReleases } from '@/hooks/useMusicReleases';
import ArtistStatsWidget from '@/components/ArtistStatsWidget';
import { OptimizedImage } from '@/components/OptimizedImage';
import { BlockchainCertificationBadge } from '@/components/BlockchainCertificationBadge';

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

  // Profile views count
  const [profileViews, setProfileViews] = useState<number>(0);

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
  const headerImage = (artist as any).header_url;

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
      
      {/* Hero Section with Background */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        {headerImage && (
          <OptimizedImage
            src={headerImage}
            alt={`${artist.display_name} header`}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
        
        {/* Profile Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <div className="flex items-end gap-3 sm:gap-4">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 border-3 sm:border-4 border-white shadow-lg">
                <AvatarImage src={artist.avatar_url} alt={artist.display_name} />
                <AvatarFallback className="text-base sm:text-lg font-bold bg-primary text-primary-foreground">
                  {artist.display_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 drop-shadow-lg">
                {artist.display_name}
              </h1>
              <div className="flex items-center gap-2 text-white/90 text-sm mb-2">
                {artist.location && (
                  <>
                    <MapPin className="h-4 w-4" />
                    <span className="drop-shadow">{artist.location}</span>
                  </>
                )}
              </div>
              
              {/* Languages */}
              {(artist as any).languages && (artist as any).languages.length > 0 && (
                <div className="flex gap-1 mb-2 flex-wrap items-center">
                  {(artist as any).languages.slice(0, 4).map((langCode: any) => {
                    const raw = String(langCode || '').toLowerCase();
                    const alias: Record<string, string> = { gb: 'en', uk: 'en', us: 'en', 'en-gb': 'en', 'en-us': 'en', br: 'pt', 'pt-br': 'pt', 'pt-pt': 'pt', cn: 'zh', 'zh-cn': 'zh', 'zh-hans': 'zh', 'zh-hant': 'zh', 'fr-fr': 'fr' };
                    const normalized = alias[raw] || raw.split('-')[0];
                    const lang = getLanguageByCode(normalized);
                    return (
                      <span
                        key={langCode}
                        aria-label={lang?.name}
                        title={lang?.name}
                        className="text-lg drop-shadow"
                      >
                        {lang?.flag || '🏳️'}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Talents */}
              {(artist as any).talents && (artist as any).talents.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {(artist as any).talents.slice(0, 4).map((talent: any) => (
                    <Badge key={talent} variant="outline" className="text-xs bg-primary/30 text-white border-primary/60 backdrop-blur-sm">
                      {talent}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Follow Button */}
            <div className="flex justify-end">
              <FollowButton 
                targetUserId={(artist as any).user_id || ''}
                targetProfileId={artist.id}
                targetDisplayName={artist.display_name}
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
              />
            </div>
          </div>
        </div>

        {/* Share Tools - Top Right */}
        <div className="absolute top-4 right-4">
          <ProfileShareTools
            profileUrl={window.location.href}
            artistName={artist.display_name}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            
            {/* Bio */}
            {artist.bio && (
              <Card className="mobile-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg sm:text-xl">À propos</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                    {artist.bio}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Productions Section */}
            <ProductionsSlider 
              profileId={artist.id} 
              onPlayTrack={playTrack} 
              className="mobile-card"
            />

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <Card className="mobile-card">
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-primary">{profileViews || 0}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Vues</div>
                </CardContent>
              </Card>
              
              <Card className="mobile-card">
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-primary">{media.length || 0}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Médias</div>
                </CardContent>
              </Card>

              <Card className="mobile-card">
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-primary">{reviews.length || 0}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Avis</div>
                </CardContent>
              </Card>

              <Card className="mobile-card">
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-primary">
                    {averageRating > 0 ? averageRating.toFixed(1) : '-'}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Note</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="events" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-auto">
                <TabsTrigger value="events" className="text-xs sm:text-sm py-2 sm:py-2.5">Événements</TabsTrigger>
                <TabsTrigger value="portfolio" className="text-xs sm:text-sm py-2 sm:py-2.5">Portfolio</TabsTrigger>
                <TabsTrigger value="pricing" className="text-xs sm:text-sm py-2 sm:py-2.5">Tarifs</TabsTrigger>
                {isOwner && <TabsTrigger value="manage" className="text-xs sm:text-sm py-2 sm:py-2.5">Gestion</TabsTrigger>}
              </TabsList>
              
              <TabsContent value="events" className="space-y-4">
                <ProfileEvents profileId={artist.id} profileType="artist" />
              </TabsContent>

              <TabsContent value="portfolio" className="space-y-4">
                {media.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                    {media.map((asset, index) => (
                      <div
                        key={asset.id}
                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform group touch-target"
                        onClick={() => handleImageClick(index)}
                      >
                        <OptimizedImage
                          src={asset.file_url}
                          alt={asset.description || `Media ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 right-1 sm:right-2">
                          <p className="text-white text-xs sm:text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity truncate drop-shadow">
                            {asset.description || `Media ${index + 1}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Card className="mobile-card">
                    <CardContent className="py-8 sm:py-12 text-center">
                      <ImageIcon className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-sm sm:text-base">Aucun média disponible</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="pricing" className="space-y-6">
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
              </TabsContent>

              {isOwner && (
                <TabsContent value="manage" className="space-y-6">
                  <ArtistEventManager artistProfileId={artist.id} isOwner={true} />
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* Sidebar - Mobile: Integrate into main flow, Desktop: Traditional sidebar */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6 order-first lg:order-last">
            
            {/* Call to Action */}
            <ProfileCTA 
              artist={artist} 
              preferredContact={preferredContact}
            />

            {/* Owner Edit Button - Mobile optimized */}
            {isOwner && (
              <Card className="mobile-card">
                <CardContent className="p-4">
                  <Button className="w-full mobile-button" variant="outline" asChild>
                    <Link to={`/artists/${artist.id}/edit`}>
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

            {/* Reviews Section */}
            <Card className="mobile-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Avis
                </CardTitle>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(averageRating)
                              ? 'fill-primary text-primary'
                              : 'text-muted-foreground/50'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {averageRating.toFixed(1)} ({reviews.length} avis)
                    </span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {canLeaveReview && !userHasReview && (
                    <EnhancedReviewForm
                      artistId={artist.id}
                      onReviewSubmitted={handleReviewSubmitted}
                    />
                  )}

                  {reviews.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {reviews.slice(0, 3).map((review) => {
                        const reviewer = reviewers[review.reviewer_id];
                        return (
                          <div key={review.id} className="border-b pb-3 last:border-b-0">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={reviewer?.avatar_url || ''} />
                                <AvatarFallback className="text-xs">
                                  {reviewer?.display_name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{reviewer?.display_name || 'Utilisateur'}</span>
                                  <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-3 w-3 ${
                                          star <= review.rating
                                            ? 'fill-primary text-primary'
                                            : 'text-muted-foreground/50'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">{review.comment}</p>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {reviews.length > 3 && (
                        <p className="text-xs text-center text-muted-foreground">
                          +{reviews.length - 3} autres avis
                        </p>
                      )}
                    </div>
                  ) : canLeaveReview ? (
                    <p className="text-center text-muted-foreground py-4 text-sm">
                      Soyez le premier à laisser un avis.
                    </p>
                  ) : (
                    <p className="text-center text-muted-foreground py-4 text-sm">
                      Aucun avis pour le moment.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Social Links - Mobile optimized */}
            {socialLinks.length > 0 && (
              <Card className="mobile-card">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-base sm:text-lg lg:text-xl">Social Media</CardTitle>
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
  );
}