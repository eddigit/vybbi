import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, ExternalLink, Music2, Instagram, Music, Edit, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

interface ArtistProfileProps {
  resolvedProfile?: Profile | ResolvedProfile | null;
}

export default function ArtistProfile({ resolvedProfile }: ArtistProfileProps) {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const [artist, setArtist] = useState<Profile | null>(null);
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
          .eq('reviewer_id', user.id)
          .eq('reviewed_profile_id', profileId)
          .maybeSingle();
        
        setUserHasReview(!!existingReview);
      }

    } catch (error) {
      console.error('Error fetching related data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArtistData = async () => {
    try {
      // Fetch artist profile
      const { data: artistData, error: artistError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .eq('profile_type', 'artist')
        .maybeSingle();

      if (artistError) throw artistError;
      setArtist(artistData);

      // Fetch preferred contact if exists
      if (artistData.preferred_contact_profile_id) {
        const { data: contactData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', artistData.preferred_contact_profile_id)
          .maybeSingle();
        
        setPreferredContact(contactData);
      }

      // Fetch media assets
      const { data: mediaData } = await supabase
        .from('media_assets')
        .select('*')
        .eq('profile_id', id)
        .order('created_at', { ascending: false });
      
      setMedia(mediaData || []);

      // Fetch reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewed_profile_id', id)
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
          .eq('reviewer_id', user.id)
          .eq('reviewed_profile_id', id)
          .maybeSingle();
        
        setUserHasReview(!!existingReview);
      }

    } catch (error) {
      console.error('Error fetching artist data:', error);
    } finally {
      setLoading(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const handleReviewSubmitted = () => {
    fetchArtistData();
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

  return (
    <>
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
                <Music className="h-5 w-5 text-primary" />
                Statistiques Radio Vybbi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioStatsDisplay artistId={id!} />
            </CardContent>
          </Card>

          {/* Events */}
          <ProfileEvents 
            profileId={id!}
            profileType="artist"
            className="mb-8"
          />

          {/* Music Releases */}
          <div className="space-y-6">
            {user && profile && profile.id === artist.id && (
              <MusicReleaseWidget profileId={artist.id} />
            )}
            <MusicDiscography 
              profileId={artist.id} 
              isOwner={user && profile && profile.id === artist.id} 
            />
          </div>

          {/* Bio & Genres */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              {artist.bio && (
                <p className="text-muted-foreground mb-4 leading-relaxed whitespace-pre-wrap">{artist.bio}</p>
              )}
              
              {artist.genres && artist.genres.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Genres</h4>
                  <div className="flex flex-wrap gap-2">
                    {artist.genres.map((genre) => (
                      <Badge key={genre} variant="secondary">{genre}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {(artist as any).languages && (artist as any).languages.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Langues parlées</h4>
                  <div className="flex flex-wrap gap-2">
                    {(artist as any).languages.map((langCode: string) => {
                      const lang = getLanguageByCode(langCode);
                      return lang ? (
                        <Badge key={langCode} variant="outline" className="gap-1">
                          <span>{lang.flag}</span>
                          {lang.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Social Media Embeds */}
          {artist.spotify_url && getSpotifyEmbedUrl(artist.spotify_url) && (
            <Card>
              <CardHeader>
                <CardTitle>Featured Music</CardTitle>
              </CardHeader>
              <CardContent>
                <iframe
                  src={getSpotifyEmbedUrl(artist.spotify_url) || ''}
                  width="100%"
                  height="352"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="rounded-lg"
                ></iframe>
              </CardContent>
            </Card>
          )}

          {/* Media Gallery */}
          {media.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {media.slice(0, 6).map((item, index) => (
                    <div key={item.id} className="aspect-square bg-muted rounded-lg overflow-hidden group cursor-pointer">
                       {item.media_type === 'image' ? (
                         <img 
                           src={item.file_url} 
                           alt={item.file_name || 'Portfolio item'}
                           className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                           onClick={() => handleImageClick(imageMedia.findIndex(img => img.id === item.id))}
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

          {/* Reviews */}
          {(reviews.length > 0 || canLeaveReview) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Avis {reviews.length > 0 && `(${reviews.length})`}
                </CardTitle>
                {averageRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{averageRating.toFixed(1)}</span>
                    <span className="text-muted-foreground text-sm">
                      sur {reviews.length} avis
                    </span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Review Form for eligible users */}
                {canLeaveReview && (
                  <EnhancedReviewForm 
                    artistId={id!} 
                    onReviewSubmitted={handleReviewSubmitted}
                    existingReview={userHasReview}
                  />
                )}

                {/* Reviews Display */}
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.slice(0, 5).map((review) => {
                      const reviewer = reviewers[review.reviewer_id];
                      return (
                        <div key={review.id} className="border-l-2 border-primary/20 pl-4 py-3">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={reviewer?.avatar_url || ''} />
                              <AvatarFallback className="text-xs">
                                {reviewer?.display_name 
                                  ? reviewer.display_name.split(' ').map(n => n[0]).join('').slice(0, 2)
                                  : '?'
                                }
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">
                                  {reviewer?.display_name || 'Utilisateur'}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {reviewer?.profile_type === 'lieu' ? 'Lieu' : 
                                   reviewer?.profile_type === 'agent' ? 'Agent' : 
                                   reviewer?.profile_type === 'manager' ? 'Manager' : 
                                   reviewer?.profile_type}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
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
                                <span className="text-xs text-muted-foreground">
                                  {new Date(review.created_at).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                              {review.comment && (
                                <p className="text-sm text-muted-foreground">{review.comment}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {reviews.length > 5 && (
                      <p className="text-sm text-muted-foreground text-center">
                        +{reviews.length - 5} autres avis
                      </p>
                    )}
                  </div>
                ) : canLeaveReview ? (
                  <p className="text-center text-muted-foreground py-4">
                    Soyez le premier à laisser un avis pour cet artiste.
                  </p>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Aucun avis pour le moment.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Contact & Actions */}
          <Card>
            <CardContent className="p-6">
              {user && 'user_id' in artist && artist.user_id === user.id ? (
                <Button className="w-full mb-4" asChild>
                  <Link to={`/artists/${id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier mon profil
                  </Link>
                </Button>
              ) : (
                <>
                      {user && 'user_id' in artist ? (
                        <>
                          {artist.accepts_direct_contact !== false ? (
                            <Button className="w-full mb-4" asChild>
                              <Link to={`/messages?contact=${artist.user_id}`}>
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Contacter l'artiste
                              </Link>
                            </Button>
                          ) : preferredContact ? (
                        <Button className="w-full mb-4" asChild>
                          <Link to={`/messages?partner=${preferredContact.id}`}>
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Contacter {preferredContact.profile_type === 'agent' ? "l'agent" : "le manager"}
                          </Link>
                        </Button>
                      ) : (
                        <Button className="w-full mb-4" disabled>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Contact non disponible
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button className="w-full mb-4" asChild>
                      <Link to="/auth?tab=signup">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Créer un compte pour contacter
                      </Link>
                    </Button>
                  )}
                </>
              )}
              {artist.website && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={artist.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Website
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

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
    </div>

    <ImageGallerySlider 
      images={sliderImages}
      selectedIndex={selectedImageIndex}
      isOpen={isSliderOpen}
      onClose={() => setIsSliderOpen(false)}
    />
    </>
  );
}