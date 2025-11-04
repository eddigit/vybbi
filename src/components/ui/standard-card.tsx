import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LAYOUT_CONFIG } from "@/lib/layoutConfig";
import { ReactNode } from "react";

interface StandardCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  padding?: 'default' | 'compact' | 'large';
  hover?: boolean;
  className?: string;
}

export function StandardCard({ 
  title, 
  description, 
  children, 
  footer,
  padding = 'default',
  hover = false,
  className 
}: StandardCardProps) {
  return (
    <Card className={cn(
      "bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden",
      hover && "hover:shadow-lg hover:border-primary/20 transition-all duration-200",
      className
    )}>
      {(title || description) && (
        <CardHeader className={LAYOUT_CONFIG.card.padding[padding]}>
          {title && <CardTitle className={LAYOUT_CONFIG.text.truncate.title}>{title}</CardTitle>}
          {description && <CardDescription className={LAYOUT_CONFIG.text.truncate.description}>{description}</CardDescription>}
        </CardHeader>
      )}
      
      <CardContent className={cn(
        LAYOUT_CONFIG.card.padding[padding],
        !title && !description && "pt-6",
        LAYOUT_CONFIG.card.spacing
      )}>
        {children}
      </CardContent>
      
      {footer && (
        <CardFooter className={LAYOUT_CONFIG.card.padding[padding]}>
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}
