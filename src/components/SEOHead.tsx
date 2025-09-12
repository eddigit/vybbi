import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  structuredData?: object;
  noIndex?: boolean;
}

export const SEOHead = ({ 
  title, 
  description, 
  canonicalUrl, 
  ogImage,
  structuredData,
  noIndex = false 
}: SEOHeadProps) => {
  const fullTitle = `${title} | Vybbi - La plateforme des artistes et professionnels de la musique`;
  const defaultDescription = "Découvrez les meilleurs artistes, agents, managers et lieux de spectacle sur Vybbi. La plateforme qui connecte les professionnels de la musique.";
  const metaDescription = description || defaultDescription;
  const defaultImage = `${window.location.origin}/og-image.jpg`;
  const imageUrl = ogImage || defaultImage;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={canonicalUrl || window.location.href} />
      <meta property="og:type" content="profile" />
      <meta property="og:site_name" content="Vybbi" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={imageUrl} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};