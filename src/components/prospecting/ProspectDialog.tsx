import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Phone, Mail, Calendar, Plus, Send } from 'lucide-react';

interface ProspectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prospectId?: string;
  onProspectUpdated?: () => void;
}

interface Prospect {
  id?: string;
  prospect_type: 'artist' | 'venue' | 'agent' | 'manager';
  company_name?: string;
  contact_name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  website?: string;
  social_media?: any;
  status: 'new' | 'contacted' | 'qualified' | 'interested' | 'converted' | 'rejected' | 'unresponsive';
  qualification_score: number;
  notes?: string;
  source?: string;
}

interface Interaction {
  id: string;
  interaction_type: 'email' | 'call' | 'meeting' | 'message' | 'note';
  subject?: string;
  content?: string;
  outcome?: string;
  next_action?: string;
  scheduled_at?: string;
  completed_at?: string;
  created_at: string;
}

export default function ProspectDialog({ open, onOpenChange, prospectId, onProspectUpdated }: ProspectDialogProps) {
  const { toast } = useToast();
  const [prospect, setProspect] = useState<Prospect>({
    prospect_type: 'artist',
    contact_name: '',
    status: 'new',
    qualification_score: 0
  });
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [newInteraction, setNewInteraction] = useState({
    type: 'note' as 'email' | 'call' | 'meeting' | 'message' | 'note',
    subject: '',
    content: '',
    outcome: '',
    next_action: ''
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (open && prospectId) {
      loadProspectData();
    } else if (open && !prospectId) {
      // Reset for new prospect
      setProspect({
        prospect_type: 'artist',
        contact_name: '',
        status: 'new',
        qualification_score: 0
      });
      setInteractions([]);
    }
  }, [open, prospectId]);

  const loadProspectData = async () => {
    if (!prospectId) return;
    
    try {
      setLoading(true);
      
      // Load prospect details
      const { data: prospectData } = await supabase
        .from('prospects')
        .select('*')
        .eq('id', prospectId)
        .single();
      
      if (prospectData) {
        setProspect(prospectData);
      }

      // Load interactions
      const { data: interactionsData } = await supabase
        .from('prospect_interactions')
        .select('*')
        .eq('prospect_id', prospectId)
        .order('created_at', { ascending: false });

      if (interactionsData) {
        setInteractions(interactionsData);
      }

    } catch (error) {
      console.error('Error loading prospect:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du prospect",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProspect = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!prospect.contact_name.trim()) {
        toast({
          title: "Erreur de validation",
          description: "Le nom du contact est requis",
          variant: "destructive",
        });
        return;
      }

      if (prospectId) {
        // Update existing prospect
        const { error } = await supabase
          .from('prospects')
          .update(prospect)
          .eq('id', prospectId);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
      } else {
        // Create new prospect with required fields
        const prospectData = {
          prospect_type: prospect.prospect_type,
          contact_name: prospect.contact_name.trim(),
          company_name: prospect.company_name?.trim() || null,
          email: prospect.email?.trim() || null,
          phone: prospect.phone?.trim() || null,
          address: prospect.address?.trim() || null,
          city: prospect.city?.trim() || null,
          website: prospect.website?.trim() || null,
          status: prospect.status,
          qualification_score: prospect.qualification_score || 0,
          notes: prospect.notes?.trim() || null,
          source: prospect.source?.trim() || 'manual'
        };

        console.log('Creating prospect:', prospectData);

        const { data, error } = await supabase
          .from('prospects')
          .insert([prospectData])
          .select();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }

        console.log('Created prospect:', data);
      }

      toast({
        title: "Succès",
        description: prospectId ? "Prospect mis à jour" : "Nouveau prospect créé",
      });

      onProspectUpdated?.();
      onOpenChange(false);

    } catch (error) {
      console.error('Error saving prospect:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le prospect",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddInteraction = async () => {
    if (!prospectId || !newInteraction.content.trim()) return;

    try {
      setLoading(true);

      const { data: agentData } = await supabase
        .from('vybbi_agents')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!agentData) {
        toast({
          title: "Erreur",
          description: "Agent non trouvé",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('prospect_interactions')
        .insert([{
          prospect_id: prospectId,
          agent_id: agentData.id,
          interaction_type: newInteraction.type,
          subject: newInteraction.subject,
          content: newInteraction.content,
          outcome: newInteraction.outcome,
          next_action: newInteraction.next_action,
          completed_at: new Date().toISOString()
        }]);

      if (error) throw error;

      // Update prospect's last_contact_at
      await supabase
        .from('prospects')
        .update({ last_contact_at: new Date().toISOString() })
        .eq('id', prospectId);

      setNewInteraction({
        type: 'note',
        subject: '',
        content: '',
        outcome: '',
        next_action: ''
      });

      loadProspectData(); // Reload to show new interaction

      toast({
        title: "Succès",
        description: "Interaction ajoutée",
      });

    } catch (error) {
      console.error('Error adding interaction:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'interaction",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'call': return <Phone className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      default: return <Plus className="h-4 w-4" />;
    }
  };

  const getInteractionBadge = (type: string) => {
    const styles = {
      'email': 'bg-blue-500',
      'call': 'bg-green-500',
      'meeting': 'bg-purple-500',
      'message': 'bg-orange-500',
      'note': 'bg-gray-500'
    };

    return (
      <Badge className={`${styles[type as keyof typeof styles]} text-white`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {prospectId ? `Prospect: ${prospect.contact_name}` : 'Nouveau Prospect'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="interactions" disabled={!prospectId}>
              Interactions ({interactions.length})
            </TabsTrigger>
            <TabsTrigger value="conversion" disabled={!prospectId}>
              Conversion
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_name">Nom du Contact *</Label>
                <Input
                  id="contact_name"
                  value={prospect.contact_name}
                  onChange={(e) => setProspect({ ...prospect, contact_name: e.target.value })}
                  placeholder="Jean Dupont"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prospect_type">Type de Prospect *</Label>
                <Select 
                  value={prospect.prospect_type} 
                  onValueChange={(value) => setProspect({ ...prospect, prospect_type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="artist">Artiste</SelectItem>
                    <SelectItem value="venue">Lieu</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name">Nom de l'Entreprise</Label>
                <Input
                  id="company_name"
                  value={prospect.company_name || ''}
                  onChange={(e) => setProspect({ ...prospect, company_name: e.target.value })}
                  placeholder="Studio XYZ"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={prospect.email || ''}
                  onChange={(e) => setProspect({ ...prospect, email: e.target.value })}
                  placeholder="contact@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={prospect.phone || ''}
                  onChange={(e) => setProspect({ ...prospect, phone: e.target.value })}
                  placeholder="+33 1 23 45 67 89"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={prospect.city || ''}
                  onChange={(e) => setProspect({ ...prospect, city: e.target.value })}
                  placeholder="Paris"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select 
                  value={prospect.status} 
                  onValueChange={(value) => setProspect({ ...prospect, status: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Nouveau</SelectItem>
                    <SelectItem value="contacted">Contacté</SelectItem>
                    <SelectItem value="qualified">Qualifié</SelectItem>
                    <SelectItem value="interested">Intéressé</SelectItem>
                    <SelectItem value="converted">Converti</SelectItem>
                    <SelectItem value="rejected">Rejeté</SelectItem>
                    <SelectItem value="unresponsive">Sans réponse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualification_score">Score de Qualification (0-100)</Label>
                <Input
                  id="qualification_score"
                  type="number"
                  min="0"
                  max="100"
                  value={prospect.qualification_score}
                  onChange={(e) => setProspect({ ...prospect, qualification_score: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={prospect.notes || ''}
                onChange={(e) => setProspect({ ...prospect, notes: e.target.value })}
                placeholder="Notes sur ce prospect..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveProspect} disabled={loading}>
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="interactions" className="space-y-4">
            {/* Add new interaction */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nouvelle Interaction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type d'Interaction</Label>
                    <Select 
                      value={newInteraction.type} 
                      onValueChange={(value) => setNewInteraction({ ...newInteraction, type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="call">Appel</SelectItem>
                        <SelectItem value="meeting">Rendez-vous</SelectItem>
                        <SelectItem value="message">Message</SelectItem>
                        <SelectItem value="note">Note</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Sujet</Label>
                    <Input
                      value={newInteraction.subject}
                      onChange={(e) => setNewInteraction({ ...newInteraction, subject: e.target.value })}
                      placeholder="Sujet de l'interaction"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Contenu *</Label>
                  <Textarea
                    value={newInteraction.content}
                    onChange={(e) => setNewInteraction({ ...newInteraction, content: e.target.value })}
                    placeholder="Décrivez l'interaction..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Résultat</Label>
                    <Input
                      value={newInteraction.outcome}
                      onChange={(e) => setNewInteraction({ ...newInteraction, outcome: e.target.value })}
                      placeholder="Résultat de l'interaction"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Prochaine Action</Label>
                    <Input
                      value={newInteraction.next_action}
                      onChange={(e) => setNewInteraction({ ...newInteraction, next_action: e.target.value })}
                      placeholder="Que faire ensuite ?"
                    />
                  </div>
                </div>

                <Button onClick={handleAddInteraction} disabled={loading || !newInteraction.content.trim()}>
                  <Send className="mr-2 h-4 w-4" />
                  Ajouter l'Interaction
                </Button>
              </CardContent>
            </Card>

            {/* Interactions history */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Historique des Interactions</CardTitle>
              </CardHeader>
              <CardContent>
                {interactions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Aucune interaction enregistrée
                  </p>
                ) : (
                  <div className="space-y-4">
                    {interactions.map((interaction) => (
                      <div key={interaction.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getInteractionIcon(interaction.interaction_type)}
                            {getInteractionBadge(interaction.interaction_type)}
                            {interaction.subject && (
                              <span className="font-medium">{interaction.subject}</span>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(interaction.created_at).toLocaleString('fr-FR')}
                          </span>
                        </div>
                        
                        {interaction.content && (
                          <p className="text-sm">{interaction.content}</p>
                        )}
                        
                        {interaction.outcome && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Résultat:</strong> {interaction.outcome}
                          </p>
                        )}
                        
                        {interaction.next_action && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Prochaine action:</strong> {interaction.next_action}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversion" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Suivi de Conversion</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Fonctionnalité en développement - Suivi des conversions et commissions
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}