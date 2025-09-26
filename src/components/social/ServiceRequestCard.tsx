import { ServiceRequest } from "@/types/social";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Euro, 
  Calendar, 
  Clock, 
  Handshake,
  Music,
  Building,
  Users,
  Star
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ServiceRequestCardProps {
  serviceRequest: ServiceRequest;
  authorName: string;
  authorAvatar?: string;
  authorProfileType: string;
  onApply?: () => void;
}

export function ServiceRequestCard({ 
  serviceRequest, 
  authorName, 
  authorProfileType,
  onApply 
}: ServiceRequestCardProps) {
  const getTypeLabel = () => {
    return serviceRequest.request_type === 'offer' ? 'PROPOSE' : 'RECHERCHE';
  };

  const getTypeColor = () => {
    return serviceRequest.request_type === 'offer' ? 'bg-green-500' : 'bg-orange-500';
  };

  const getCategoryIcon = () => {
    switch (serviceRequest.service_category) {
      case 'performance':
        return <Music className="w-4 h-4" />;
      case 'venue':
        return <Building className="w-4 h-4" />;
      case 'agent':
        return <Users className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = () => {
    const baseLabel = (() => {
      switch (serviceRequest.service_category) {
        case 'performance':
          return 'Performance artistique';
        case 'venue':
          return 'Lieu/Venue';
        case 'agent':
          return 'Agent/Manager';
        case 'other':
          return 'Autre';
        default:
          return serviceRequest.service_category;
      }
    })();

    // Ajouter les types de profils si spécifiés
    if (serviceRequest.profile_types && serviceRequest.profile_types.length > 0) {
      const profileTypeLabels = serviceRequest.profile_types.map(type => {
        switch (type) {
          case 'dj': return 'DJ';
          case 'chanteur': return 'Chanteur';
          case 'groupe': return 'Groupe';
          case 'musicien': return 'Musicien';
          case 'danseur': return 'Danseur';
          case 'performer': return 'Performer';
          case 'magicien': return 'Magicien';
          case 'comedien': return 'Comédien';
          case 'animateur': return 'Animateur';
          default: return type;
        }
      });
      
      return `${baseLabel} • ${profileTypeLabels.join(', ')}`;
    }

    return baseLabel;
  };

  const formatBudget = () => {
    if (serviceRequest.budget_min && serviceRequest.budget_max) {
      return `${serviceRequest.budget_min}€ - ${serviceRequest.budget_max}€`;
    } else if (serviceRequest.budget_min) {
      return `À partir de ${serviceRequest.budget_min}€`;
    } else if (serviceRequest.budget_max) {
      return `Jusqu'à ${serviceRequest.budget_max}€`;
    }
    return null;
  };

  return (
    <Card className="border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50/30 to-background">
      <CardContent className="p-4 space-y-4">
        {/* Header avec type et catégorie */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={`${getTypeColor()} text-white font-semibold px-3 py-1`}>
              <Handshake className="w-3 h-3 mr-1" />
              {getTypeLabel()}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              {getCategoryIcon()}
              <span>{getCategoryLabel()}</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {format(new Date(serviceRequest.created_at), "dd MMM", { locale: fr })}
          </div>
        </div>

        {/* Auteur */}
        <div className="text-sm">
          <span className="font-medium text-foreground">{authorName}</span>
          <span className="text-muted-foreground ml-1">• {authorProfileType}</span>
        </div>

        {/* Description */}
        <div>
          <p className="text-foreground font-medium text-base leading-relaxed">
            {serviceRequest.description}
          </p>
          {serviceRequest.requirements && (
            <p className="text-sm text-muted-foreground mt-2">
              <strong>Exigences:</strong> {serviceRequest.requirements}
            </p>
          )}
        </div>

        {/* Informations clés */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{serviceRequest.location}</span>
          </div>
          
          {formatBudget() && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Euro className="w-4 h-4" />
              <span>{formatBudget()}</span>
            </div>
          )}
          
          {serviceRequest.event_date && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(serviceRequest.event_date), "dd MMM yyyy", { locale: fr })}</span>
            </div>
          )}
          
          {serviceRequest.deadline && (
            <div className="flex items-center gap-1 text-orange-600">
              <Clock className="w-4 h-4" />
              <span>Limite: {format(new Date(serviceRequest.deadline), "dd MMM", { locale: fr })}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-2">
          <Button 
            size="sm" 
            onClick={onApply}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {serviceRequest.request_type === 'offer' ? 'Postuler' : 'Répondre à la demande'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}