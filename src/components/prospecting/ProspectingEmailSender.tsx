import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Send, Mail, Users, FileText } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  target_type?: string;
}

interface Prospect {
  id: string;
  contact_name: string;
  email?: string;
  prospect_type: string;
  status: string;
  company_name?: string;
}

export default function ProspectingEmailSender() {
  const { toast } = useToast();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [selectedProspects, setSelectedProspects] = useState<string[]>([]);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Introduction Artiste',
      subject: '🎵 Vybbi - Plateforme révolutionnaire pour artistes',
      target_type: 'artist',
      body: `Bonjour {{contact_name}},

Je suis {{agent_name}} de Vybbi, la plateforme qui révolutionne la mise en relation dans l'industrie musicale.

Vybbi permet aux artistes comme vous de :
✨ Être découvert par des agents, managers et lieux d'événements
🎯 Accéder à des opportunités exclusives
📈 Développer votre carrière musicale
💼 Gérer vos bookings et collaborations

{{company_name}} pourrait grandement bénéficier de notre écosystème.

Êtes-vous disponible pour un appel de 15 minutes cette semaine pour découvrir comment Vybbi peut propulser votre carrière ?

Cordialement,
{{agent_name}}
Vybbi - Agent Commercial`
    },
    {
      id: '2',
      name: 'Introduction Lieu',
      subject: '🏛️ Vybbi - Trouvez les artistes parfaits pour vos événements',
      target_type: 'venue',
      body: `Bonjour {{contact_name}},

Je représente Vybbi, la solution de référence pour la découverte et le booking d'artistes.

Pour {{company_name}}, Vybbi offre :
🎯 Accès à une base d'artistes qualifiés et vérifiés
⚡ Booking simplifié et sécurisé
💡 Recommandations personnalisées selon vos besoins
📊 Outils de gestion d'événements intégrés

Nous travaillons déjà avec de nombreuses salles qui ont augmenté la qualité de leur programmation grâce à notre plateforme.

Pourrions-nous programmer un rendez-vous cette semaine pour vous présenter nos services ?

Cordialement,
{{agent_name}}
Vybbi - Agent Commercial`
    },
    {
      id: '3',
      name: 'Relance Douce',
      subject: '🔔 Vybbi - Suite à notre échange',
      target_type: 'all',
      body: `Bonjour {{contact_name}},

J'espère que vous allez bien.

Je reviens vers vous concernant Vybbi et les opportunités que notre plateforme peut offrir à {{company_name}}.

Depuis notre dernier échange, nous avons :
📈 Enregistré +50 nouveaux artistes cette semaine
🎉 Facilité +30 nouveaux bookings
🌟 Lancé de nouvelles fonctionnalités exclusives

Seriez-vous disponible pour un point rapide cette semaine ?

Cordialement,
{{agent_name}}
Vybbi - Agent Commercial`
    }
  ]);
  
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadProspects();
  }, []);

  const loadProspects = async () => {
    try {
      const { data } = await supabase
        .from('prospects')
        .select('id, contact_name, email, prospect_type, status, company_name')
        .not('email', 'is', null)
        .order('created_at', { ascending: false });

      if (data) {
        setProspects(data);
      }
    } catch (error) {
      console.error('Error loading prospects:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les prospects",
        variant: "destructive",
      });
    }
  };

  const filteredProspects = prospects.filter(prospect => {
    const typeMatch = filterType === 'all' || prospect.prospect_type === filterType;
    const statusMatch = filterStatus === 'all' || prospect.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const applyTemplate = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setEmailSubject(template.subject);
      setEmailBody(template.body);
      setSelectedTemplate(templateId);
    }
  };

  const personalizeContent = (content: string, prospect: Prospect, agentName: string = 'Agent Vybbi') => {
    return content
      .replace(/{{contact_name}}/g, prospect.contact_name)
      .replace(/{{company_name}}/g, prospect.company_name || prospect.contact_name)
      .replace(/{{agent_name}}/g, agentName);
  };

  const sendEmails = async () => {
    if (!emailSubject.trim() || !emailBody.trim() || selectedProspects.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs et sélectionner des prospects",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    try {
      // Get current agent info
      const { data: agentData } = await supabase
        .from('vybbi_agents')
        .select('id, agent_name')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!agentData) {
        throw new Error('Agent non trouvé');
      }

      const selectedProspectData = prospects.filter(p => selectedProspects.includes(p.id));
      let successCount = 0;
      let errorCount = 0;

      for (const prospect of selectedProspectData) {
        try {
          const personalizedSubject = personalizeContent(emailSubject, prospect, agentData.agent_name);
          const personalizedBody = personalizeContent(emailBody, prospect, agentData.agent_name);

          // Call email sending edge function
          const { error } = await supabase.functions.invoke('send-prospecting-email', {
            body: {
              to: prospect.email,
              subject: personalizedSubject,
              content: personalizedBody,
              prospectId: prospect.id,
              agentId: agentData.id
            }
          });

          if (error) {
            console.error('Email error for prospect', prospect.id, error);
            errorCount++;
          } else {
            successCount++;

            // Log the interaction
            await supabase.from('prospect_interactions').insert([{
              prospect_id: prospect.id,
              agent_id: agentData.id,
              interaction_type: 'email',
              subject: personalizedSubject,
              content: personalizedBody,
              completed_at: new Date().toISOString()
            }]);

            // Update prospect's last_contact_at
            await supabase
              .from('prospects')
              .update({ 
                last_contact_at: new Date().toISOString(),
                status: (prospect.status === 'new' ? 'contacted' : prospect.status) as 'new' | 'contacted' | 'qualified' | 'interested' | 'converted' | 'rejected' | 'unresponsive'
              })
              .eq('id', prospect.id);
          }
        } catch (error) {
          console.error('Error processing prospect', prospect.id, error);
          errorCount++;
        }
      }

      toast({
        title: "Envoi terminé",
        description: `${successCount} emails envoyés avec succès${errorCount > 0 ? `, ${errorCount} erreurs` : ''}`,
        variant: successCount > 0 ? "default" : "destructive",
      });

      // Clear selection and reload data
      setSelectedProspects([]);
      loadProspects();

    } catch (error) {
      console.error('Error sending emails:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer les emails",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedProspects.length === filteredProspects.length) {
      setSelectedProspects([]);
    } else {
      setSelectedProspects(filteredProspects.map(p => p.id));
    }
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      'artist': 'bg-purple-500',
      'venue': 'bg-indigo-500',
      'agent': 'bg-cyan-500',
      'manager': 'bg-teal-500'
    };

    const labels = {
      'artist': 'Artiste',
      'venue': 'Lieu',
      'agent': 'Agent',
      'manager': 'Manager'
    };

    return (
      <Badge className={`${styles[type as keyof typeof styles]} text-white`}>
        {labels[type as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Email Composition */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Composition d'Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Templates */}
          <div className="space-y-2">
            <Label>Modèles d'Email</Label>
            <Select value={selectedTemplate} onValueChange={applyTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un modèle..." />
              </SelectTrigger>
              <SelectContent>
                {emailTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {template.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Sujet *</Label>
            <Input
              id="subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Sujet de l'email..."
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Contenu de l'Email *</Label>
            <Textarea
              id="body"
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Contenu de l'email..."
              rows={12}
            />
          </div>

          <div className="text-sm text-muted-foreground">
            <p><strong>Variables disponibles :</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>{`{{contact_name}}`} - Nom du contact</li>
              <li>{`{{company_name}}`} - Nom de l'entreprise</li>
              <li>{`{{agent_name}}`} - Votre nom d'agent</li>
            </ul>
          </div>

          <Button 
            onClick={sendEmails}
            disabled={sending || selectedProspects.length === 0}
            className="w-full"
          >
            <Send className="mr-2 h-4 w-4" />
            {sending 
              ? `Envoi en cours... (${selectedProspects.length})` 
              : `Envoyer à ${selectedProspects.length} prospects`
            }
          </Button>
        </CardContent>
      </Card>

      {/* Prospect Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Sélection des Prospects ({filteredProspects.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-2 gap-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="artist">Artiste</SelectItem>
                <SelectItem value="venue">Lieu</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Statut..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="new">Nouveau</SelectItem>
                <SelectItem value="contacted">Contacté</SelectItem>
                <SelectItem value="qualified">Qualifié</SelectItem>
                <SelectItem value="interested">Intéressé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Select All */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={selectedProspects.length === filteredProspects.length && filteredProspects.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all">
              Sélectionner tout ({filteredProspects.length})
            </Label>
          </div>

          {/* Prospects List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredProspects.map((prospect) => (
              <div
                key={prospect.id}
                className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                  selectedProspects.includes(prospect.id) ? 'bg-muted border-primary' : ''
                }`}
                onClick={() => {
                  setSelectedProspects(prev => 
                    prev.includes(prospect.id)
                      ? prev.filter(id => id !== prospect.id)
                      : [...prev, prospect.id]
                  );
                }}
              >
                <Checkbox
                  checked={selectedProspects.includes(prospect.id)}
                  onChange={() => {}}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {getTypeBadge(prospect.prospect_type)}
                    <div className="font-medium truncate">{prospect.contact_name}</div>
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {prospect.company_name}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {prospect.email}
                  </div>
                </div>
              </div>
            ))}

            {filteredProspects.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                Aucun prospect trouvé avec les filtres sélectionnés
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}