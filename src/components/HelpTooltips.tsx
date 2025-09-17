import { HelpCircle, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HelpTooltipProps {
  content: string;
  side?: "top" | "bottom" | "left" | "right";
}

export function HelpTooltip({ content, side = "top" }: HelpTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface InfoTooltipProps {
  title: string;
  description: string;
  side?: "top" | "bottom" | "left" | "right";
}

export function InfoTooltip({ title, description, side = "top" }: InfoTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-4 w-4 text-primary hover:text-primary/80 cursor-help" />
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-sm">
          <div className="space-y-1">
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export const HELP_MESSAGES = {
  auth: {
    profileType: "Choisissez le type de profil qui correspond le mieux à votre activité. Cela déterminera les fonctionnalités disponibles.",
    displayName: "Ce nom sera visible sur votre profil public. Vous pourrez le modifier plus tard.",
    password: "Utilisez un mot de passe fort avec au moins 8 caractères, incluant lettres, chiffres et symboles."
  },
  onboarding: {
    bio: "Décrivez-vous en quelques phrases. Cette biographie apparaîtra sur votre profil public.",
    genres: "Sélectionnez les genres musicaux qui vous correspondent. Vous pouvez en choisir plusieurs.",
    contact: "Ces informations permettront aux autres utilisateurs de vous contacter directement."
  },
  messaging: {
    firstMessage: "Présentez-vous brièvement et expliquez pourquoi vous souhaitez entrer en contact.",
    restrictions: "Les agents et managers peuvent envoyer un seul message initial. Les artistes peuvent répondre librement."
  },
  dashboard: {
    stats: "Ces statistiques reflètent votre activité sur la plateforme des 30 derniers jours.",
    profile: "Votre profil doit être complet et public pour être visible par les autres utilisateurs."
  }
};