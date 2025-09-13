import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Edit3, Save, Eye, Mail, Trash2, Plus, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  html_content: string;
  variables: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const TEMPLATE_TYPES = [
  { value: 'user_registration', label: 'Inscription utilisateur', color: 'bg-green-100 text-green-800' },
  { value: 'admin_notification', label: 'Notification admin', color: 'bg-orange-100 text-orange-800' },
  { value: 'review_notification', label: 'Notification d\'avis', color: 'bg-blue-100 text-blue-800' },
  { value: 'contact_message', label: 'Message de contact', color: 'bg-purple-100 text-purple-800' },
  { value: 'booking_proposed', label: 'Proposition de booking', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'booking_status_changed', label: 'Statut de booking', color: 'bg-yellow-100 text-yellow-800' },
];

const DEFAULT_VARIABLES: Record<string, string[]> = {
  user_registration: ['userName', 'userEmail', 'profileType'],
  admin_notification: ['userName', 'userEmail', 'profileType'],
  review_notification: ['artistName', 'artistId', 'reviewerName', 'rating', 'message'],
  contact_message: ['senderName', 'senderEmail', 'message'],
  booking_proposed: ['artistName', 'venueName', 'eventTitle', 'eventDate', 'proposedFee'],
  booking_status_changed: ['artistName', 'venueName', 'eventTitle', 'eventDate', 'status'],
};

export const EmailTemplateManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [editForm, setEditForm] = useState({
    name: '',
    subject: '',
    html_content: '',
    is_active: true,
  });
  const [testEmail, setTestEmail] = useState('');

  const { data: templates, isLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('type');
      
      if (error) throw error;
      return data as EmailTemplate[];
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EmailTemplate> & { id: string }) => {
      const { error } = await supabase
        .from('email_templates')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      setIsEditing(false);
      toast({
        title: "Template mis à jour",
        description: "Le template email a été sauvegardé avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    },
  });

  const testEmailMutation = useMutation({
    mutationFn: async ({ templateId, email }: { templateId: string; email: string }) => {
      const template = templates?.find(t => t.id === templateId);
      if (!template) throw new Error('Template non trouvé');

      // Créer des données factices pour le test
      const mockData: Record<string, any> = {};
      const templateType = template.type;
      const variables = DEFAULT_VARIABLES[templateType] || [];
      
      variables.forEach(variable => {
        switch (variable) {
          case 'userName':
            mockData[variable] = 'John Doe';
            break;
          case 'userEmail':
            mockData[variable] = email;
            break;
          case 'profileType':
            mockData[variable] = 'artist';
            break;
          case 'artistName':
            mockData[variable] = 'Jane Artist';
            break;
          case 'artistId':
            mockData[variable] = '123';
            break;
          case 'reviewerName':
            mockData[variable] = 'Mike Reviewer';
            break;
          case 'rating':
            mockData[variable] = 5;
            break;
          case 'message':
            mockData[variable] = 'Ceci est un message de test pour le template email.';
            break;
          case 'senderName':
            mockData[variable] = 'Alice Sender';
            break;
          case 'senderEmail':
            mockData[variable] = 'alice@example.com';
            break;
          case 'venueName':
            mockData[variable] = 'Le Grand Théâtre';
            break;
          case 'eventTitle':
            mockData[variable] = 'Concert de Jazz';
            break;
          case 'eventDate':
            mockData[variable] = '2024-01-15';
            break;
          case 'proposedFee':
            mockData[variable] = '500€';
            break;
          case 'status':
            mockData[variable] = 'confirmé';
            break;
          default:
            mockData[variable] = 'Valeur test';
        }
      });

      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: {
          type: template.type,
          to: email,
          data: mockData,
          isTest: true,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Email de test envoyé",
        description: `L'email de test a été envoyé à ${testEmail}`,
      });
      setTestEmail('');
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur d'envoi",
        description: error.message,
      });
    },
  });

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditForm({
      name: template.name,
      subject: template.subject,
      html_content: template.html_content,
      is_active: template.is_active,
    });
    setIsEditing(true);
    setActiveTab('editor');
  };

  const handleSave = () => {
    if (!selectedTemplate) return;
    
    updateTemplateMutation.mutate({
      id: selectedTemplate.id,
      ...editForm,
    });
  };

  const handleTestEmail = (templateId: string) => {
    if (!testEmail) {
      toast({
        variant: "destructive",
        title: "Email requis",
        description: "Veuillez saisir une adresse email pour le test.",
      });
      return;
    }

    testEmailMutation.mutate({ templateId, email: testEmail });
  };

  const getTemplateTypeInfo = (type: string) => {
    return TEMPLATE_TYPES.find(t => t.value === type) || { label: type, color: 'bg-gray-100 text-gray-800' };
  };

  const renderVariables = (variables: string[]) => {
    return (
      <div className="flex flex-wrap gap-1">
        {variables.map(variable => (
          <Badge key={variable} variant="outline" className="text-xs">
            {`{{${variable}}}`}
          </Badge>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Templates Email</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Gestion des Templates Email
          </CardTitle>
          <CardDescription>
            Gérez les templates d'email utilisés par l'application pour les notifications et communications.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Liste des Templates</TabsTrigger>
          <TabsTrigger value="editor">Éditeur</TabsTrigger>
          <TabsTrigger value="test">Test d'Envoi</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {templates?.map(template => {
            const typeInfo = getTemplateTypeInfo(template.type);
            const variables = DEFAULT_VARIABLES[template.type] || [];

            return (
              <Card key={template.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{template.name}</h3>
                        <Badge className={typeInfo.color}>
                          {typeInfo.label}
                        </Badge>
                        {!template.is_active && (
                          <Badge variant="secondary">Inactif</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{template.subject}</p>
                      <div className="space-y-1">
                        <Label className="text-xs">Variables disponibles:</Label>
                        {renderVariables(variables)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Mis à jour le {new Date(template.updated_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(template)}
                      >
                        <Edit3 className="h-4 w-4" />
                        Modifier
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="editor">
          {isEditing && selectedTemplate ? (
            <Card>
              <CardHeader>
                <CardTitle>Édition du Template</CardTitle>
                <CardDescription>
                  Modifiez le template "{selectedTemplate.name}"
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du template</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={editForm.is_active}
                      onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="is_active">Template actif</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Sujet de l'email</Label>
                  <Input
                    id="subject"
                    value={editForm.subject}
                    onChange={(e) => setEditForm(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="variables">Variables disponibles</Label>
                  {renderVariables(DEFAULT_VARIABLES[selectedTemplate.type] || [])}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="html_content">Contenu HTML</Label>
                  <Textarea
                    id="html_content"
                    rows={20}
                    value={editForm.html_content}
                    onChange={(e) => setEditForm(prev => ({ ...prev, html_content: e.target.value }))}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={updateTemplateMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateTemplateMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setActiveTab('list');
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Edit3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Sélectionnez un template à modifier dans la liste.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Test d'Envoi de Template</CardTitle>
              <CardDescription>
                Envoyez un email de test avec des données factices pour vérifier le rendu des templates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Les emails de test utilisent des données fictives pour toutes les variables du template.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="test-email">Adresse email de test</Label>
                <Input
                  id="test-email"
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="font-semibold">Templates disponibles</h3>
                {templates?.filter(t => t.is_active).map(template => {
                  const typeInfo = getTemplateTypeInfo(template.type);
                  return (
                    <div key={template.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <Badge className={typeInfo.color} variant="secondary">
                          {typeInfo.label}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleTestEmail(template.id)}
                        disabled={testEmailMutation.isPending || !testEmail}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Tester
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};