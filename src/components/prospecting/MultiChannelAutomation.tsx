import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Mail, 
  MessageSquare, 
  Phone, 
  Calendar, 
  Zap, 
  Play,
  Pause,
  Settings,
  BarChart3,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AutomationStep {
  id: string;
  order: number;
  channel: 'email' | 'whatsapp' | 'call' | 'meeting';
  delay_hours: number;
  template_id?: string;
  conditions?: Record<string, any>;
  content?: string;
}

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  is_active: boolean;
  steps: AutomationStep[];
  stats: {
    total_executions: number;
    success_rate: number;
    avg_conversion_rate: number;
  };
}

const CHANNELS = [
  { value: 'email', label: 'Email', icon: Mail, color: 'blue' },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'green' },
  { value: 'call', label: 'Appel téléphonique', icon: Phone, color: 'orange' },
  { value: 'meeting', label: 'Rendez-vous', icon: Calendar, color: 'purple' }
];

const TRIGGERS = [
  { value: 'prospect_created', label: 'Nouveau prospect créé' },
  { value: 'no_response_24h', label: 'Aucune réponse après 24h' },
  { value: 'no_response_48h', label: 'Aucune réponse après 48h' },
  { value: 'high_score', label: 'Score IA élevé (>80%)' },
  { value: 'meeting_scheduled', label: 'Rendez-vous planifié' },
  { value: 'conversion_ready', label: 'Prêt à convertir' }
];

export const MultiChannelAutomation: React.FC = () => {
  const { toast } = useToast();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);

  useEffect(() => {
    loadAutomations();
  }, []);

  const loadAutomations = async () => {
    try {
      const { data, error } = await supabase
        .from('automation_workflows')
        .select(`
          *,
          automation_steps (
            *
          ),
          automation_executions (
            id,
            status,
            completed_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedAutomations = data?.map(workflow => ({
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        trigger: workflow.trigger_type,
        is_active: workflow.is_active,
        steps: workflow.automation_steps || [],
        stats: {
          total_executions: workflow.automation_executions?.length || 0,
          success_rate: calculateSuccessRate(workflow.automation_executions),
          avg_conversion_rate: 0 // À calculer avec les conversions
        }
      })) || [];

      setAutomations(processedAutomations);
    } catch (error) {
      console.error('Error loading automations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les automatisations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateSuccessRate = (executions: any[]) => {
    if (!executions?.length) return 0;
    const successful = executions.filter(e => e.status === 'completed').length;
    return Math.round((successful / executions.length) * 100);
  };

  const handleCreateAutomation = () => {
    setEditingAutomation({
      id: '',
      name: '',
      description: '',
      trigger: '',
      is_active: false,
      steps: [],
      stats: { total_executions: 0, success_rate: 0, avg_conversion_rate: 0 }
    });
    setIsCreateDialogOpen(true);
  };

  const handleSaveAutomation = async () => {
    if (!editingAutomation) return;

    try {
      const isNew = !editingAutomation.id;
      
      if (isNew) {
        // Create new automation
        const { data: workflow, error: workflowError } = await supabase
          .from('automation_workflows')
          .insert({
            name: editingAutomation.name,
            description: editingAutomation.description,
            trigger_type: editingAutomation.trigger,
            is_active: editingAutomation.is_active
          })
          .select()
          .single();

        if (workflowError) throw workflowError;

        // Create steps
        if (editingAutomation.steps.length > 0) {
          const steps = editingAutomation.steps.map(step => ({
            ...step,
            workflow_id: workflow.id
          }));

          const { error: stepsError } = await supabase
            .from('automation_steps')
            .insert(steps);

          if (stepsError) throw stepsError;
        }
      } else {
        // Update existing automation
        const { error: updateError } = await supabase
          .from('automation_workflows')
          .update({
            name: editingAutomation.name,
            description: editingAutomation.description,
            trigger_type: editingAutomation.trigger,
            is_active: editingAutomation.is_active
          })
          .eq('id', editingAutomation.id);

        if (updateError) throw updateError;
      }

      toast({
        title: isNew ? "Automatisation créée" : "Automatisation mise à jour",
        description: `${editingAutomation.name} a été sauvegardée avec succès`
      });

      setIsCreateDialogOpen(false);
      setEditingAutomation(null);
      loadAutomations();
    } catch (error) {
      console.error('Error saving automation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'automatisation",
        variant: "destructive"
      });
    }
  };

  const handleToggleAutomation = async (automationId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('automation_workflows')
        .update({ is_active: isActive })
        .eq('id', automationId);

      if (error) throw error;

      toast({
        title: isActive ? "Automatisation activée" : "Automatisation désactivée",
        description: "Les modifications ont été appliquées"
      });

      loadAutomations();
    } catch (error) {
      console.error('Error toggling automation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'automatisation",
        variant: "destructive"
      });
    }
  };

  const addAutomationStep = () => {
    if (!editingAutomation) return;

    const newStep: AutomationStep = {
      id: `temp-${Date.now()}`,
      order: editingAutomation.steps.length + 1,
      channel: 'email',
      delay_hours: 0,
      content: ''
    };

    setEditingAutomation({
      ...editingAutomation,
      steps: [...editingAutomation.steps, newStep]
    });
  };

  const updateAutomationStep = (stepId: string, updates: Partial<AutomationStep>) => {
    if (!editingAutomation) return;

    setEditingAutomation({
      ...editingAutomation,
      steps: editingAutomation.steps.map(step =>
        step.id === stepId ? { ...step, ...updates } : step
      )
    });
  };

  const removeAutomationStep = (stepId: string) => {
    if (!editingAutomation) return;

    setEditingAutomation({
      ...editingAutomation,
      steps: editingAutomation.steps.filter(step => step.id !== stepId)
    });
  };

  const getChannelIcon = (channel: string) => {
    const channelData = CHANNELS.find(c => c.value === channel);
    return channelData?.icon || Mail;
  };

  const getChannelColor = (channel: string) => {
    const channelData = CHANNELS.find(c => c.value === channel);
    return channelData?.color || 'gray';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Automatisations Multi-Canal</h2>
          <p className="text-muted-foreground">
            Créez des séquences automatisées sur plusieurs canaux de communication.
          </p>
        </div>
        <Button onClick={handleCreateAutomation}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle automatisation
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">
                  {automations.filter(a => a.is_active).length}
                </div>
                <div className="text-sm text-muted-foreground">Actives</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(
                    automations.reduce((acc, a) => acc + a.stats.success_rate, 0) / 
                    automations.length || 0
                  )}%
                </div>
                <div className="text-sm text-muted-foreground">Taux de succès</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">
                  {automations.reduce((acc, a) => acc + a.stats.total_executions, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Exécutions totales</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(
                    automations.reduce((acc, a) => acc + a.stats.avg_conversion_rate, 0) / 
                    automations.length || 0
                  )}%
                </div>
                <div className="text-sm text-muted-foreground">Taux de conversion</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {automations.map((automation) => (
          <Card key={automation.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{automation.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {automation.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {TRIGGERS.find(t => t.value === automation.trigger)?.label}
                    </Badge>
                    <Badge variant={automation.is_active ? "default" : "secondary"}>
                      {automation.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleAutomation(automation.id, !automation.is_active)}
                >
                  {automation.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Steps Preview */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Étapes ({automation.steps.length})</Label>
                <div className="flex flex-wrap gap-1">
                  {automation.steps.slice(0, 4).map((step, index) => {
                    const Icon = getChannelIcon(step.channel);
                    return (
                      <div
                        key={step.id}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-muted text-xs"
                      >
                        <Icon className="h-3 w-3" />
                        {index > 0 && <span className="text-muted-foreground">+{step.delay_hours}h</span>}
                      </div>
                    );
                  })}
                  {automation.steps.length > 4 && (
                    <span className="px-2 py-1 text-xs text-muted-foreground">
                      +{automation.steps.length - 4} autres
                    </span>
                  )}
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-3 pt-2 border-t">
                <div className="text-center">
                  <div className="text-sm font-medium">{automation.stats.total_executions}</div>
                  <div className="text-xs text-muted-foreground">Exécutions</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-green-600">
                    {automation.stats.success_rate}%
                  </div>
                  <div className="text-xs text-muted-foreground">Succès</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-primary">
                    {automation.stats.avg_conversion_rate}%
                  </div>
                  <div className="text-xs text-muted-foreground">Conversion</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingAutomation(automation);
                    setIsCreateDialogOpen(true);
                  }}
                  className="flex-1"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Statistiques
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAutomation?.id ? 'Modifier' : 'Créer'} une automatisation
            </DialogTitle>
          </DialogHeader>

          {editingAutomation && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom de l'automatisation</Label>
                  <Input
                    value={editingAutomation.name}
                    onChange={(e) => setEditingAutomation({
                      ...editingAutomation,
                      name: e.target.value
                    })}
                    placeholder="Ex: Séquence nouveau prospect"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Déclencheur</Label>
                  <Select 
                    value={editingAutomation.trigger}
                    onValueChange={(value) => setEditingAutomation({
                      ...editingAutomation,
                      trigger: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un déclencheur" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRIGGERS.map((trigger) => (
                        <SelectItem key={trigger.value} value={trigger.value}>
                          {trigger.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingAutomation.description}
                  onChange={(e) => setEditingAutomation({
                    ...editingAutomation,
                    description: e.target.value
                  })}
                  placeholder="Décrivez l'objectif de cette automatisation..."
                />
              </div>

              {/* Steps */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Étapes de l'automatisation</Label>
                  <Button variant="outline" size="sm" onClick={addAutomationStep}>
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter une étape
                  </Button>
                </div>

                <div className="space-y-3">
                  {editingAutomation.steps.map((step, index) => {
                    const Icon = getChannelIcon(step.channel);
                    return (
                      <Card key={step.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                              {index + 1}
                            </div>
                            
                            <div className="flex-1 space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs">Canal</Label>
                                  <Select
                                    value={step.channel}
                                    onValueChange={(value) => updateAutomationStep(step.id, { channel: value as any })}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {CHANNELS.map((channel) => {
                                        const ChannelIcon = channel.icon;
                                        return (
                                          <SelectItem key={channel.value} value={channel.value}>
                                            <div className="flex items-center gap-2">
                                              <ChannelIcon className="h-4 w-4" />
                                              {channel.label}
                                            </div>
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                {index > 0 && (
                                  <div className="space-y-1">
                                    <Label className="text-xs">Délai (heures)</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={step.delay_hours}
                                      onChange={(e) => updateAutomationStep(step.id, { 
                                        delay_hours: parseInt(e.target.value) || 0 
                                      })}
                                      className="h-8"
                                    />
                                  </div>
                                )}
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">Contenu du message</Label>
                                <Textarea
                                  value={step.content || ''}
                                  onChange={(e) => updateAutomationStep(step.id, { content: e.target.value })}
                                  placeholder="Contenu du message pour cette étape..."
                                  className="min-h-[60px]"
                                />
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAutomationStep(step.id)}
                            >
                              ✕
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button onClick={handleSaveAutomation}>
                  {editingAutomation.id ? 'Mettre à jour' : 'Créer'} l'automatisation
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};