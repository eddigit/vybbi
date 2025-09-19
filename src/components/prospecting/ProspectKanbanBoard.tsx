import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  Calendar, 
  TrendingUp, 
  Euro,
  MessageCircle,
  Eye,
  Edit,
  MoreHorizontal,
  Star,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Prospect {
  id: string;
  contact_name: string;
  company_name?: string;
  email?: string;
  phone?: string;
  prospect_type: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposition' | 'negotiation' | 'converted' | 'rejected' | 'unresponsive' | 'interested';
  qualification_score: number;
  estimated_budget?: number;
  priority_level?: 'low' | 'medium' | 'high' | 'critical';
  last_contact_at?: string;
  next_follow_up_at?: string;
  created_at: string;
  assigned_agent_id?: string;
}

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
    title: 'Contact Initial',
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
    title: 'Suivi Client',
    status: ['follow_up'],
    color: 'border-teal-500 bg-teal-50',
    icon: <Calendar className="h-4 w-4 text-teal-600" />
  }
];

interface ProspectKanbanBoardProps {
  onProspectSelect?: (prospect: Prospect) => void;
  onEmailProspect?: (prospect: Prospect) => void;
  onWhatsAppProspect?: (prospect: Prospect) => void;
}

export default function ProspectKanbanBoard({ 
  onProspectSelect, 
  onEmailProspect, 
  onWhatsAppProspect 
}: ProspectKanbanBoardProps) {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProspects();
  }, []);

  const loadProspects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProspects((data || []) as Prospect[]);
    } catch (error) {
      console.error('Error loading prospects:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les prospects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const targetColumn = columns[destination.droppableId as any];
    
    if (!targetColumn) return;

    const newStatus = targetColumn.status[0] as Prospect['status']; // Use first status in column
    
    try {
        const { error } = await supabase
          .from('prospects')
          .update({ status: newStatus as any })
          .eq('id', draggableId);

      if (error) throw error;

        setProspects(prev => 
          prev.map(prospect => 
            prospect.id === draggableId 
              ? { ...prospect, status: newStatus as any }
              : prospect
          )
        );

      toast({
        title: "Prospect mis à jour",
        description: `Statut changé vers "${targetColumn.title}"`,
      });
    } catch (error) {
      console.error('Error updating prospect:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le prospect",
        variant: "destructive",
      });
    }
  };

  const getProspectsForColumn = (columnStatuses: string[]) => {
    return prospects.filter(prospect => columnStatuses.includes(prospect.status));
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
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

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Jamais';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    return `Il y a ${diffDays} jours`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Chargement du pipeline...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 h-[600px] overflow-auto">
          {columns.map((column, columnIndex) => {
            const columnProspects = getProspectsForColumn(column.status);
            
            return (
              <div key={column.id} className="min-h-full">
                <Card className={`h-full ${column.color} border-2`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {column.icon}
                        <span>{column.title}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {columnProspects.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  
                  <Droppable droppableId={columnIndex.toString()}>
                    {(provided, snapshot) => (
                      <CardContent
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-3 min-h-[400px] ${
                          snapshot.isDraggingOver ? 'bg-muted/50' : ''
                        }`}
                      >
                        {columnProspects.map((prospect, index) => (
                          <Draggable 
                            key={prospect.id} 
                            draggableId={prospect.id} 
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`cursor-pointer transition-all hover:shadow-md ${
                                  snapshot.isDragging ? 'shadow-lg rotate-3' : ''
                                }`}
                              >
                                <CardContent className="p-3">
                                  {/* Header avec nom et type */}
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-lg">{getTypeIcon(prospect.prospect_type)}</span>
                                      <div>
                                        <div className="font-medium text-sm">{prospect.contact_name}</div>
                                        {prospect.company_name && (
                                          <div className="text-xs text-muted-foreground">{prospect.company_name}</div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                          <MoreHorizontal className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onProspectSelect?.(prospect)}>
                                          <Eye className="mr-2 h-4 w-4" />
                                          Voir détails
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onEmailProspect?.(prospect)}>
                                          <Mail className="mr-2 h-4 w-4" />
                                          Envoyer email
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onWhatsAppProspect?.(prospect)}>
                                          <MessageCircle className="mr-2 h-4 w-4" />
                                          WhatsApp
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>

                                  {/* Score de qualification */}
                                  <div className="mb-2">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                      <span>Qualification</span>
                                      <span>{prospect.qualification_score}%</span>
                                    </div>
                                    <Progress 
                                      value={prospect.qualification_score} 
                                      className="h-1" 
                                    />
                                  </div>

                                  {/* Budget estimé */}
                                  {prospect.estimated_budget && (
                                    <div className="flex items-center justify-between text-xs mb-2">
                                      <span className="text-muted-foreground">Budget</span>
                                      <span className="font-medium">{prospect.estimated_budget}€</span>
                                    </div>
                                  )}

                                  {/* Priorité */}
                                  {prospect.priority_level && (
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs text-muted-foreground">Priorité</span>
                                      <Badge 
                                        variant="secondary" 
                                        className={`text-white text-xs ${getPriorityColor(prospect.priority_level)}`}
                                      >
                                        {prospect.priority_level}
                                      </Badge>
                                    </div>
                                  )}

                                  {/* Contact info */}
                                  <div className="space-y-1 text-xs">
                                    {prospect.email && (
                                      <div className="flex items-center text-muted-foreground">
                                        <Mail className="mr-1 h-3 w-3" />
                                        <span className="truncate">{prospect.email}</span>
                                      </div>
                                    )}
                                    {prospect.phone && (
                                      <div className="flex items-center text-muted-foreground">
                                        <Phone className="mr-1 h-3 w-3" />
                                        <span>{prospect.phone}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Footer avec temps */}
                                  <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs text-muted-foreground">
                                    <div className="flex items-center">
                                      <Clock className="mr-1 h-3 w-3" />
                                      <span>{formatTimeAgo(prospect.last_contact_at)}</span>
                                    </div>
                                    {prospect.next_follow_up_at && (
                                      <Badge variant="outline" className="text-xs">
                                        Suivi prévu
                                      </Badge>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        
                        {columnProspects.length === 0 && (
                          <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
                            Aucun prospect
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Droppable>
                </Card>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}