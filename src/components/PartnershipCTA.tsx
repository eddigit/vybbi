import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface PartnershipCTAProps {
  variant?: 'default' | 'outline';
  source: string; // Pour UTM tracking
  size?: 'default' | 'lg';
  className?: string;
}

export const PartnershipCTA = ({ 
  variant = 'default', 
  source, 
  size = 'lg',
  className 
}: PartnershipCTAProps) => {
  const calendlyUrl = `https://calendly.com/vybbiapp/30min?utm_source=${source}&utm_medium=website&utm_campaign=launch-paris`;
  
  const handleClick = () => {
    // Analytics event (si Google Analytics configuré)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'partnership_cta_click', {
        event_category: 'Partnership',
        event_label: source,
      });
    }
  };
  
  return (
    <Button 
      variant={variant} 
      size={size}
      className={className}
      asChild
      onClick={handleClick}
    >
      <a 
        href={calendlyUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        aria-label="Réserver un call de 15 minutes – Launch Partner Paris"
        data-event="cta_launch_partner_paris_page"
      >
        Réserver un call de 15 min aujourd'hui
        <ArrowRight className="ml-2 h-4 w-4" />
      </a>
    </Button>
  );
};
