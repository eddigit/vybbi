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
        className="w-[210mm] min-h-[297mm] mx-auto"
        style={{ 
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: '14px',
          lineHeight: '1.6',
          color: 'hsl(210 40% 98%)',
          backgroundColor: 'hsl(220 13% 9%)',
          backgroundImage: 'radial-gradient(circle at 50% 50%, hsl(270 69% 62% / 0.05), transparent 70%)'
        }}
      >
        {/* Page de couverture */}
        <div className="h-[297mm] flex flex-col relative p-12">
          {/* Header Vybbi branding */}
          <div className="absolute top-0 left-0 right-0 h-3" style={{ background: 'linear-gradient(135deg, hsl(270 69% 62%), hsl(290 69% 67%))' }}></div>
          
          {/* Logo Vybbi */}
          <div className="absolute top-6 right-12 flex items-center gap-3">
            <div className="text-lg font-bold" style={{ color: 'hsl(270 69% 62%)' }}>VYBBI</div>
            <div className="text-xs" style={{ color: 'hsl(217.2 32.6% 17.5%)' }}>PRESS KIT</div>
          </div>
          
          {/* Photo principale */}
          <div className="flex justify-center mb-8 mt-16">
            {profileData.avatar_url ? (
              <div className="relative">
                <img 
                  src={profileData.avatar_url} 
                  alt={profileData.display_name}
                  className="w-72 h-72 object-cover rounded-full shadow-2xl"
                  style={{ 
                    border: '6px solid hsl(270 69% 62%)',
                    boxShadow: '0 0 40px hsl(270 69% 62% / 0.3), 0 20px 40px hsl(220 13% 9% / 0.5)'
                  }}
                />
                <div className="absolute inset-0 rounded-full" style={{ 
                  background: 'linear-gradient(135deg, hsl(270 69% 62% / 0.1), transparent 70%)'
                }}></div>
              </div>
            ) : (
              <div className="w-72 h-72 rounded-full flex items-center justify-center text-7xl font-bold shadow-2xl border-6 relative" style={{ 
                background: 'linear-gradient(135deg, hsl(270 69% 62%), hsl(290 69% 67%))', 
                color: 'hsl(210 40% 98%)',
                border: '6px solid hsl(270 69% 62%)',
                boxShadow: '0 0 40px hsl(270 69% 62% / 0.3)'
              }}>
                {profileData.display_name.charAt(0)}
              </div>
            )}
          </div>

          {/* Nom de l'artiste */}
          <h1 className="text-7xl font-bold text-center mb-6" style={{ 
            color: 'hsl(210 40% 98%)',
            textShadow: '0 0 30px hsl(270 69% 62% / 0.5)',
            background: 'linear-gradient(135deg, hsl(270 69% 62%), hsl(290 69% 67%))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {profileData.display_name}
          </h1>

          {/* Genres */}
          {profileData.genres && profileData.genres.length > 0 && (
            <div className="text-center mb-12">
              <div className="inline-flex flex-wrap gap-3 justify-center">
                {profileData.genres.map((genre, index) => (
                  <span 
                    key={index}
                    className="px-6 py-3 rounded-full text-base font-semibold backdrop-blur-sm"
                    style={{ 
                      background: 'linear-gradient(135deg, hsl(270 69% 62%), hsl(290 69% 67%))',
                      color: 'hsl(210 40% 98%)',
                      border: '1px solid hsl(270 69% 62% / 0.3)',
                      boxShadow: '0 4px 15px hsl(270 69% 62% / 0.2)'
                    }}
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Localisation */}
          {profileData.location && (
            <p className="text-center text-xl mb-16 flex items-center justify-center gap-2" style={{ color: 'hsl(217.2 32.6% 17.5%)' }}>
              <span style={{ color: 'hsl(270 69% 62%)' }}>📍</span>
              {profileData.location}
            </p>
          )}

          {/* Stats en bas */}
          <div className="mt-auto">
            <div className="grid grid-cols-3 gap-8 text-center border-t-2 pt-8" style={{ borderColor: 'hsl(270 69% 62% / 0.3)' }}>
              <div className="p-4 rounded-lg backdrop-blur-sm" style={{ background: 'hsl(270 69% 62% / 0.1)', border: '1px solid hsl(270 69% 62% / 0.2)' }}>
                <div className="text-4xl font-bold mb-2" style={{ color: 'hsl(270 69% 62%)' }}>{events?.length || 0}</div>
                <div className="text-sm uppercase tracking-wide" style={{ color: 'hsl(217.2 32.6% 17.5%)' }}>Événements</div>
              </div>
              <div className="p-4 rounded-lg backdrop-blur-sm" style={{ background: 'hsl(270 69% 62% / 0.1)', border: '1px solid hsl(270 69% 62% / 0.2)' }}>
                <div className="text-4xl font-bold mb-2" style={{ color: 'hsl(270 69% 62%)' }}>{averageRating.toFixed(1)}/5</div>
                <div className="text-sm uppercase tracking-wide" style={{ color: 'hsl(217.2 32.6% 17.5%)' }}>Note moyenne</div>
              </div>
              <div className="p-4 rounded-lg backdrop-blur-sm" style={{ background: 'hsl(270 69% 62% / 0.1)', border: '1px solid hsl(270 69% 62% / 0.2)' }}>
                <div className="text-4xl font-bold mb-2" style={{ color: 'hsl(270 69% 62%)' }}>{reviews?.length || 0}</div>
                <div className="text-sm uppercase tracking-wide" style={{ color: 'hsl(217.2 32.6% 17.5%)' }}>Avis</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 h-3" style={{ background: 'linear-gradient(135deg, hsl(270 69% 62%), hsl(290 69% 67%))' }}></div>
        </div>

        {/* Page 2 - Biographie */}
        <div className="h-[297mm] p-12 flex flex-col">
          <h2 className="text-5xl font-bold mb-8 border-b-4 pb-4" style={{ 
            color: 'hsl(210 40% 98%)', 
            borderColor: 'hsl(270 69% 62%)',
            background: 'linear-gradient(135deg, hsl(270 69% 62%), hsl(290 69% 67%))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Biographie
          </h2>
          
          <div className="flex-1 flex gap-8">
            <div className="flex-1">
              {profileData.bio ? (
                <div className="text-lg leading-relaxed whitespace-pre-wrap" style={{ color: 'hsl(210 40% 98%)' }}>
                  {profileData.bio}
                </div>
              ) : (
                <p className="italic text-lg" style={{ color: 'hsl(217.2 32.6% 17.5%)' }}>Biographie non disponible</p>
              )}
            </div>
            
            {/* Sidebar avec infos complémentaires */}
            <div className="w-64 p-6 rounded-lg backdrop-blur-sm" style={{ 
              background: 'hsl(270 69% 62% / 0.1)', 
              border: '1px solid hsl(270 69% 62% / 0.2)',
              boxShadow: '0 4px 15px hsl(270 69% 62% / 0.1)'
            }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'hsl(270 69% 62%)' }}>Informations</h3>
              
              {profileData.genres && profileData.genres.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2" style={{ color: 'hsl(210 40% 98%)' }}>Genres musicaux</h4>
                  <div className="flex flex-wrap gap-1">
                    {profileData.genres.map((genre, index) => (
                      <span key={index} className="text-xs px-2 py-1 rounded" style={{ 
                        background: 'hsl(270 69% 62% / 0.2)', 
                        color: 'hsl(270 69% 62%)',
                        border: '1px solid hsl(270 69% 62% / 0.3)'
                      }}>
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {upcomingEvents.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2" style={{ color: 'hsl(210 40% 98%)' }}>Prochains événements</h4>
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="text-sm mb-2 p-2 rounded" style={{ 
                      color: 'hsl(217.2 32.6% 17.5%)',
                      background: 'hsl(270 69% 62% / 0.1)'
                    }}>
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
            <h2 className="text-5xl font-bold mb-8 border-b-4 pb-4" style={{ 
              color: 'hsl(210 40% 98%)', 
              borderColor: 'hsl(270 69% 62%)',
              background: 'linear-gradient(135deg, hsl(270 69% 62%), hsl(290 69% 67%))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Photos & Médias
            </h2>
            
            <div className="grid grid-cols-2 gap-6 h-3/4">
              {mediaAssets.slice(0, 4).map((asset, index) => (
                <div key={index} className="relative overflow-hidden rounded-lg shadow-2xl" style={{
                  border: '2px solid hsl(270 69% 62% / 0.3)',
                  boxShadow: '0 10px 30px hsl(270 69% 62% / 0.2)'
                }}>
                  <img 
                    src={asset.url} 
                    alt={`Média ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, hsl(270 69% 62% / 0.1), hsl(290 69% 67% / 0.1))';
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0" style={{ 
                    background: 'linear-gradient(45deg, hsl(270 69% 62% / 0.1), transparent 50%)'
                  }}></div>
                </div>
              ))}
            </div>
            
            <p className="text-center mt-6 italic text-lg" style={{ color: 'hsl(217.2 32.6% 17.5%)' }}>
              Photos haute résolution disponibles sur demande via Vybbi
            </p>
          </div>
        )}

        {/* Page 4 - Témoignages */}
        {reviews && reviews.length > 0 && (
          <div className="h-[297mm] p-12">
            <h2 className="text-5xl font-bold mb-8 border-b-4 pb-4" style={{ 
              color: 'hsl(210 40% 98%)', 
              borderColor: 'hsl(270 69% 62%)',
              background: 'linear-gradient(135deg, hsl(270 69% 62%), hsl(290 69% 67%))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Témoignages
            </h2>
            
            <div className="space-y-8">
              {reviews.slice(0, 3).map((review, index) => (
                <div key={index} className="p-6 rounded-lg border-l-4 backdrop-blur-sm" style={{ 
                  background: 'hsl(270 69% 62% / 0.1)', 
                  borderColor: 'hsl(270 69% 62%)',
                  border: '1px solid hsl(270 69% 62% / 0.2)',
                  borderLeft: '4px solid hsl(270 69% 62%)',
                  boxShadow: '0 4px 15px hsl(270 69% 62% / 0.1)'
                }}>
                  <div className="flex items-center mb-4">
                    <div className="flex mr-3 text-xl" style={{ color: 'hsl(270 69% 62%)' }}>
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>
                          {i < review.rating ? "★" : "☆"}
                        </span>
                      ))}
                    </div>
                    <span className="font-semibold text-lg" style={{ color: 'hsl(210 40% 98%)' }}>{review.reviewer_name}</span>
                  </div>
                  <p className="italic text-lg mb-3" style={{ color: 'hsl(217.2 32.6% 17.5%)' }}>"{review.comment}"</p>
                  <p className="text-sm" style={{ color: 'hsl(217.2 32.6% 17.5%)' }}>
                    {new Date(review.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Page finale - Contact */}
        <div className="h-[297mm] p-12 flex flex-col">
          <h2 className="text-5xl font-bold mb-8 border-b-4 pb-4" style={{ 
            color: 'hsl(210 40% 98%)', 
            borderColor: 'hsl(270 69% 62%)',
            background: 'linear-gradient(135deg, hsl(270 69% 62%), hsl(290 69% 67%))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Contact & Réservations
          </h2>
          
          <div className="flex-1 flex gap-8">
            <div className="flex-1">
              <div className="space-y-6">
                {profileData.email && (
                  <div className="flex items-center text-lg p-4 rounded-lg backdrop-blur-sm" style={{ 
                    color: 'hsl(210 40% 98%)',
                    background: 'hsl(270 69% 62% / 0.1)',
                    border: '1px solid hsl(270 69% 62% / 0.2)'
                  }}>
                    <span className="font-semibold w-28" style={{ color: 'hsl(270 69% 62%)' }}>Email:</span>
                    <span>{profileData.email}</span>
                  </div>
                )}
                
                {profileData.phone && (
                  <div className="flex items-center text-lg p-4 rounded-lg backdrop-blur-sm" style={{ 
                    color: 'hsl(210 40% 98%)',
                    background: 'hsl(270 69% 62% / 0.1)',
                    border: '1px solid hsl(270 69% 62% / 0.2)'
                  }}>
                    <span className="font-semibold w-28" style={{ color: 'hsl(270 69% 62%)' }}>Téléphone:</span>
                    <span>{profileData.phone}</span>
                  </div>
                )}
                
                {profileData.website && (
                  <div className="flex items-center text-lg p-4 rounded-lg backdrop-blur-sm" style={{ 
                    color: 'hsl(210 40% 98%)',
                    background: 'hsl(270 69% 62% / 0.1)',
                    border: '1px solid hsl(270 69% 62% / 0.2)'
                  }}>
                    <span className="font-semibold w-28" style={{ color: 'hsl(270 69% 62%)' }}>Site web:</span>
                    <span>{profileData.website}</span>
                  </div>
                )}
              </div>

              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-6" style={{ color: 'hsl(270 69% 62%)' }}>Réseaux sociaux & Streaming</h3>
                <div className="space-y-4">
                  {profileData.spotify_url && (
                    <div className="flex items-center p-3 rounded-lg backdrop-blur-sm" style={{ 
                      color: 'hsl(210 40% 98%)',
                      background: 'hsl(270 69% 62% / 0.1)',
                      border: '1px solid hsl(270 69% 62% / 0.2)'
                    }}>
                      <span className="font-semibold w-24" style={{ color: 'hsl(270 69% 62%)' }}>Spotify:</span>
                      <span className="text-sm break-all">{profileData.spotify_url}</span>
                    </div>
                  )}
                  {profileData.youtube_url && (
                    <div className="flex items-center p-3 rounded-lg backdrop-blur-sm" style={{ 
                      color: 'hsl(210 40% 98%)',
                      background: 'hsl(270 69% 62% / 0.1)',
                      border: '1px solid hsl(270 69% 62% / 0.2)'
                    }}>
                      <span className="font-semibold w-24" style={{ color: 'hsl(270 69% 62%)' }}>YouTube:</span>
                      <span className="text-sm break-all">{profileData.youtube_url}</span>
                    </div>
                  )}
                  {profileData.instagram_url && (
                    <div className="flex items-center p-3 rounded-lg backdrop-blur-sm" style={{ 
                      color: 'hsl(210 40% 98%)',
                      background: 'hsl(270 69% 62% / 0.1)',
                      border: '1px solid hsl(270 69% 62% / 0.2)'
                    }}>
                      <span className="font-semibold w-24" style={{ color: 'hsl(270 69% 62%)' }}>Instagram:</span>
                      <span className="text-sm break-all">{profileData.instagram_url}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* QR Code section amélioré */}
            <div className="w-64 flex flex-col items-center justify-center">
              <div className="w-48 h-48 border-2 rounded-lg flex flex-col items-center justify-center mb-4 backdrop-blur-sm" style={{ 
                background: 'linear-gradient(135deg, hsl(270 69% 62% / 0.2), hsl(290 69% 67% / 0.2))', 
                borderColor: 'hsl(270 69% 62%)',
                boxShadow: '0 4px 15px hsl(270 69% 62% / 0.2)'
              }}>
                <div className="text-6xl mb-2" style={{ color: 'hsl(270 69% 62%)' }}>📱</div>
                <span className="text-center font-semibold" style={{ color: 'hsl(210 40% 98%)' }}>QR Code</span>
                <span className="text-center text-sm" style={{ color: 'hsl(217.2 32.6% 17.5%)' }}>Profil Vybbi</span>
              </div>
              <p className="text-center text-sm" style={{ color: 'hsl(217.2 32.6% 17.5%)' }}>
                Scannez pour accéder au profil complet sur Vybbi
              </p>
            </div>
          </div>

          <div className="mt-auto pt-8 border-t-2 text-center" style={{ borderColor: 'hsl(270 69% 62% / 0.3)' }}>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ 
                background: 'linear-gradient(135deg, hsl(270 69% 62%), hsl(290 69% 67%))'
              }}>
                <span className="text-xl font-bold" style={{ color: 'hsl(210 40% 98%)' }}>V</span>
              </div>
              <div>
                <p className="text-xl font-bold" style={{ color: 'hsl(270 69% 62%)' }}>
                  Press Kit généré par VYBBI
                </p>
                <p className="text-sm" style={{ color: 'hsl(217.2 32.6% 17.5%)' }}>
                  Plateforme musicale professionnelle - vybbi.com
                </p>
              </div>
            </div>
            <p className="text-sm" style={{ color: 'hsl(217.2 32.6% 17.5%)' }}>
              Créé le {new Date().toLocaleDateString('fr-FR')} • Version {new Date().getTime()}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

PressKitTemplate.displayName = 'PressKitTemplate';