import { Euro, Clock, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Profile } from '@/lib/types';

interface PricingIndicatorProps {
  artist: Profile;
  className?: string;
}

interface PricingTier {
  type: string;
  basePrice: string;
  duration: string;
  includes: string[];
  icon: React.ReactNode;
}

export function PricingIndicator({ artist, className = '' }: PricingIndicatorProps) {
  // Generate pricing tiers based on artist's experience and genres
  const generatePricingTiers = (): PricingTier[] => {
    const baseMultiplier = getExperienceMultiplier(artist.experience);
    const genreMultiplier = getGenreMultiplier(artist.genres);
    
    const basePrice = 500 * baseMultiplier * genreMultiplier;
    
    return [
      {
        type: 'Concert Solo',
        basePrice: `${Math.round(basePrice * 0.8)} - ${Math.round(basePrice * 1.2)}€`,
        duration: '1-2 heures',
        includes: ['Prestation musicale', 'Matériel de base', 'Déplacement local'],
        icon: <Users className="h-4 w-4" />
      },
      {
        type: 'Événement Privé',
        basePrice: `${Math.round(basePrice * 1.2)} - ${Math.round(basePrice * 1.8)}€`,
        duration: '2-4 heures',
        includes: ['Prestation personnalisée', 'Playlist adaptée', 'Interaction publique', 'Déplacement inclus'],
        icon: <MapPin className="h-4 w-4" />
      },
      {
        type: 'Festival/Grande Scène',
        basePrice: `${Math.round(basePrice * 1.5)} - ${Math.round(basePrice * 3)}€`,
        duration: '45-90 minutes',
        includes: ['Performance scénique', 'Matériel professionnel', 'Équipe technique', 'Catering'],
        icon: <Clock className="h-4 w-4" />
      }
    ];
  };

  const getExperienceMultiplier = (experience?: string): number => {
    if (!experience) return 1;
    const exp = experience.toLowerCase();
    if (exp.includes('débutant')) return 0.7;
    if (exp.includes('amateur')) return 0.8;
    if (exp.includes('semi-pro')) return 1.1;
    if (exp.includes('professionnel')) return 1.4;
    if (exp.includes('expert')) return 1.8;
    return 1;
  };

  const getGenreMultiplier = (genres?: string[]): number => {
    if (!genres || genres.length === 0) return 1;
    
    const premiumGenres = ['jazz', 'classique', 'soul', 'funk'];
    const standardGenres = ['pop', 'rock', 'folk', 'country'];
    
    const hasPremium = genres.some(g => premiumGenres.includes(g.toLowerCase()));
    const hasStandard = genres.some(g => standardGenres.includes(g.toLowerCase()));
    
    if (hasPremium) return 1.2;
    if (hasStandard) return 1.0;
    return 0.9;
  };

  const pricingTiers = generatePricingTiers();

  return (
    <Card className={`border-border bg-card ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
          <Euro className="h-5 w-5" />
          Tarification indicative
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Prix estimés selon le type d'événement
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {pricingTiers.map((tier, index) => (
          <div key={index} className="p-4 bg-muted/50 rounded-lg border border-border/50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="text-primary">
                  {tier.icon}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{tier.type}</div>
                  <div className="text-sm text-muted-foreground">{tier.duration}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg text-primary">
                  {tier.basePrice}
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              {tier.includes.map((item, itemIndex) => (
                <div key={itemIndex} className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-3 border-t border-border/50 space-y-2">
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              Devis personnalisé
            </Badge>
            <Badge variant="outline" className="text-xs">
              Négociable
            </Badge>
            <Badge variant="outline" className="text-xs">
              Frais déplacement en sus
            </Badge>
          </div>
          
          <div className="text-xs text-muted-foreground text-center pt-2">
            💡 <strong>Prix indicatifs</strong> - Contactez pour un devis précis
          </div>
        </div>
      </CardContent>
    </Card>
  );
}