import { useState } from "react";
import { X, ArrowRight, Users, MessageSquare, Search, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WelcomeGuideProps {
  profileType: string;
  onComplete?: () => void;
  onNavigate?: (path: string) => void;
}

export function WelcomeGuide({ profileType, onComplete, onNavigate }: WelcomeGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const getStepsForProfile = (type: string) => {
    const commonSteps = [
      {
        icon: Users,
        title: "Complétez votre profil",
        description: "Un profil complet augmente vos chances d'être contacté",
        action: "Voir mon profil",
        path: "/dashboard"
      },
      {
        icon: Search,
        title: "Explorez la plateforme",
        description: "Découvrez les autres talents et opportunités",
        action: "Explorer",
        path: "/artists"
      }
    ];

    if (type === 'artist') {
      return [
        ...commonSteps,
        {
          icon: MessageSquare,
          title: "Recevez des propositions",
          description: "Les agents et organisateurs peuvent vous contacter directement",
          action: "Mes messages",
          path: "/messages"
        }
      ];
    } else {
      return [
        ...commonSteps,
        {
          icon: MessageSquare,
          title: "Contactez des artistes",
          description: "Envoyez un message pour proposer une collaboration",
          action: "Mes messages",
          path: "/messages"
        }
      ];
    }
  };

  const steps = getStepsForProfile(profileType);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.();
    }
  };

  const handleAction = (path: string) => {
    onNavigate?.(path);
    onComplete?.();
  };

  const currentStepData = steps[currentStep];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {currentStep + 1} / {steps.length}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onComplete}
            className="absolute right-2 top-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <currentStepData.icon className="h-5 w-5 text-primary" />
          </div>
          {currentStepData.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">
          {currentStepData.description}
        </p>

        <div className="flex gap-2">
          <Button
            onClick={() => handleAction(currentStepData.path)}
            className="flex-1"
          >
            {currentStepData.action}
          </Button>
          <Button
            variant="outline"
            onClick={handleNext}
            className="flex items-center gap-2"
          >
            {currentStep === steps.length - 1 ? "Terminer" : "Suivant"}
            {currentStep < steps.length - 1 && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 pt-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}