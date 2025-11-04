import { cn } from "@/lib/utils";
import { LAYOUT_CONFIG } from "@/lib/layoutConfig";
import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  width?: 'default' | 'wide' | 'narrow' | 'full';
  className?: string;
  verticalPadding?: boolean;
}

export function PageContainer({ 
  children, 
  width = 'default',
  verticalPadding = true,
  className 
}: PageContainerProps) {
  return (
    <div className={cn(
      "container mx-auto",
      LAYOUT_CONFIG.container.maxWidth[width],
      LAYOUT_CONFIG.container.padding.desktop,
      verticalPadding && LAYOUT_CONFIG.container.padding.vertical,
      className
    )}>
      {children}
    </div>
  );
}
