import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MobileOptimizedCardProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  hover?: boolean;
}

export function MobileOptimizedCard({ 
  children, 
  className,
  padding = "md",
  hover = false
}: MobileOptimizedCardProps) {
  const paddingClasses = {
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6", 
    lg: "p-6 sm:p-8"
  };

  return (
    <Card className={cn(
      "mobile-card border-border/50 bg-card/50 backdrop-blur-sm",
      hover && "hover-lift cursor-pointer hover:border-primary/20 transition-all duration-200",
      className
    )}>
      <CardContent className={cn(paddingClasses[padding])}>
        {children}
      </CardContent>
    </Card>
  );
}