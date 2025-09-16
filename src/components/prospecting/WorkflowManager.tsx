import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Workflow, 
  Plus, 
  Play, 
  Pause, 
  Settings, 
  Clock, 
  Mail, 
  Phone, 
  MessageCircle, 
  AlertCircle, 
  Edit,
  Trash2,
  ArrowRight
} from 'lucide-react';

interface WorkflowStep {
  step: number;
  type: 'email' | 'call' | 'whatsapp' | 'reminder' | 'note';
  delay_hours: number;
  template?: string;
  title: string;
  description?: string;
  condition?: string;
}

interface ProspectingWorkflow {
  id: string;
  name: string;
  prospect_type: string;
  steps: WorkflowStep[];
  is_active: boolean;
  created_at: string;
}

export default function WorkflowManager() {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<ProspectingWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<ProspectingWorkflow | null>(null);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    prospect_type: 'artist',
    steps: [] as WorkflowStep[]
  });

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const { data } = await supabase
        .from('prospecting_workflows')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        setWorkflows(data as ProspectingWorkflow[]);
      }
    } catch (error) {
      console.error('Erreur chargement workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkflow = async () => {
    if (!newWorkflow.name.trim() || newWorkflow.steps.length === 0) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez renseigner le nom et au moins une étape",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const workflowData = {
        name: newWorkflow.name,
        prospect_type: newWorkflow.prospect_type,
        steps: newWorkflow.steps as any,
        created_by: user?.id
      };

      if (editingWorkflow) {
        const { error } = await supabase
          .from('prospecting_workflows')
          .update(workflowData)
          .eq('id', editingWorkflow.id);
        
        if (error) throw error;
        
        toast({ title: "Workflow mis à jour" });
      } else {
        const { error } = await supabase
          .from('prospecting_workflows')
          .insert([workflowData]);
        
        if (error) throw error;
        
        toast({ title: "Workflow créé" });
      }

      resetForm();
      setDialogOpen(false);
      loadWorkflows();

    } catch (error) {
      console.error('Erreur sauvegarde workflow:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le workflow",
        variant: "destructive"
      });
    }
  };

  const handleToggleActive = async (workflowId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('prospecting_workflows')
        .update({ is_active: !currentStatus })
        .eq('id', workflowId);

      if (error) throw error;

      toast({
        title: !currentStatus ? "Workflow activé" : "Workflow désactivé"
      });

      loadWorkflows();
    } catch (error) {
      console.error('Erreur toggle workflow:', error);
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    try {
      const { error } = await supabase
        .from('prospecting_workflows')
        .delete()
        .eq('id', workflowId);

      if (error) throw error;

      toast({ title: "Workflow supprimé" });
      loadWorkflows();
    } catch (error) {
      console.error('Erreur suppression workflow:', error);
    }
  };

  const handleEditWorkflow = (workflow: ProspectingWorkflow) => {
    setEditingWorkflow(workflow);
    setNewWorkflow({
      name: workflow.name,
      prospect_type: workflow.prospect_type,
      steps: workflow.steps
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setNewWorkflow({
      name: '',
      prospect_type: 'artist', 
      steps: []
    });
    setEditingWorkflow(null);
  };

  const addStep = () => {
    const newStep: WorkflowStep = {
      step: newWorkflow.steps.length + 1,
      type: 'email',
      delay_hours: 0,
      title: '',
      condition: ''
    };
    setNewWorkflow({
      ...newWorkflow,
      steps: [...newWorkflow.steps, newStep]
    });
  };

  const updateStep = (index: number, field: keyof WorkflowStep, value: any) => {
    const updatedSteps = [...newWorkflow.steps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setNewWorkflow({ ...newWorkflow, steps: updatedSteps });
  };

  const removeStep = (index: number) => {
    const updatedSteps = newWorkflow.steps.filter((_, i) => i !== index);
    // Réajuster les numéros d'étapes
    updatedSteps.forEach((step, i) => step.step = i + 1);
    setNewWorkflow({ ...newWorkflow, steps: updatedSteps });
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'call': return <Phone className="h-4 w-4" />;
      case 'whatsapp': return <MessageCircle className="h-4 w-4" />;
      case 'reminder': return <AlertCircle className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getProspectTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'artist': 'Artistes',
      'venue': 'Lieux/Clubs',
      'agent': 'Agents',
      'manager': 'Managers',
      'sponsors': 'Sponsors/Partenaires',
      'media': 'Médias',
      'academie': 'Écoles/Académies',
      'agence': 'Agences',
      'influenceur': 'Influenceurs'
    };
    return labels[type] || type;
  };

  const formatDelayText = (hours: number) => {
    if (hours === 0) return 'Immédiat';
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}j${remainingHours > 0 ? ` ${remainingHours}h` : ''}`;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement des workflows...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Workflow className="h-6 w-6" />
            Gestion des Workflows
          </h2>
          <p className="text-muted-foreground">
            Automatisez vos séquences de prospection par type de contact
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingWorkflow ? 'Modifier le Workflow' : 'Créer un Workflow'}
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="general" className="w-full">
              <TabsList>
                <TabsTrigger value="general">Configuration</TabsTrigger>
                <TabsTrigger value="steps">Étapes ({newWorkflow.steps.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom du Workflow</Label>
                    <Input
                      value={newWorkflow.name}
                      onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                      placeholder="Ex: Workflow Artistes Premium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type de Prospects</Label>
                    <Select
                      value={newWorkflow.prospect_type}
                      onValueChange={(value) => setNewWorkflow({ ...newWorkflow, prospect_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="artist">Artistes</SelectItem>
                        <SelectItem value="venue">Lieux/Clubs</SelectItem>
                        <SelectItem value="agent">Agents</SelectItem>
                        <SelectItem value="manager">Managers</SelectItem>
                        <SelectItem value="sponsors">Sponsors/Partenaires</SelectItem>
                        <SelectItem value="media">Médias</SelectItem>
                        <SelectItem value="academie">Écoles/Académies</SelectItem>
                        <SelectItem value="agence">Agences</SelectItem>
                        <SelectItem value="influenceur">Influenceurs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="steps" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Étapes du Workflow</h3>
                  <Button onClick={addStep} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une Étape
                  </Button>
                </div>

                <div className="space-y-3">
                  {newWorkflow.steps.map((step, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
                          {step.step}
                        </div>
                        
                        <div className="flex-1 grid grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs">Type</Label>
                            <Select
                              value={step.type}
                              onValueChange={(value) => updateStep(index, 'type', value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="email">📧 Email</SelectItem>
                                <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                                <SelectItem value="call">📞 Appel</SelectItem>
                                <SelectItem value="reminder">⏰ Rappel</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Délai (heures)</Label>
                            <Input
                              type="number"
                              min="0"
                              className="h-8"
                              value={step.delay_hours}
                              onChange={(e) => updateStep(index, 'delay_hours', parseInt(e.target.value) || 0)}
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Titre</Label>
                            <Input
                              className="h-8"
                              value={step.title}
                              onChange={(e) => updateStep(index, 'title', e.target.value)}
                              placeholder="Titre de l'étape"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Condition</Label>
                            <Input
                              className="h-8"
                              value={step.condition || ''}
                              onChange={(e) => updateStep(index, 'condition', e.target.value)}
                              placeholder="ex: no_response"
                            />
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeStep(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="mt-2 text-xs text-muted-foreground">
                        {getStepIcon(step.type)} {formatDelayText(step.delay_hours)} après l'étape précédente
                      </div>
                    </Card>
                  ))}

                  {newWorkflow.steps.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucune étape configurée. Cliquez sur "Ajouter une Étape" pour commencer.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveWorkflow}>
                {editingWorkflow ? 'Mettre à jour' : 'Créer'} le Workflow
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className={`${workflow.is_active ? 'border-green-200 bg-green-50/50' : 'border-gray-200 bg-gray-50/50'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{workflow.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={workflow.is_active ? 'default' : 'secondary'}>
                    {workflow.is_active ? (
                      <><Play className="h-3 w-3 mr-1" /> Actif</>
                    ) : (
                      <><Pause className="h-3 w-3 mr-1" /> Inactif</>
                    )}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Pour les {getProspectTypeLabel(workflow.prospect_type)}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Séquence ({workflow.steps.length} étapes)</h4>
                <div className="space-y-1">
                  {workflow.steps.slice(0, 3).map((step, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      {getStepIcon(step.type)}
                      <span className="truncate">{step.title}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{formatDelayText(step.delay_hours)}</span>
                    </div>
                  ))}
                  {workflow.steps.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      ... et {workflow.steps.length - 3} autres étapes
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditWorkflow(workflow)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Modifier
                </Button>
                <Button
                  variant={workflow.is_active ? 'destructive' : 'default'}
                  size="sm"
                  onClick={() => handleToggleActive(workflow.id, workflow.is_active)}
                >
                  {workflow.is_active ? (
                    <><Pause className="h-4 w-4 mr-1" /> Désactiver</>
                  ) : (
                    <><Play className="h-4 w-4 mr-1" /> Activer</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {workflows.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Workflow className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Aucun workflow configuré</h3>
            <p className="text-muted-foreground mb-4">
              Créez votre premier workflow pour automatiser vos séquences de prospection
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Créer un Workflow
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}