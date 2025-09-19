import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Eye,
  Edit,
  TrendingUp,
  Clock,
  Euro
} from 'lucide-react';

interface Prospect {
  id: string;
  contact_name: string;
  company_name?: string;
  email?: string;
  phone?: string;
  whatsapp_number?: string;
  prospect_type: string;
  status: string;
  qualification_score: number;
  estimated_budget?: number;
  priority_level?: 'low' | 'medium' | 'high' | 'critical';
  last_contact_at?: string;
  next_follow_up_at?: string;
}

interface MobileProspectCardProps {
  prospect: Prospect;
  onSelect?: () => void;
  onEmail?: () => void;
  onWhatsApp?: () => void;
  onCall?: () => void;
}

export default function MobileProspectCard({
  prospect,
  onSelect,
  onEmail,
  onWhatsApp,
  onCall
}: MobileProspectCardProps) {
  
  const getStatusColor = (status: string) => {
    const colors = {
      'new': 'bg-blue-500',
      'contacted': 'bg-yellow-500', 
      'qualified': 'bg-orange-500',
      'proposition': 'bg-purple-500',
      'negotiation': 'bg-indigo-500',
      'converted': 'bg-green-500',
      'rejected': 'bg-red-500',
      'unresponsive': 'bg-gray-500'
    };
    return colors[status as keyof typeof colors] || colors.new;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'new': 'Nouveau',
      'contacted': 'Contacté',
      'qualified': 'Qualifié', 
      'proposition': 'Proposition',
      'negotiation': 'Négociation',
      'converted': 'Converti',
      'rejected': 'Rejeté',
      'unresponsive': 'Sans réponse'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getPriorityColor = (priority?: string) => {
    const colors = {
      'critical': 'bg-red-500 text-white',
      'high': 'bg-orange-500 text-white',
      'medium': 'bg-yellow-500 text-white',
      'low': 'bg-blue-500 text-white'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      'artist': '🎤',
      'venue': '🏢',
      'sponsors': '💰',
      'media': '📺',
      'agence': '🏪',
      'influenceur': '⭐',
      'agent': '👔',
      'manager': '💼',
      'academie': '🎓'
    };
    return icons[type as keyof typeof icons] || '👤';
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Jamais';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `${diffDays}j`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}sem`;
    return `${Math.floor(diffDays / 30)}mois`;
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{getTypeIcon(prospect.prospect_type)}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{prospect.contact_name}</h3>
              {prospect.company_name && (
                <p className="text-xs text-muted-foreground truncate">{prospect.company_name}</p>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onSelect}>
                <Eye className="mr-2 h-4 w-4" />
                Voir détails
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEmail} disabled={!prospect.email}>
                <Mail className="mr-2 h-4 w-4" />
                Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onWhatsApp} disabled={!prospect.whatsapp_number && !prospect.phone}>
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCall} disabled={!prospect.phone}>
                <Phone className="mr-2 h-4 w-4" />
                Appeler
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status and Priority Badges */}
        <div className="flex items-center justify-between mb-3">
          <Badge className={`text-white text-xs ${getStatusColor(prospect.status)}`}>
            {getStatusLabel(prospect.status)}
          </Badge>
          
          {prospect.priority_level && (
            <Badge className={`text-xs ${getPriorityColor(prospect.priority_level)}`}>
              {prospect.priority_level.toUpperCase()}
            </Badge>
          )}
        </div>

        {/* Qualification Score */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center">
              <TrendingUp className="mr-1 h-3 w-3" />
              Qualification
            </span>
            <span className="font-medium">{prospect.qualification_score}%</span>
          </div>
          <Progress value={prospect.qualification_score} className="h-2" />
        </div>

        {/* Budget */}
        {prospect.estimated_budget && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground flex items-center">
              <Euro className="mr-1 h-3 w-3" />
              Budget estimé
            </span>
            <span className="text-xs font-medium text-green-600">
              {formatCurrency(prospect.estimated_budget)}
            </span>
          </div>
        )}

        {/* Contact Info */}
        <div className="space-y-1 mb-3">
          {prospect.email && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Mail className="mr-2 h-3 w-3 flex-shrink-0" />
              <span className="truncate">{prospect.email}</span>
            </div>
          )}
          {prospect.phone && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Phone className="mr-2 h-3 w-3 flex-shrink-0" />
              <span>{prospect.phone}</span>
            </div>
          )}
        </div>

        {/* Footer with timing info */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="mr-1 h-3 w-3" />
            <span>{formatTimeAgo(prospect.last_contact_at)}</span>
          </div>
          
          {prospect.next_follow_up_at && (
            <div className="flex items-center text-xs">
              <Calendar className="mr-1 h-3 w-3" />
              <span className="text-orange-600 font-medium">
                {formatTimeAgo(prospect.next_follow_up_at)}
              </span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex justify-between gap-2 mt-3">
          <Button 
            onClick={onSelect}
            variant="outline" 
            size="sm"
            className="flex-1 text-xs"
          >
            <Eye className="mr-1 h-3 w-3" />
            Détails
          </Button>
          
          <Button 
            onClick={onEmail}
            variant="outline" 
            size="sm"
            disabled={!prospect.email}
            className="flex-1 text-xs"
          >
            <Mail className="mr-1 h-3 w-3" />
            Email
          </Button>
          
          <Button 
            onClick={onWhatsApp}
            variant="outline" 
            size="sm"
            disabled={!prospect.whatsapp_number && !prospect.phone}
            className="flex-1 text-xs"
          >
            <MessageCircle className="mr-1 h-3 w-3" />
            Chat
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}