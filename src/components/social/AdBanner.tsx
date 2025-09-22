import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, X } from "lucide-react";
import { useState } from "react";

interface AdBannerProps {
  type: 'sidebar' | 'horizontal' | 'square';
  title: string;
  description?: string;
  buttonText: string;
  imageUrl?: string;
  link?: string;
  sponsored?: boolean;
}

export function AdBanner({
  type = 'sidebar',
  title,
  description,
  buttonText,
  imageUrl,
  link = "#",
  sponsored = true
}: AdBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsVisible(false);
  };

  const handleClick = () => {
    if (link && link !== "#") {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  const getSizeClasses = () => {
    switch (type) {
      case 'horizontal':
        return 'w-full h-24 flex-row';
      case 'square':
        return 'aspect-square';
      default: // sidebar
        return 'w-full';
    }
  };

  return (
    <Card className={`bg-gradient-to-br from-muted/50 to-muted/30 border-border/30 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 relative overflow-hidden ${getSizeClasses()}`}>
      {sponsored && (
        <Badge 
          variant="secondary" 
          className="absolute top-2 left-2 z-10 text-xs bg-muted/80 text-muted-foreground"
        >
          Sponsorisé
        </Badge>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-1 right-1 z-10 w-6 h-6 p-0 hover:bg-destructive/20"
        onClick={handleClose}
      >
        <X className="w-3 h-3" />
      </Button>

      <CardContent 
        className={`p-4 h-full flex ${type === 'horizontal' ? 'flex-row items-center gap-4' : 'flex-col justify-between'}`}
        onClick={handleClick}
      >
        {imageUrl && (
          <div className={`${type === 'horizontal' ? 'w-16 h-16' : 'w-full h-24'} rounded-lg overflow-hidden flex-shrink-0`}>
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className={`${type === 'horizontal' ? 'flex-1' : 'space-y-2'}`}>
          <h4 className={`font-semibold ${type === 'horizontal' ? 'text-sm' : 'text-base'} text-foreground leading-tight`}>
            {title}
          </h4>
          
          {description && (
            <p className={`text-muted-foreground ${type === 'horizontal' ? 'text-xs line-clamp-2' : 'text-sm line-clamp-3'}`}>
              {description}
            </p>
          )}
          
          <Button 
            size={type === 'horizontal' ? 'sm' : 'default'}
            className={`${type === 'horizontal' ? 'mt-1 h-7 text-xs' : 'w-full mt-3'} bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70`}
          >
            {buttonText}
            <ExternalLink className={`${type === 'horizontal' ? 'w-3 h-3 ml-1' : 'w-4 h-4 ml-2'}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}