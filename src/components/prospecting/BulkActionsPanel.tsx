import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckSquare, 
  Mail, 
  MessageCircle, 
  Archive, 
  Trash2, 
  UserCheck, 
  Tag,
  TrendingUp,
  X,
  Send,
  Users
} from 'lucide-react';
import { SupabaseProspect } from '@/hooks/useProspects';

interface BulkActionsPanelProps {
  selectedProspects: string[];
  allProspects: SupabaseProspect[];
  onSelectAll: () => void;
  onSelectNone: () => void;
  onProspectsUpdated: () => void;
}

export default function BulkActionsPanel({
  selectedProspects,
  allProspects,
  onSelectAll,
  onSelectNone,
  onProspectsUpdated
}: BulkActionsPanelProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [bulkEmailOpen, setBulkEmailOpen] = useState(false);
  const { toast } = useToast();

  const selectedCount = selectedProspects.length;
  const totalCount = allProspects.length;
  const allSelected = selectedCount === totalCount && totalCount > 0;
  const someSelected = selectedCount > 0 && selectedCount < totalCount;

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedCount === 0) return;
    
    setIsProcessing(true);
    try {
      // Simulate bulk update - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Succès",
        description: `${selectedCount} prospects mis à jour vers "${newStatus}"`,
      });
      
      onProspectsUpdated();
      onSelectNone();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les prospects",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkAssign = async (agentId: string) => {
    if (selectedCount === 0) return;
    
    setIsProcessing(true);
    try {
      // Simulate bulk assignment - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Succès",
        description: `${selectedCount} prospects assignés`,
      });
      
      onProspectsUpdated();
      onSelectNone();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'assigner les prospects",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkEmail = () => {
    if (selectedCount === 0) return;
    
    const prospectsWithEmail = allProspects.filter(
      p => selectedProspects.includes(p.id) && p.email
    );
    
    if (prospectsWithEmail.length === 0) {
      toast({
        title: "Attention",
        description: "Aucun prospect sélectionné n'a d'adresse email",
        variant: "destructive",
      });
      return;
    }
    
    setBulkEmailOpen(true);
  };

  const handleBulkArchive = async () => {
    if (selectedCount === 0) return;
    
    setIsProcessing(true);
    try {
      // Simulate bulk archive - replace with actual API call  
      await new Promise(resolve => setTimeout(resolve, 600));
      
      toast({
        title: "Succès",
        description: `${selectedCount} prospects archivés`,
      });
      
      onProspectsUpdated();
      onSelectNone();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'archiver les prospects",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Selection Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el && el.querySelector('button')) {
                    (el.querySelector('button') as any).indeterminate = someSelected;
                  }
                }}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onSelectAll();
                  } else {
                    onSelectNone();
                  }
                }}
              />
              <span className="text-sm font-medium">
                {selectedCount} sur {totalCount} sélectionnés
              </span>
            </div>
            
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckSquare className="h-3 w-3" />
              Actions groupées
            </Badge>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onSelectNone}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Tout désélectionner
            </Button>
          </div>

          {/* Bulk Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Updates */}
            <Select onValueChange={handleBulkStatusUpdate}>
              <SelectTrigger className="w-40 h-8">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs">Changer statut</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contacted">Contacté</SelectItem>
                <SelectItem value="qualified">Qualifié</SelectItem>
                <SelectItem value="proposition">Proposition</SelectItem>
                <SelectItem value="negotiation">Négociation</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
              </SelectContent>
            </Select>

            {/* Assignment */}
            <Select onValueChange={handleBulkAssign}>
              <SelectTrigger className="w-36 h-8">
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  <span className="text-xs">Assigner à</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agent1">Marie Dupont</SelectItem>
                <SelectItem value="agent2">Jean Martin</SelectItem>
                <SelectItem value="agent3">Sophie Chen</SelectItem>
                <SelectItem value="unassign">Désassigner</SelectItem>
              </SelectContent>
            </Select>

            {/* Communication Actions */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkEmail}
              disabled={isProcessing}
              className="h-8 text-xs"
            >
              <Mail className="h-3 w-3 mr-1" />
              Email groupé
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={isProcessing}
              className="h-8 text-xs"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              WhatsApp
            </Button>

            {/* Archive/Delete */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkArchive}
              disabled={isProcessing}
              className="h-8 text-xs"
            >
              <Archive className="h-3 w-3 mr-1" />
              Archiver
            </Button>

            <Button
              variant="destructive"
              size="sm"
              disabled={isProcessing}
              className="h-8 text-xs"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Supprimer
            </Button>
          </div>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">
              Traitement en cours...
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}