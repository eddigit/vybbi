import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useIsMobile } from '@/hooks/use-mobile';
import { addHapticFeedback } from '@/utils/mobileHelpers';
import { SupabaseProspect } from '@/hooks/useProspects';
import { 
  Mail, 
  Phone, 
  MessageCircle, 
  Archive, 
  TrendingUp,
  Euro,
  Clock,
  Check,
  X
} from 'lucide-react';

interface SwipeableProspectCardProps {
  prospect: SupabaseProspect;
  onSwipeLeft?: (action: 'archive' | 'reject') => void;
  onSwipeRight?: (action: 'email' | 'whatsapp') => void; 
  onTap?: () => void;
  className?: string;
}

export default function SwipeableProspectCard({
  prospect,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  className = ''
}: SwipeableProspectCardProps) {
  const isMobile = useIsMobile();
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [startX, setStartX] = useState(0);

  const SWIPE_THRESHOLD = 80;
  const MAX_DRAG = 120;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
    addHapticFeedback('light');
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isMobile) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    const clampedDiff = Math.max(-MAX_DRAG, Math.min(MAX_DRAG, diff));
    setDragX(clampedDiff);
  };

  const handleTouchEnd = () => {
    if (!isDragging || !isMobile) return;
    
    if (Math.abs(dragX) > SWIPE_THRESHOLD) {
      addHapticFeedback('medium');
      
      if (dragX > 0) {
        // Swipe right - positive actions
        if (prospect.email) {
          onSwipeRight?.('email');
        } else {
          onSwipeRight?.('whatsapp');
        }
      } else {
        // Swipe left - archive/reject actions
        if (Math.abs(dragX) > SWIPE_THRESHOLD * 1.5) {
          onSwipeLeft?.('reject');
        } else {
          onSwipeLeft?.('archive');
        }
      }
    }
    
    setIsDragging(false);
    setDragX(0);
    setStartX(0);
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      artist: '🎤',
      venue: '🏢', 
      sponsors: '💰',
      media: '📺',
      agence: '🏪',
      influenceur: '⭐'
    };
    return icons[type as keyof typeof icons] || '👤';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-500',
      contacted: 'bg-yellow-500',
      qualified: 'bg-orange-500',
      proposition: 'bg-purple-500',
      negotiation: 'bg-indigo-500',
      converted: 'bg-green-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
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
    return `${Math.floor(diffDays / 7)}sem`;
  };

  const getSwipeIndicator = () => {
    if (!isDragging || Math.abs(dragX) < 20) return null;
    
    if (dragX > 0) {
      // Right swipe indicators 
      return (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          {prospect.email ? (
            <div className="flex items-center space-x-1 text-green-600">
              <Mail className="h-5 w-5" />
              <span className="text-sm font-medium">Email</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-blue-600">
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-medium">WhatsApp</span>
            </div>
          )}
        </div>
      );
    } else {
      // Left swipe indicators
      const isReject = Math.abs(dragX) > SWIPE_THRESHOLD * 1.5;
      return (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          {isReject ? (
            <div className="flex items-center space-x-1 text-red-600">
              <X className="h-5 w-5" />
              <span className="text-sm font-medium">Rejeter</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-orange-600">
              <Archive className="h-5 w-5" />
              <span className="text-sm font-medium">Archiver</span>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background indicators */}
      {isDragging && (
        <div className={`absolute inset-0 transition-opacity duration-200 ${
          dragX > 0 
            ? 'bg-gradient-to-r from-green-100 to-transparent' 
            : 'bg-gradient-to-l from-red-100 to-transparent'
        }`}>
          {getSwipeIndicator()}
        </div>
      )}
      
      {/* Main card */}
      <Card
        className={`
          mobile-card transition-all duration-200 cursor-pointer min-h-[120px]
          ${isDragging ? 'shadow-xl scale-[1.02]' : 'hover:shadow-md'}
          ${className}
        `}
        style={{
          transform: isMobile ? `translateX(${dragX}px)` : undefined,
          opacity: isDragging ? 0.95 : 1
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={!isDragging ? onTap : undefined}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="text-xl">{getTypeIcon(prospect.prospect_type)}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{prospect.contact_name}</h3>
                {prospect.company_name && (
                  <p className="text-xs text-muted-foreground truncate">{prospect.company_name}</p>
                )}
              </div>
            </div>
            
            <Badge className={`text-white text-xs ${getStatusColor(prospect.status)} flex-shrink-0`}>
              {prospect.status}
            </Badge>
          </div>

          {/* Qualification Score */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center">
                <TrendingUp className="mr-1 h-3 w-3" />
                Qualification
              </span>
              <span className="font-medium">{prospect.qualification_score || 0}%</span>
            </div>
            <Progress value={prospect.qualification_score || 0} className="h-2" />
          </div>

          {/* Budget */}
          {prospect.estimated_budget && (
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground flex items-center">
                <Euro className="mr-1 h-3 w-3" />
                Budget
              </span>
              <span className="text-xs font-medium text-green-600">
                {prospect.estimated_budget}€
              </span>
            </div>
          )}

          {/* Contact info & timing */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-3">
              {prospect.email && <Mail className="h-3 w-3" />}
              {prospect.phone && <Phone className="h-3 w-3" />}
            </div>
            
            <div className="flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              <span>{formatTimeAgo(prospect.last_contact_at)}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}