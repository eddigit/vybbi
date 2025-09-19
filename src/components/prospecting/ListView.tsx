import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  List, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  MessageCircle, 
  Eye,
  Edit,
  Archive,
  Trash2,
  TrendingUp,
  Calendar,
  Euro,
  Building,
  User,
  Star,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SupabaseProspect } from '@/hooks/useProspects';

interface ListViewProps {
  prospects: SupabaseProspect[];
  selectedProspects: string[];
  onProspectSelect: (prospect: SupabaseProspect) => void;
  onProspectToggle: (prospectId: string) => void;
  onEmailProspect: (prospect: SupabaseProspect) => void;
  onWhatsAppProspect: (prospect: SupabaseProspect) => void;
  onArchiveProspect: (prospect: SupabaseProspect) => void;
  onDeleteProspect: (prospect: SupabaseProspect) => void;
}

type SortField = 'contact_name' | 'company_name' | 'status' | 'qualification_score' | 'estimated_budget' | 'created_at' | 'last_contact_at';
type SortDirection = 'asc' | 'desc';

export default function ListView({
  prospects,
  selectedProspects,
  onProspectSelect,
  onProspectToggle,
  onEmailProspect,
  onWhatsAppProspect,
  onArchiveProspect,
  onDeleteProspect
}: ListViewProps) {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProspects = [...prospects].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Handle null/undefined values
    if (aValue == null) aValue = '';
    if (bValue == null) bValue = '';

    // Convert to string for comparison
    aValue = String(aValue).toLowerCase();
    bValue = String(bValue).toLowerCase();

    if (sortDirection === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-500',
      contacted: 'bg-yellow-500',
      qualified: 'bg-orange-500',
      proposition: 'bg-purple-500',
      negotiation: 'bg-pink-500',
      converted: 'bg-green-500',
      rejected: 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || colors.new;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      new: 'Nouveau',
      contacted: 'Contacté',
      qualified: 'Qualifié',
      proposition: 'Proposition',
      negotiation: 'Négociation',
      converted: 'Converti',
      rejected: 'Rejeté'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getPriorityColor = (priority?: string) => {
    if (!priority) return 'bg-gray-500';
    
    const colors = {
      critical: 'bg-red-600',
      high: 'bg-orange-600',
      medium: 'bg-yellow-600',
      low: 'bg-blue-600'
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        <ArrowUpDown className={`h-3 w-3 ${sortField === field ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
    </TableHead>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Vue Liste - {prospects.length} prospects
          </div>
          <Badge variant="outline" className="hidden md:inline-flex">
            Multi-colonnes • Tri avancé
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedProspects.length === prospects.length && prospects.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        prospects.forEach(p => {
                          if (!selectedProspects.includes(p.id)) {
                            onProspectToggle(p.id);
                          }
                        });
                      } else {
                        selectedProspects.forEach(id => onProspectToggle(id));
                      }
                    }}
                  />
                </TableHead>
                <TableHead className="w-12">Type</TableHead>
                <SortableHeader field="contact_name">Contact</SortableHeader>
                <SortableHeader field="company_name">Entreprise</SortableHeader>
                <SortableHeader field="status">Statut</SortableHeader>
                <SortableHeader field="qualification_score">Score</SortableHeader>
                <TableHead>Priorité</TableHead>
                <SortableHeader field="estimated_budget">Budget</SortableHeader>
                <TableHead>Contact</TableHead>
                <SortableHeader field="last_contact_at">Dernier Contact</SortableHeader>
                <SortableHeader field="created_at">Créé</SortableHeader>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProspects.map((prospect) => (
                <TableRow 
                  key={prospect.id}
                  className={`hover:bg-muted/50 cursor-pointer ${
                    selectedProspects.includes(prospect.id) ? 'bg-primary/5 border-primary/20' : ''
                  }`}
                  onClick={() => onProspectSelect(prospect)}
                >
                  <TableCell onClick={e => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedProspects.includes(prospect.id)}
                      onCheckedChange={() => onProspectToggle(prospect.id)}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-lg">{getTypeIcon(prospect.prospect_type)}</span>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {prospect.contact_name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{prospect.contact_name}</div>
                        {prospect.city && (
                          <div className="text-xs text-muted-foreground">{prospect.city}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="font-medium text-sm">{prospect.company_name || '-'}</div>
                    {prospect.industry_sector && (
                      <div className="text-xs text-muted-foreground">{prospect.industry_sector}</div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="secondary" className={`text-white text-xs ${getStatusColor(prospect.status)}`}>
                      {getStatusLabel(prospect.status)}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>{prospect.qualification_score || 0}%</span>
                      </div>
                      <Progress value={prospect.qualification_score || 0} className="h-1 w-16" />
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {prospect.priority_level && (
                      <Badge 
                        variant="secondary" 
                        className={`text-white text-xs ${getPriorityColor(prospect.priority_level)}`}
                      >
                        {prospect.priority_level}
                      </Badge>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm font-medium">
                      {prospect.estimated_budget ? `${prospect.estimated_budget.toLocaleString()}€` : '-'}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {prospect.email && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEmailProspect(prospect);
                          }}
                        >
                          <Mail className="h-3 w-3" />
                        </Button>
                      )}
                      {prospect.phone && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <Phone className="h-3 w-3" />
                        </Button>
                      )}
                      {(prospect.whatsapp_number || prospect.phone) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onWhatsAppProspect(prospect);
                          }}
                        >
                          <MessageCircle className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(prospect.last_contact_at)}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(prospect.created_at)}
                    </div>
                  </TableCell>
                  
                  <TableCell onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-6 w-6 p-0">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onProspectSelect(prospect)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEmailProspect(prospect)}>
                          <Mail className="mr-2 h-4 w-4" />
                          Envoyer email
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onWhatsAppProspect(prospect)}>
                          <MessageCircle className="mr-2 h-4 w-4" />
                          WhatsApp
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onArchiveProspect(prospect)}>
                          <Archive className="mr-2 h-4 w-4" />
                          Archiver
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDeleteProspect(prospect)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {prospects.length === 0 && (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <div className="text-center">
                <List className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <div className="text-sm">Aucun prospect trouvé</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}