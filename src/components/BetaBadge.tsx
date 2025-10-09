import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface BetaBadgeProps {
  className?: string;
}

export const BetaBadge = ({ className }: BetaBadgeProps) => {
  return (
    <Badge 
      variant="secondary" 
      className={`animate-pulse bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 text-foreground font-semibold ${className}`}
    >
      <Sparkles className="w-3 h-3 mr-1" />
      Beta Paris • Places limitées • Statut Fondateur
    </Badge>
  );
};
