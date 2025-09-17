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
import { MusicDiscography } from '@/components/MusicDiscography';
import ArtistEventManager from '@/components/ArtistEventManager';
import { ProfileShareTools } from '@/components/ProfileShareTools';
import { ProfileCTA } from '@/components/ProfileCTA';
import { ProfileAnalytics } from '@/components/ProfileAnalytics';
import { useProfileTracking } from '@/hooks/useProfileTracking';
import { DirectContactForm } from '@/components/DirectContactForm';
import { PricingIndicator } from '@/components/PricingIndicator';
import { ArtistAvailabilityCalendar } from '@/components/ArtistAvailabilityCalendar';

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
    <div className="container mx-auto p-6">
      {/* Header Section with Cover Image */}
      <div 
        className="relative h-64 md:h-80 rounded-xl mb-8 overflow-hidden"
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
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Share Tools - Top Right */}
        <div className="absolute top-6 right-6">
          <ProfileShareTools
            profileUrl={window.location.href}
            artistName={artist.display_name}
          />
        </div>

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
              {artist.experience && (
                <span>{artist.experience}</span>
              )}
            </div>
            {/* Language flags prominently displayed */}
            {(artist as any).languages && (artist as any).languages.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                {(artist as any).languages.map((langCode: string) => {
                  const lang = getLanguageByCode(langCode);
                  return lang ? (
                    <div key={langCode} className="group relative">
                      <span className="text-2xl" title={lang.name}>
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
              <div className="flex flex-wrap gap-2 mt-3">
                {(artist as any).talents.slice(0, 4).map((talentId: string) => {
                  const talent = getTalentById(talentId);
                  return talent ? (
                    <div 
                      key={talentId} 
                      className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5 text-sm font-medium"
                      title={talent.label}
                    >
                      <span>{talent.icon}</span>
                      <span>{talent.label}</span>
                    </div>
                  ) : null;
                })}
                {(artist as any).talents.length > 4 && (
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                    +{(artist as any).talents.length - 4}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Radio Statistics Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music2 className="h-5 w-5" />
                Radio Vybbi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioStatsDisplay artistId={artist.id} />
            </CardContent>
          </Card>

          {/* Bio Section */}
          {artist.bio && (
            <Card>
              <CardHeader>
                <CardTitle>À propos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {artist.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Tabbed Content */}
          <Tabs defaultValue="events" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="events">Événements</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="pricing">Tarifs & Booking</TabsTrigger>
              {isOwner && <TabsTrigger value="manage-events">Mes Événements</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="events" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Événements à venir</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProfileEvents profileId={artist.id} profileType="artist" />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="portfolio" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                  {imageMedia.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imageMedia.map((item, index) => (
                        <div 
                          key={item.id}
                          className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
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
                    <p className="text-center text-muted-foreground py-8">
                      Aucune image dans le portfolio pour le moment.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing" className="mt-6">
              <div className="space-y-6">
                <PricingIndicator artist={artist} />
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

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Professional CTA Card */}
          <ProfileCTA 
            artist={artist} 
            preferredContact={preferredContact}
          />

          {/* Reviews Section - Sidebar */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
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
                </div>
              </div>
            </CardHeader>
            <CardContent>
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

          {/* Owner Edit Button - Separate from CTA */}
          {isOwner && (
            <>
              <Card>
                <CardContent className="p-4">
                  <Button className="w-full" variant="outline" asChild>
                    <Link to={`/artists/${id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier mon profil
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              
              {/* Analytics for profile owner */}
              <ProfileAnalytics profileId={artist.id} />
            </>
          )}

          {/* Music Releases - Sidebar Version */}
          <div className="space-y-4">
            {user && profile && profile.id === artist.id && (
              <MusicReleaseWidget profileId={artist.id} />
            )}
            <MusicDiscography 
              profileId={artist.id} 
              isOwner={user && profile && profile.id === artist.id}
              compactMode={true}
              talents={(artist as any).talents || []}
            />
          </div>

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Social Media</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {socialLinks.map((link) => (
                    <Button 
                      key={link.platform}
                      variant="outline" 
                      className="w-full justify-start" 
                      asChild
                    >
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        {getSocialIcon(link.platform)}
                        <span className="ml-2">{link.label}</span>
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
    </div>
  );
}