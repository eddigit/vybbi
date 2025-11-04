import { cn } from "@/lib/utils";
import { LAYOUT_CONFIG } from "@/lib/layoutConfig";
import { ReactNode } from "react";

interface SectionContainerProps {
  children: ReactNode;
  spacing?: 'section' | 'content' | 'compact';
  className?: string;
}

export function SectionContainer({ 
  children, 
  spacing = 'content',
  className 
}: SectionContainerProps) {
  return (
    <div className={cn(
      LAYOUT_CONFIG.spacing[spacing],
      className
    )}>
      {children}
    </div>
  );
}
