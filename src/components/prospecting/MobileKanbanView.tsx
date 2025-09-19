import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { SupabaseProspect } from '@/hooks/useProspects';
import SwipeableProspectCard from './SwipeableProspectCard';
import { addHapticFeedback } from '@/utils/mobileHelpers';
import { 
  User, 
  Star, 
  TrendingUp, 
  MessageCircle, 
  Euro, 
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface KanbanColumn {
  id: string;
  title: string;
  status: string[];
  color: string;
  icon: React.ReactNode;
}

const columns: KanbanColumn[] = [
  {
    id: 'contact',
    title: 'Contact',
    status: ['new', 'contacted'],
    color: 'border-blue-500 bg-blue-50',
    icon: <User className="h-4 w-4 text-blue-600" />
  },
  {
    id: 'qualification',
    title: 'Qualification',
    status: ['qualified'],
    color: 'border-yellow-500 bg-yellow-50',
    icon: <Star className="h-4 w-4 text-yellow-600" />
  },
  {
    id: 'proposition',
    title: 'Proposition',
    status: ['proposition'],
    color: 'border-orange-500 bg-orange-50',
    icon: <TrendingUp className="h-4 w-4 text-orange-600" />
  },
  {
    id: 'negotiation',
    title: 'Négociation',
    status: ['negotiation'],
    color: 'border-purple-500 bg-purple-50',
    icon: <MessageCircle className="h-4 w-4 text-purple-600" />
  },
  {
    id: 'signature',
    title: 'Signature',
    status: ['converted'],
    color: 'border-green-500 bg-green-50',
    icon: <Euro className="h-4 w-4 text-green-600" />
  },
  {
    id: 'follow_up',
    title: 'Suivi',
    status: ['follow_up'],
    color: 'border-teal-500 bg-teal-50',
    icon: <Calendar className="h-4 w-4 text-teal-600" />
  }
];

interface MobileKanbanViewProps {
  prospects: SupabaseProspect[];
  onProspectSelect?: (prospect: SupabaseProspect) => void;
  onEmailProspect?: (prospect: SupabaseProspect) => void;
  onWhatsAppProspect?: (prospect: SupabaseProspect) => void;
  onArchiveProspect?: (prospect: SupabaseProspect) => void;
  onRejectProspect?: (prospect: SupabaseProspect) => void;
}

export default function MobileKanbanView({
  prospects,
  onProspectSelect,
  onEmailProspect,
  onWhatsAppProspect,
  onArchiveProspect,
  onRejectProspect
}: MobileKanbanViewProps) {
  const isMobile = useIsMobile();
  const [activeColumnIndex, setActiveColumnIndex] = useState(0);

  const getProspectsForColumn = (columnStatuses: string[]) => {
    return prospects.filter(prospect => 
      columnStatuses.includes(prospect.status)
    );
  };

  const handleSwipeLeft = (prospect: SupabaseProspect, action: 'archive' | 'reject') => {
    addHapticFeedback('medium');
    if (action === 'archive') {
      onArchiveProspect?.(prospect);
    } else {
      onRejectProspect?.(prospect);
    }
  };

  const handleSwipeRight = (prospect: SupabaseProspect, action: 'email' | 'whatsapp') => {
    addHapticFeedback('medium');
    if (action === 'email') {
      onEmailProspect?.(prospect);
    } else {
      onWhatsAppProspect?.(prospect);
    }
  };

  const handleColumnChange = (direction: 'prev' | 'next') => {
    addHapticFeedback('light');
    
    if (direction === 'prev' && activeColumnIndex > 0) {
      setActiveColumnIndex(activeColumnIndex - 1);
    } else if (direction === 'next' && activeColumnIndex < columns.length - 1) {
      setActiveColumnIndex(activeColumnIndex + 1);
    }
  };

  // Desktop version - horizontal scroll
  if (!isMobile) {
    return (
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4 min-w-max">
          {columns.map((column) => {
            const columnProspects = getProspectsForColumn(column.status);
            
            return (
              <Card key={column.id} className={`w-80 flex-shrink-0 ${column.color} border-2`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      {column.icon}
                      <span>{column.title}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {columnProspects.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
                  {columnProspects.map((prospect) => (
                    <SwipeableProspectCard
                      key={prospect.id}
                      prospect={prospect}
                      onTap={() => onProspectSelect?.(prospect)}
                      onSwipeLeft={(action) => handleSwipeLeft(prospect, action)}
                      onSwipeRight={(action) => handleSwipeRight(prospect, action)}
                    />
                  ))}
                  
                  {columnProspects.length === 0 && (
                    <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                      Aucun prospect
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    );
  }

  // Mobile version - single column with navigation
  const activeColumn = columns[activeColumnIndex];
  const columnProspects = getProspectsForColumn(activeColumn.status);

  return (
    <div className="w-full">
      {/* Mobile column header with navigation */}
      <div className="flex items-center justify-between mb-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10 p-3 rounded-lg border">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => handleColumnChange('prev')}
          disabled={activeColumnIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center space-x-2">
          {activeColumn.icon}
          <h3 className="font-semibold text-sm">{activeColumn.title}</h3>
          <Badge variant="outline" className="text-xs">
            {columnProspects.length}
          </Badge>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => handleColumnChange('next')}
          disabled={activeColumnIndex === columns.length - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress dots indicator */}
      <div className="flex justify-center space-x-2 mb-4">
        {columns.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === activeColumnIndex 
                ? 'bg-primary scale-125' 
                : 'bg-muted-foreground/30'
            }`}
            onClick={() => {
              setActiveColumnIndex(index);
              addHapticFeedback('light');
            }}
          />
        ))}
      </div>

      {/* Mobile prospect cards */}
      <div className="space-y-3">
        {columnProspects.map((prospect) => (
          <SwipeableProspectCard
            key={prospect.id}
            prospect={prospect}
            onTap={() => onProspectSelect?.(prospect)}
            onSwipeLeft={(action) => handleSwipeLeft(prospect, action)}
            onSwipeRight={(action) => handleSwipeRight(prospect, action)}
          />
        ))}
        
        {columnProspects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <div className="text-4xl mb-2">{activeColumn.icon}</div>
            <p className="text-sm text-center">Aucun prospect dans cette étape</p>
            <p className="text-xs text-center mt-1">
              Glissez les cartes vers la droite ou gauche pour des actions rapides
            </p>
          </div>
        )}
      </div>

      {/* Mobile help text */}
      <div className="mt-6 p-4 bg-muted/30 rounded-lg text-center">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Swipe ←</strong> pour archiver/rejeter • 
          <strong>Swipe →</strong> pour contacter • 
          <strong>Tap</strong> pour voir les détails
        </p>
      </div>
    </div>
  );
}