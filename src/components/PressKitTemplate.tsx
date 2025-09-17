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
        className="bg-white text-black w-[210mm] min-h-[297mm] mx-auto font-serif"
        style={{ 
          fontFamily: 'Georgia, serif',
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#000000'
        }}
      >
        {/* Page de couverture */}
        <div className="h-[297mm] flex flex-col relative p-12">
          {/* Header avec logo/branding */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-600 to-pink-600"></div>
          
          {/* Photo principale */}
          <div className="flex justify-center mb-8">
            {profileData.avatar_url ? (
              <img 
                src={profileData.avatar_url} 
                alt={profileData.display_name}
                className="w-64 h-64 object-cover rounded-full shadow-2xl border-4 border-gray-200"
              />
            ) : (
              <div className="w-64 h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center text-6xl font-bold text-purple-600 shadow-2xl border-4 border-gray-200">
                {profileData.display_name.charAt(0)}
              </div>
            )}
          </div>

          {/* Nom de l'artiste */}
          <h1 className="text-6xl font-bold text-center mb-4 text-gray-900">
            {profileData.display_name}
          </h1>

          {/* Genres */}
          {profileData.genres && profileData.genres.length > 0 && (
            <div className="text-center mb-8">
              <div className="inline-flex flex-wrap gap-2 justify-center">
                {profileData.genres.map((genre, index) => (
                  <span 
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-semibold"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Localisation */}
          {profileData.location && (
            <p className="text-center text-xl text-gray-600 mb-12">
              📍 {profileData.location}
            </p>
          )}

          {/* Stats en bas */}
          <div className="mt-auto">
            <div className="grid grid-cols-3 gap-8 text-center border-t-2 border-gray-200 pt-8">
              <div>
                <div className="text-3xl font-bold text-purple-600">{events?.length || 0}</div>
                <div className="text-sm text-gray-600 uppercase tracking-wide">Événements</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">{averageRating.toFixed(1)}/5</div>
                <div className="text-sm text-gray-600 uppercase tracking-wide">Note moyenne</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">{reviews?.length || 0}</div>
                <div className="text-sm text-gray-600 uppercase tracking-wide">Avis</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-600 to-pink-600"></div>
        </div>

        {/* Page 2 - Biographie */}
        <div className="h-[297mm] p-12 flex flex-col">
          <h2 className="text-4xl font-bold mb-8 text-gray-900 border-b-4 border-purple-600 pb-4">
            Biographie
          </h2>
          
          <div className="flex-1 flex gap-8">
            <div className="flex-1">
              {profileData.bio ? (
                <div className="text-base leading-relaxed text-gray-800 whitespace-pre-wrap">
                  {profileData.bio}
                </div>
              ) : (
                <p className="text-gray-500 italic">Biographie non disponible</p>
              )}
            </div>
            
            {/* Sidebar avec infos complémentaires */}
            <div className="w-64 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Informations</h3>
              
              {profileData.genres && profileData.genres.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Genres musicaux</h4>
                  <div className="flex flex-wrap gap-1">
                    {profileData.genres.map((genre, index) => (
                      <span key={index} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {upcomingEvents.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Prochains événements</h4>
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="text-xs text-gray-600 mb-1">
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
            <h2 className="text-4xl font-bold mb-8 text-gray-900 border-b-4 border-purple-600 pb-4">
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
            
            <p className="text-center text-gray-600 mt-4 italic">
              Photos haute résolution disponibles sur demande
            </p>
          </div>
        )}

        {/* Page 4 - Témoignages */}
        {reviews && reviews.length > 0 && (
          <div className="h-[297mm] p-12">
            <h2 className="text-4xl font-bold mb-8 text-gray-900 border-b-4 border-purple-600 pb-4">
              Témoignages
            </h2>
            
            <div className="space-y-8">
              {reviews.slice(0, 3).map((review, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg border-l-4 border-purple-600">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400 mr-3">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.rating ? "★" : "☆"}>
                          {i < review.rating ? "★" : "☆"}
                        </span>
                      ))}
                    </div>
                    <span className="font-semibold text-gray-900">{review.reviewer_name}</span>
                  </div>
                  <p className="text-gray-700 italic">"{review.comment}"</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(review.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Page finale - Contact */}
        <div className="h-[297mm] p-12 flex flex-col">
          <h2 className="text-4xl font-bold mb-8 text-gray-900 border-b-4 border-purple-600 pb-4">
            Contact & Réservations
          </h2>
          
          <div className="flex-1 flex">
            <div className="flex-1">
              <div className="space-y-6">
                {profileData.email && (
                  <div className="flex items-center text-lg">
                    <span className="font-semibold w-24">Email:</span>
                    <span>{profileData.email}</span>
                  </div>
                )}
                
                {profileData.phone && (
                  <div className="flex items-center text-lg">
                    <span className="font-semibold w-24">Téléphone:</span>
                    <span>{profileData.phone}</span>
                  </div>
                )}
                
                {profileData.website && (
                  <div className="flex items-center text-lg">
                    <span className="font-semibold w-24">Site web:</span>
                    <span>{profileData.website}</span>
                  </div>
                )}
              </div>

              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Réseaux sociaux</h3>
                <div className="space-y-3">
                  {profileData.spotify_url && (
                    <div className="flex items-center">
                      <span className="font-semibold w-24">Spotify:</span>
                      <span className="text-sm">{profileData.spotify_url}</span>
                    </div>
                  )}
                  {profileData.youtube_url && (
                    <div className="flex items-center">
                      <span className="font-semibold w-24">YouTube:</span>
                      <span className="text-sm">{profileData.youtube_url}</span>
                    </div>
                  )}
                  {profileData.instagram_url && (
                    <div className="flex items-center">
                      <span className="font-semibold w-24">Instagram:</span>
                      <span className="text-sm">{profileData.instagram_url}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* QR Code section - placeholder for now */}
            <div className="w-64 flex flex-col items-center justify-center">
              <div className="w-48 h-48 bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center mb-4">
                <span className="text-gray-500 text-center">QR Code<br/>Profil en ligne</span>
              </div>
              <p className="text-center text-sm text-gray-600">
                Scannez pour accéder au profil complet
              </p>
            </div>
          </div>

          <div className="mt-auto pt-8 border-t-2 border-gray-200 text-center">
            <p className="text-lg font-semibold text-gray-700">
              Press Kit généré par Vybbi - Plateforme musicale professionnelle
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Créé le {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

PressKitTemplate.displayName = 'PressKitTemplate';