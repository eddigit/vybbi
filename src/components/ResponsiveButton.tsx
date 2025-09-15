import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ButtonProps } from "@/components/ui/button";
import { forwardRef } from "react";

interface ResponsiveButtonProps extends ButtonProps {
  mobileSize?: "sm" | "md" | "lg";
  desktopSize?: "sm" | "md" | "lg";
  fullWidthMobile?: boolean;
}

export const ResponsiveButton = forwardRef<HTMLButtonElement, ResponsiveButtonProps>(
  ({ className, mobileSize = "md", desktopSize = "md", fullWidthMobile = false, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "touch-target transition-all duration-200",
          // Mobile sizes
          mobileSize === "sm" && "h-8 px-3 text-xs sm:h-9 sm:px-4 sm:text-sm",
          mobileSize === "md" && "h-10 px-4 text-sm sm:h-10 sm:px-6 sm:text-base",
          mobileSize === "lg" && "h-12 px-6 text-base sm:h-12 sm:px-8 sm:text-lg",
          // Full width on mobile
          fullWidthMobile && "w-full sm:w-auto",
          // Hover effects
          "hover:scale-105 active:scale-95",
          className
        )}
        {...props}
      />
    );
  }
);

ResponsiveButton.displayName = "ResponsiveButton";