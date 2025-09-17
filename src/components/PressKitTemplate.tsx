import React from 'react';
import { QRCode } from 'qrcode';

interface PressKitTemplateProps {
  profileData: {
    display_name: string;
    bio?: string;
    avatar_url?: string;
    genres?: string[];
    location?: string;
    email?: string;
    phone?: string;
    website?: string;
    spotify_url?: string;
    youtube_url?: string;
    instagram_url?: string;
  };
  mediaAssets?: any[];
  reviews?: any[];
  events?: any[];
  onRef?: (ref: HTMLDivElement | null) => void;
}

export const PressKitTemplate = React.forwardRef<HTMLDivElement, PressKitTemplateProps>(
  ({ profileData, mediaAssets, reviews, events }, ref) => {
    const averageRating = reviews && reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    const upcomingEvents = events?.filter(event => new Date(event.date) > new Date()).slice(0, 3) || [];

    return (
      <div 
        ref={ref}
        className="w-[210mm] min-h-[297mm] mx-auto font-serif"
        style={{ 
          fontFamily: 'Georgia, serif',
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#000000',
          backgroundColor: '#ffffff'
        }}
      >
        {/* Page de couverture */}
        <div className="h-[297mm] flex flex-col relative p-12">
          {/* Header avec logo/branding */}
          <div className="absolute top-0 left-0 right-0 h-2" style={{ background: 'linear-gradient(to right, #9333ea, #ec4899)' }}></div>
          
          {/* Photo principale */}
          <div className="flex justify-center mb-8">
            {profileData.avatar_url ? (
              <img 
                src={profileData.avatar_url} 
                alt={profileData.display_name}
                className="w-64 h-64 object-cover rounded-full shadow-2xl border-4"
                style={{ borderColor: '#e5e7eb' }}
              />
            ) : (
              <div className="w-64 h-64 rounded-full flex items-center justify-center text-6xl font-bold shadow-2xl border-4" style={{ background: 'linear-gradient(to bottom right, #f3e8ff, #fce7f3)', color: '#9333ea', borderColor: '#e5e7eb' }}>
                {profileData.display_name.charAt(0)}
              </div>
            )}
          </div>

          {/* Nom de l'artiste */}
          <h1 className="text-6xl font-bold text-center mb-4" style={{ color: '#111827' }}>
            {profileData.display_name}
          </h1>

          {/* Genres */}
          {profileData.genres && profileData.genres.length > 0 && (
            <div className="text-center mb-8">
              <div className="inline-flex flex-wrap gap-2 justify-center">
                {profileData.genres.map((genre, index) => (
                  <span 
                    key={index}
                    className="px-4 py-2 rounded-full text-sm font-semibold"
                    style={{ background: 'linear-gradient(to right, #9333ea, #ec4899)', color: '#ffffff' }}
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Localisation */}
          {profileData.location && (
            <p className="text-center text-xl mb-12" style={{ color: '#4b5563' }}>
              📍 {profileData.location}
            </p>
          )}

          {/* Stats en bas */}
          <div className="mt-auto">
            <div className="grid grid-cols-3 gap-8 text-center border-t-2 pt-8" style={{ borderColor: '#e5e7eb' }}>
              <div>
                <div className="text-3xl font-bold" style={{ color: '#9333ea' }}>{events?.length || 0}</div>
                <div className="text-sm uppercase tracking-wide" style={{ color: '#4b5563' }}>Événements</div>
              </div>
              <div>
                <div className="text-3xl font-bold" style={{ color: '#9333ea' }}>{averageRating.toFixed(1)}/5</div>
                <div className="text-sm uppercase tracking-wide" style={{ color: '#4b5563' }}>Note moyenne</div>
              </div>
              <div>
                <div className="text-3xl font-bold" style={{ color: '#9333ea' }}>{reviews?.length || 0}</div>
                <div className="text-sm uppercase tracking-wide" style={{ color: '#4b5563' }}>Avis</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 h-2" style={{ background: 'linear-gradient(to right, #9333ea, #ec4899)' }}></div>
        </div>

        {/* Page 2 - Biographie */}
        <div className="h-[297mm] p-12 flex flex-col">
          <h2 className="text-4xl font-bold mb-8 border-b-4 pb-4" style={{ color: '#111827', borderColor: '#9333ea' }}>
            Biographie
          </h2>
          
          <div className="flex-1 flex gap-8">
            <div className="flex-1">
              {profileData.bio ? (
                <div className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: '#1f2937' }}>
                  {profileData.bio}
                </div>
              ) : (
                <p className="italic" style={{ color: '#6b7280' }}>Biographie non disponible</p>
              )}
            </div>
            
            {/* Sidebar avec infos complémentaires */}
            <div className="w-64 p-6 rounded-lg" style={{ backgroundColor: '#f9fafb' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#111827' }}>Informations</h3>
              
              {profileData.genres && profileData.genres.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2" style={{ color: '#374151' }}>Genres musicaux</h4>
                  <div className="flex flex-wrap gap-1">
                    {profileData.genres.map((genre, index) => (
                      <span key={index} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#f3e8ff', color: '#7c3aed' }}>
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {upcomingEvents.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2" style={{ color: '#374151' }}>Prochains événements</h4>
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="text-xs mb-1" style={{ color: '#4b5563' }}>
                      {new Date(event.date).toLocaleDateString('fr-FR')} - {event.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page 3 - Photos et Médias */}
        {mediaAssets && mediaAssets.length > 0 && (
          <div className="h-[297mm] p-12">
            <h2 className="text-4xl font-bold mb-8 border-b-4 pb-4" style={{ color: '#111827', borderColor: '#9333ea' }}>
              Photos & Médias
            </h2>
            
            <div className="grid grid-cols-2 gap-6 h-3/4">
              {mediaAssets.slice(0, 4).map((asset, index) => (
                <div key={index} className="relative overflow-hidden rounded-lg shadow-lg">
                  <img 
                    src={asset.url} 
                    alt={`Média ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            
            <p className="text-center mt-4 italic" style={{ color: '#4b5563' }}>
              Photos haute résolution disponibles sur demande
            </p>
          </div>
        )}

        {/* Page 4 - Témoignages */}
        {reviews && reviews.length > 0 && (
          <div className="h-[297mm] p-12">
            <h2 className="text-4xl font-bold mb-8 border-b-4 pb-4" style={{ color: '#111827', borderColor: '#9333ea' }}>
              Témoignages
            </h2>
            
            <div className="space-y-8">
              {reviews.slice(0, 3).map((review, index) => (
                <div key={index} className="p-6 rounded-lg border-l-4" style={{ backgroundColor: '#f9fafb', borderColor: '#9333ea' }}>
                  <div className="flex items-center mb-4">
                    <div className="flex mr-3" style={{ color: '#fbbf24' }}>
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.rating ? "★" : "☆"}>
                          {i < review.rating ? "★" : "☆"}
                        </span>
                      ))}
                    </div>
                    <span className="font-semibold" style={{ color: '#111827' }}>{review.reviewer_name}</span>
                  </div>
                  <p className="italic" style={{ color: '#374151' }}>"{review.comment}"</p>
                  <p className="text-sm mt-2" style={{ color: '#6b7280' }}>
                    {new Date(review.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Page finale - Contact */}
        <div className="h-[297mm] p-12 flex flex-col">
          <h2 className="text-4xl font-bold mb-8 border-b-4 pb-4" style={{ color: '#111827', borderColor: '#9333ea' }}>
            Contact & Réservations
          </h2>
          
          <div className="flex-1 flex">
            <div className="flex-1">
              <div className="space-y-6">
                {profileData.email && (
                  <div className="flex items-center text-lg" style={{ color: '#111827' }}>
                    <span className="font-semibold w-24">Email:</span>
                    <span>{profileData.email}</span>
                  </div>
                )}
                
                {profileData.phone && (
                  <div className="flex items-center text-lg" style={{ color: '#111827' }}>
                    <span className="font-semibold w-24">Téléphone:</span>
                    <span>{profileData.phone}</span>
                  </div>
                )}
                
                {profileData.website && (
                  <div className="flex items-center text-lg" style={{ color: '#111827' }}>
                    <span className="font-semibold w-24">Site web:</span>
                    <span>{profileData.website}</span>
                  </div>
                )}
              </div>

              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#111827' }}>Réseaux sociaux</h3>
                <div className="space-y-3">
                  {profileData.spotify_url && (
                    <div className="flex items-center" style={{ color: '#111827' }}>
                      <span className="font-semibold w-24">Spotify:</span>
                      <span className="text-sm">{profileData.spotify_url}</span>
                    </div>
                  )}
                  {profileData.youtube_url && (
                    <div className="flex items-center" style={{ color: '#111827' }}>
                      <span className="font-semibold w-24">YouTube:</span>
                      <span className="text-sm">{profileData.youtube_url}</span>
                    </div>
                  )}
                  {profileData.instagram_url && (
                    <div className="flex items-center" style={{ color: '#111827' }}>
                      <span className="font-semibold w-24">Instagram:</span>
                      <span className="text-sm">{profileData.instagram_url}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* QR Code section - placeholder for now */}
            <div className="w-64 flex flex-col items-center justify-center">
              <div className="w-48 h-48 border-2 border-dashed flex items-center justify-center mb-4" style={{ backgroundColor: '#e5e7eb', borderColor: '#9ca3af' }}>
                <span className="text-center" style={{ color: '#6b7280' }}>QR Code<br/>Profil en ligne</span>
              </div>
              <p className="text-center text-sm" style={{ color: '#4b5563' }}>
                Scannez pour accéder au profil complet
              </p>
            </div>
          </div>

          <div className="mt-auto pt-8 border-t-2 text-center" style={{ borderColor: '#e5e7eb' }}>
            <p className="text-lg font-semibold" style={{ color: '#374151' }}>
              Press Kit généré par Vybbi - Plateforme musicale professionnelle
            </p>
            <p className="text-sm mt-2" style={{ color: '#6b7280' }}>
              Créé le {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

PressKitTemplate.displayName = 'PressKitTemplate';