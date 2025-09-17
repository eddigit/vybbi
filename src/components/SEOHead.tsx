import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  profile?: {
    id: string;
    display_name: string;
    profile_type: string;
    bio?: string;
    location?: string;
    talents?: string[];
    languages?: string[];
    avatar_url?: string;
    slug?: string;
  };
}

export function SEOHead({ 
  title = "Vybbi - Plateforme pour les artistes et professionnels du spectacle",
  description = "Découvrez et connectez-vous avec les meilleurs artistes, agents, managers et lieux de spectacle sur Vybbi.",
  keywords = "artistes, spectacle, musique, événements, booking, agents, managers",
  image = "/logo.png",
  url = window.location.href,
  type = "website",
  profile
}: SEOHeadProps) {
  
  // Generate dynamic SEO data for profiles
  const getProfileSEO = () => {
    if (!profile) return { title, description, keywords, image, type };
    
    const profileTitle = `${profile.display_name} - ${profile.profile_type} sur Vybbi`;
    const profileDescription = profile.bio 
      ? `${profile.bio.substring(0, 150)}...` 
      : `Découvrez le profil de ${profile.display_name}, ${profile.profile_type} ${profile.location ? `basé(e) à ${profile.location}` : ''}. Contactez directement via Vybbi.`;
    
    const profileKeywords = [
      profile.display_name.toLowerCase(),
      profile.profile_type.toLowerCase(),
      ...(profile.talents || []).map(t => t.toLowerCase()),
      ...(profile.languages || []).map(l => l.toLowerCase()),
      profile.location?.toLowerCase(),
      'vybbi', 'artiste', 'spectacle', 'booking'
    ].filter(Boolean).join(', ');
    
    return {
      title: profileTitle,
      description: profileDescription,
      keywords: profileKeywords,
      image: profile.avatar_url || image,
      type: 'profile'
    };
  };
  
  const seoData = profile ? getProfileSEO() : { title, description, keywords, image, type };

  return (
    <Helmet>
      <title>{seoData.title}</title>
      <meta name="description" content={seoData.description} />
      <meta name="keywords" content={seoData.keywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={seoData.title} />
      <meta property="og:description" content={seoData.description} />
      <meta property="og:image" content={seoData.image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={seoData.type} />
      <meta property="og:site_name" content="Vybbi" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoData.title} />
      <meta name="twitter:description" content={seoData.description} />
      <meta name="twitter:image" content={seoData.image} />
      
      {/* Schema.org structured data for profiles */}
      {profile && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": profile.profile_type === 'artist' ? 'MusicGroup' : 'Organization',
            "name": profile.display_name,
            "description": profile.bio,
            "image": profile.avatar_url,
            "url": url,
            ...(profile.location && {
              "address": {
                "@type": "PostalAddress",
                "addressLocality": profile.location
              }
            }),
            ...(profile.profile_type === 'artist' && {
              "genre": profile.talents,
              "@type": "MusicGroup"
            })
          })}
        </script>
      )}
      
      {/* Additional meta tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />
      
      {/* Profile-specific meta tags */}
      {profile && (
        <>
          <meta name="author" content={profile.display_name} />
          <meta property="profile:first_name" content={profile.display_name.split(' ')[0]} />
          <meta property="profile:last_name" content={profile.display_name.split(' ').slice(1).join(' ')} />
          {profile.talents && <meta name="genre" content={profile.talents.join(', ')} />}
          {profile.languages && <meta name="language" content={profile.languages.join(', ')} />}
        </>
      )}
    </Helmet>
  );
}