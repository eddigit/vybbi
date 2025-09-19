import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Filter, 
  X, 
  Search, 
  TrendingUp,
  Users,
  Building,
  Star,
  Euro,
  Calendar
} from 'lucide-react';
import { ProspectFilters as FilterType } from '@/hooks/useProspects';

interface ProspectFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  onReset: () => void;
  resultsCount: number;
}

const statusOptions = [
  { value: 'new', label: 'Nouveau', color: 'bg-blue-500' },
  { value: 'contacted', label: 'Contacté', color: 'bg-yellow-500' },
  { value: 'qualified', label: 'Qualifié', color: 'bg-orange-500' },
  { value: 'proposition', label: 'Proposition', color: 'bg-purple-500' },
  { value: 'negotiation', label: 'Négociation', color: 'bg-pink-500' },
  { value: 'converted', label: 'Converti', color: 'bg-green-500' },
  { value: 'rejected', label: 'Rejeté', color: 'bg-red-500' }
];

const typeOptions = [
  { value: 'artist', label: 'Artiste', icon: '🎤' },
  { value: 'venue', label: 'Lieu', icon: '🏢' },
  { value: 'sponsors', label: 'Sponsor', icon: '💰' },
  { value: 'media', label: 'Média', icon: '📺' },
  { value: 'agence', label: 'Agence', icon: '🏪' },
  { value: 'influenceur', label: 'Influenceur', icon: '⭐' }
];

const priorityOptions = [
  { value: 'critical', label: 'Critique', color: 'bg-red-600' },
  { value: 'high', label: 'Haute', color: 'bg-orange-600' },
  { value: 'medium', label: 'Moyenne', color: 'bg-yellow-600' },
  { value: 'low', label: 'Basse', color: 'bg-blue-600' }
];

export default function ProspectFilters({ 
  filters, 
  onFiltersChange, 
  onReset, 
  resultsCount 
}: ProspectFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [budgetRange, setBudgetRange] = useState([0, 50000]);

  const activeFiltersCount = 
    (filters.status?.length || 0) +
    (filters.prospect_type?.length || 0) +
    (filters.priority_level?.length || 0) +
    (filters.assigned_agent_id ? 1 : 0);

  const handleStatusChange = (status: string, checked: boolean) => {
    const currentStatus = filters.status || [];
    const newStatus = checked 
      ? [...currentStatus, status]
      : currentStatus.filter(s => s !== status);
    
    onFiltersChange({ ...filters, status: newStatus });
  };

  const handleTypeChange = (type: string, checked: boolean) => {
    const currentTypes = filters.prospect_type || [];
    const newTypes = checked 
      ? [...currentTypes, type]
      : currentTypes.filter(t => t !== type);
    
    onFiltersChange({ ...filters, prospect_type: newTypes });
  };

  const handlePriorityChange = (priority: string, checked: boolean) => {
    const currentPriorities = filters.priority_level || [];
    const newPriorities = checked 
      ? [...currentPriorities, priority]
      : currentPriorities.filter(p => p !== priority);
    
    onFiltersChange({ ...filters, priority_level: newPriorities });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filtres Avancés
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {resultsCount} résultats
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Réduire' : 'Développer'}
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-1" />
                Réinitialiser
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          {statusOptions.slice(0, 4).map((status) => (
            <Button
              key={status.value}
              variant={filters.status?.includes(status.value) ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusChange(status.value, !filters.status?.includes(status.value))}
              className="text-xs h-7"
            >
              <div className={`w-2 h-2 rounded-full mr-2 ${status.color}`} />
              {status.label}
            </Button>
          ))}
        </div>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t">
            {/* Status Filters */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 font-medium">
                <TrendingUp className="h-4 w-4" />
                Statut
              </Label>
              <div className="space-y-2">
                {statusOptions.map((status) => (
                  <div key={status.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status.value}`}
                      checked={filters.status?.includes(status.value) || false}
                      onCheckedChange={(checked) => 
                        handleStatusChange(status.value, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`status-${status.value}`}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <div className={`w-2 h-2 rounded-full ${status.color}`} />
                      {status.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Type Filters */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 font-medium">
                <Building className="h-4 w-4" />
                Type de Prospect
              </Label>
              <div className="space-y-2">
                {typeOptions.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type.value}`}
                      checked={filters.prospect_type?.includes(type.value) || false}
                      onCheckedChange={(checked) => 
                        handleTypeChange(type.value, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`type-${type.value}`}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <span>{type.icon}</span>
                      {type.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Filters */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 font-medium">
                <Star className="h-4 w-4" />
                Priorité
              </Label>
              <div className="space-y-2">
                {priorityOptions.map((priority) => (
                  <div key={priority.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`priority-${priority.value}`}
                      checked={filters.priority_level?.includes(priority.value) || false}
                      onCheckedChange={(checked) => 
                        handlePriorityChange(priority.value, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`priority-${priority.value}`}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <div className={`w-2 h-2 rounded-full ${priority.color}`} />
                      {priority.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget Range */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 font-medium">
                <Euro className="h-4 w-4" />
                Budget Estimé
              </Label>
              <div className="space-y-3">
                <Slider
                  value={budgetRange}
                  onValueChange={setBudgetRange}
                  max={100000}
                  step={1000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{budgetRange[0].toLocaleString()}€</span>
                  <span>{budgetRange[1].toLocaleString()}€</span>
                </div>
              </div>
            </div>

            {/* Agent Assignment */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 font-medium">
                <Users className="h-4 w-4" />
                Agent Assigné
              </Label>
              <Select
                value={filters.assigned_agent_id || "all"}
                onValueChange={(value) => 
                  onFiltersChange({ 
                    ...filters, 
                    assigned_agent_id: value === "all" ? undefined : value 
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les agents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les agents</SelectItem>
                  <SelectItem value="unassigned">Non assigné</SelectItem>
                  <SelectItem value="agent1">Marie Dupont</SelectItem>
                  <SelectItem value="agent2">Jean Martin</SelectItem>
                  <SelectItem value="agent3">Sophie Chen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 font-medium">
                <Calendar className="h-4 w-4" />
                Dernière Activité
              </Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="quarter">Ce trimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}