import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function LoadingSpinner({ size = "md", text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

interface LoadingPageProps {
  title?: string;
  description?: string;
}

export function LoadingPage({ title = "Chargement...", description }: LoadingPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <LoadingSpinner size="lg" />
          <h2 className="mt-4 text-lg font-semibold">{title}</h2>
          {description && (
            <p className="mt-2 text-sm text-muted-foreground text-center">
              {description}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface LoadingOverlayProps {
  isVisible: boolean;
  text?: string;
}

export function LoadingOverlay({ isVisible, text = "Chargement..." }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          <LoadingSpinner size="sm" />
          <span className="text-sm font-medium">{text}</span>
        </CardContent>
      </Card>
    </div>
  );
}