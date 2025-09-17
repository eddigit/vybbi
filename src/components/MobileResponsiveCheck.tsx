import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MobileResponsiveCheckProps {
  className?: string;
}

export function MobileResponsiveCheck({ className }: MobileResponsiveCheckProps) {
  const isMobile = useIsMobile();

  return (
    <Card className={cn("mobile-card", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-responsive-lg flex items-center gap-2">
          Responsive Check
          <Badge variant={isMobile ? "default" : "secondary"} className="text-xs">
            {isMobile ? "Mobile" : "Desktop"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Touch targets */}
        <div className="space-y-2">
          <h4 className="text-responsive-sm font-medium">Touch Targets</h4>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" className="touch-target text-xs">Small</Button>
            <Button size="default" className="touch-target text-sm">Medium</Button>
            <Button size="lg" className="touch-target">Large</Button>
          </div>
        </div>

        {/* Responsive text */}
        <div className="space-y-2">
          <h4 className="text-responsive-sm font-medium">Responsive Typography</h4>
          <div className="space-y-1">
            <p className="text-responsive-xs">Extra small text</p>
            <p className="text-responsive-sm">Small text</p>
            <p className="text-responsive-base">Base text</p>
            <p className="text-responsive-lg">Large text</p>
            <p className="text-responsive-xl">Extra large text</p>
          </div>
        </div>

        {/* Spacing */}
        <div className="space-y-2">
          <h4 className="text-responsive-sm font-medium">Mobile Spacing</h4>
          <div className="spacing-mobile bg-muted/30 rounded">
            <div className="padding-mobile bg-primary/10 rounded text-xs text-center">
              Mobile optimized padding
            </div>
          </div>
        </div>

        {/* Grid responsive */}
        <div className="space-y-2">
          <h4 className="text-responsive-sm font-medium">Responsive Grid</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <div className="bg-muted/30 p-2 rounded text-xs text-center">Col 1</div>
            <div className="bg-muted/30 p-2 rounded text-xs text-center">Col 2</div>
            <div className="bg-muted/30 p-2 rounded text-xs text-center">Col 3</div>
          </div>
        </div>

        {/* Safe areas */}
        <div className="space-y-2">
          <h4 className="text-responsive-sm font-medium">Safe Areas</h4>
          <div className="pt-safe-top pb-safe-bottom bg-muted/30 rounded p-2">
            <div className="text-xs text-center">
              Safe area padding applied
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// HOC pour wrapper les composants et les rendre mobile-first
export function withMobileOptimization<T extends React.ComponentType<any>>(
  Component: T
): React.ComponentType<React.ComponentProps<T>> {
  return function MobileOptimizedComponent(props) {
    return (
      <div className="mobile-optimized">
        <Component {...props} />
      </div>
    );
  };
}