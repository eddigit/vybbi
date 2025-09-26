import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProfileType } from '@/lib/types';
import { 
  Music, 
  MapPin, 
  Users, 
  Crown,
  ArrowRight,
  CheckCircle,
  Edit,
  Calendar,
  Search,
  MessageSquare,
  Settings,
  Sparkles
} from 'lucide-react';
import { AutoTranslate } from '@/components/AutoTranslate';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileType: ProfileType;
  displayName: string;
  onNavigate: (path: string) => void;
}

const welcomeContent = {
  artist: {
    icon: Music,
    title: "Bienvenue sur Vybbi !",
    subtitle: "Vous êtes maintenant connecté à un réseau mondial de professionnels de la musique.",
    description: "Vybbi vous offre l'accès aux meilleures opportunités artistiques et vous connecte avec des agents, managers et organisateurs prestigieux.",
    gradient: "from-purple-600 to-pink-600",
    steps: [
      {
        icon: Edit,
        title: "Complétez votre profil",
        description: "Ajoutez vos genres, expériences et médias pour attirer les recruteurs",
        action: "/artist/profile/edit",
        actionText: "Éditer mon profil"
      },
      {
        icon: Search,
        title: "Explorez les annonces",
        description: "Découvrez les opportunités qui correspondent à votre style",
        action: "/annonces",
        actionText: "Voir les annonces"
      },
      {
        icon: MessageSquare,
        title: "Restez connecté",
        description: "Activez les notifications pour ne rater aucune opportunité",
        action: "/messages",
        actionText: "Voir mes messages"
      }
    ],
    quickActions: [
      { label: "Mon profil", path: "/artist/profile/edit", icon: Edit },
      { label: "Annonces", path: "/annonces", icon: Search },
      { label: "Messages", path: "/messages", icon: MessageSquare }
    ]
  },
  agent: {
    icon: Users,
    title: "Bienvenue Agent !",
    subtitle: "Vous pouvez désormais découvrir et représenter des talents exceptionnels.",
    description: "Vybbi vous donne accès à un vivier d'artistes talentueux et vous aide à développer votre portefeuille d'artistes.",
    gradient: "from-blue-600 to-cyan-600",
    steps: [
      {
        icon: Edit,
        title: "Configurez votre profil",
        description: "Présentez votre agence et votre expertise au marché",
        action: "/agent/profile/edit",
        actionText: "Éditer mon profil"
      },
      {
        icon: Calendar,
        title: "Créez vos annonces",
        description: "Publiez vos recherches d'artistes pour vos projets",
        action: "/annonces/create",
        actionText: "Créer une annonce"
      },
      {
        icon: Users,
        title: "Découvrez les talents",
        description: "Explorez les profils d'artistes et contactez-les",
        action: "/artists",
        actionText: "Voir les artistes"
      }
    ],
    quickActions: [
      { label: "Mon profil", path: "/agent/profile/edit", icon: Edit },
      { label: "Créer annonce", path: "/annonces/create", icon: Calendar },
      { label: "Artistes", path: "/artists", icon: Users }
    ]
  },
  manager: {
    icon: Crown,
    title: "Bienvenue Manager !",
    subtitle: "Gérez et développez la carrière de vos artistes avec efficacité.",
    description: "Vybbi vous offre les outils pour promouvoir vos artistes et développer leur réseau professionnel.",
    gradient: "from-emerald-600 to-teal-600",
    steps: [
      {
        icon: Edit,
        title: "Configurez votre profil",
        description: "Mettez en avant votre expérience et vos succès",
        action: "/manager/profile/edit",
        actionText: "Éditer mon profil"
      },
      {
        icon: Users,
        title: "Gérez vos artistes",
        description: "Ajoutez et promouvez les artistes que vous représentez",
        action: "/my-artists",
        actionText: "Mes artistes"
      },
      {
        icon: Calendar,
        title: "Créez des opportunités",
        description: "Publiez des annonces pour développer leur carrière",
        action: "/annonces/create",
        actionText: "Créer une annonce"
      }
    ],
    quickActions: [
      { label: "Mon profil", path: "/manager/profile/edit", icon: Edit },
      { label: "Mes artistes", path: "/my-artists", icon: Users },
      { label: "Créer annonce", path: "/annonces/create", icon: Calendar }
    ]
  },
  lieu: {
    icon: MapPin,
    title: "Bienvenue Organisateur !",
    subtitle: "Votre établissement peut maintenant attirer les meilleurs talents.",
    description: "Vybbi vous connecte avec des artistes de qualité et vous aide à organiser des événements mémorables.",
    gradient: "from-orange-600 to-red-600",
    steps: [
      {
        icon: Edit,
        title: "Configurez votre espace",
        description: "Présentez votre organisation et ses caractéristiques",
        action: "/lieux/profile/edit",
        actionText: "Éditer mon profil"
      },
      {
        icon: Calendar,
        title: "Créez vos événements",
        description: "Programmez et publiez vos événements",
        action: "/events/create",
        actionText: "Créer un événement"
      },
      {
        icon: Users,
        title: "Recrutez des artistes",
        description: "Découvrez et contactez les artistes parfaits",
        action: "/artists",
        actionText: "Voir les artistes"
      }
    ],
    quickActions: [
      { label: "Mon profil", path: "/lieux/profile/edit", icon: Edit },
      { label: "Créer événement", path: "/events/create", icon: Calendar },
      { label: "Artistes", path: "/artists", icon: Users }
    ]
  },
  influenceur: {
    icon: Sparkles,
    title: "Bienvenue Influenceur !",
    subtitle: "Monétisez votre audience en recommandant Vybbi.",
    description: "Gagnez des commissions en parrainant de nouveaux utilisateurs sur la plateforme Vybbi.",
    gradient: "from-pink-600 to-purple-600",
    steps: [
      {
        icon: Edit,
        title: "Configurez votre profil",
        description: "Présentez votre audience et vos contenus",
        action: "/influencer/profile/edit",
        actionText: "Éditer mon profil"
      },
      {
        icon: Settings,
        title: "Créez vos liens",
        description: "Générez vos liens de parrainage personnalisés",
        action: "/dashboard",
        actionText: "Tableau de bord"
      },
      {
        icon: CheckCircle,
        title: "Suivez vos gains",
        description: "Analysez vos performances et vos commissions",
        action: "/commissions",
        actionText: "Mes commissions"
      }
    ],
    quickActions: [
      { label: "Mon profil", path: "/influencer/profile/edit", icon: Edit },
      { label: "Tableau de bord", path: "/dashboard", icon: Settings },
      { label: "Commissions", path: "/commissions", icon: CheckCircle }
    ]
  }
};

export function WelcomeModal({ isOpen, onClose, profileType, displayName, onNavigate }: WelcomeModalProps) {
  const content = welcomeContent[profileType];
  const IconComponent = content.icon;

  const handleNavigateAndClose = (path: string) => {
    onNavigate(path);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto">
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${content.gradient} flex items-center justify-center shadow-glow`}>
              <IconComponent className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <div className="space-y-2">
            <DialogTitle className="text-3xl font-bold">
              <AutoTranslate text={content.title} />
            </DialogTitle>
            <Badge variant="outline" className="text-sm">
              <AutoTranslate text={`Salut ${displayName} 👋`} />
            </Badge>
          </div>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            <AutoTranslate text={content.subtitle} />
          </p>
          
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            <AutoTranslate text={content.description} />
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-8">
          {/* Steps to get started */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <AutoTranslate text="Premiers pas recommandés" />
            </h3>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {content.steps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div key={index} className="p-3 sm:p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <StepIcon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="space-y-2 flex-1 min-w-0">
                        <h4 className="font-medium text-sm">
                          <AutoTranslate text={step.title} />
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          <AutoTranslate text={step.description} />
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2 text-xs sm:text-sm touch-target"
                          onClick={() => handleNavigateAndClose(step.action)}
                        >
                          <AutoTranslate text={step.actionText} />
                          <ArrowRight className="w-3 h-3 ml-1 flex-shrink-0" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick actions */}
          <div className="border-t pt-6">
            <h4 className="font-medium mb-3">
              <AutoTranslate text="Accès rapides" />
            </h4>
            <div className="flex flex-wrap gap-2">
              {content.quickActions.map((action, index) => {
                const ActionIcon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigateAndClose(action.path)}
                    className="flex items-center gap-2 text-xs sm:text-sm touch-target"
                  >
                    <ActionIcon className="w-4 h-4 flex-shrink-0" />
                    <AutoTranslate text={action.label} />
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t pt-6">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-sm order-2 sm:order-1 w-full sm:w-auto touch-target"
            >
              <AutoTranslate text="Passer pour le moment" />
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => handleNavigateAndClose('/dashboard')}
                className="w-full sm:w-auto text-sm touch-target"
              >
                <AutoTranslate text="Aller au tableau de bord" />
              </Button>
              <Button
                onClick={() => handleNavigateAndClose(content.steps[0].action)}
                className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 w-full sm:w-auto text-sm touch-target"
              >
                <AutoTranslate text="Commencer maintenant" />
                <ArrowRight className="w-4 h-4 ml-2 flex-shrink-0" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}