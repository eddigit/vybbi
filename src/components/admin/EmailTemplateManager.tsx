import React, { useState, useRef } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit3, Save, Eye, Mail, Trash2, Plus, AlertCircle, Upload, Monitor, Code, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EmailPreview } from './EmailPreview';
import { TemplateImportDialog } from './TemplateImportDialog';
import { VariablePalette } from './VariablePalette';
import EmailSystemValidator from './EmailSystemValidator';
import Editor from '@monaco-editor/react';

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
  { value: 'message_received', label: 'Nouveau message', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'prospect_follow_up', label: 'Suivi de prospection', color: 'bg-pink-100 text-pink-800' },
];

const DEFAULT_VARIABLES: Record<string, string[]> = {
  user_registration: ['userName', 'userEmail', 'profileType', 'welcomeMessage', 'loginUrl', 'supportEmail'],
  admin_notification: ['userName', 'userEmail', 'profileType', 'registrationDate', 'adminUrl'],
  review_notification: ['artistName', 'artistId', 'reviewerName', 'rating', 'message', 'profileUrl'],
  contact_message: ['senderName', 'senderEmail', 'message', 'replyUrl'],
  booking_proposed: ['venueName', 'eventTitle', 'eventDate', 'artistName', 'proposedFee', 'message', 'dashboardUrl', 'unsubscribeUrl'],
  booking_status_changed: ['artistName', 'eventTitle', 'eventDate', 'venueName', 'status', 'statusColor', 'message', 'dashboardUrl', 'unsubscribeUrl'],
  message_received: ['recipientName', 'senderName', 'message', 'messageUrl', 'unsubscribeUrl'],
  prospect_follow_up: ['userName', 'profileUrl', 'unsubscribeUrl'],
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
    type: '',
    is_active: true,
    variables: []
  });
  const [testEmail, setTestEmail] = useState('');
  const [editorMode, setEditorMode] = useState<'split' | 'code' | 'preview'>('split');
  const editorRef = useRef(null);

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

  const extractVariables = (htmlContent: string): string[] => {
    const regex = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;
    const variables = new Set<string>();
    let match;
    
    while ((match = regex.exec(htmlContent)) !== null) {
      variables.add(match[1]);
    }
    
    return Array.from(variables);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditForm(prev => ({ 
        ...prev, 
        html_content: value,
        variables: extractVariables(value)
      }));
    }
  };

  const handleImportTemplate = (htmlContent: string, detectedVariables: string[]) => {
    setEditForm(prev => ({
      ...prev,
      html_content: htmlContent,
      variables: detectedVariables
    }));
    setActiveTab('editor');
  };

  const handleInsertVariable = (variable: string) => {
    if (editorRef.current) {
      // @ts-ignore
      const editor = editorRef.current;
      const position = editor.getPosition();
      const range = {
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      };
      
      editor.executeEdits('insert-variable', [{
        range: range,
        text: variable
      }]);
      
      editor.focus();
    }
  };

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditForm({
      name: template.name,
      subject: template.subject,
      html_content: template.html_content,
      type: template.type,
      is_active: template.is_active,
      variables: extractVariables(template.html_content)
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
    if (!variables || variables.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1">
        {variables.slice(0, 8).map((variable, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {variable}
          </Badge>
        ))}
        {variables.length > 8 && (
          <Badge variant="outline" className="text-xs">
            +{variables.length - 8}
          </Badge>
        )}
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
          <TabsTrigger value="validation">Validation</TabsTrigger>
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

        <TabsContent value="editor" className="space-y-6">
          {!isEditing ? (
            <div className="text-center py-8">
              <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Sélectionner un Template</h3>
              <p className="text-muted-foreground mb-4">
                Choisissez un template dans la liste pour commencer l'édition
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => setActiveTab('list')}>
                  Voir la Liste
                </Button>
                <TemplateImportDialog onImport={handleImportTemplate}>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Importer
                  </Button>
                </TemplateImportDialog>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header avec informations générales */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="edit-name">Nom du Template</Label>
                      <Input
                        id="edit-name"
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-type">Type</Label>
                      <Select
                        value={editForm.type}
                        onValueChange={(value) => setEditForm(prev => ({ ...prev, type: value, variables: extractVariables(editForm.html_content) }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le type" />
                        </SelectTrigger>
                        <SelectContent>
                          {TEMPLATE_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-subject">Sujet de l'Email</Label>
                      <Input
                        id="edit-subject"
                        value={editForm.subject}
                        onChange={(e) => setEditForm(prev => ({ ...prev, subject: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="edit-active"
                        checked={editForm.is_active}
                        onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, is_active: checked }))}
                      />
                      <Label htmlFor="edit-active">Template actif</Label>
                    </div>
                    
                    <div className="flex gap-2">
                      <div className="flex border rounded-lg">
                        <Button
                          variant={editorMode === 'code' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setEditorMode('code')}
                        >
                          <Code className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={editorMode === 'split' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setEditorMode('split')}
                        >
                          <Monitor className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={editorMode === 'preview' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setEditorMode('preview')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <TemplateImportDialog onImport={handleImportTemplate}>
                        <Button variant="outline" size="sm">
                          <Upload className="w-4 h-4 mr-2" />
                          Importer
                        </Button>
                      </TemplateImportDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Zone d'édition principale */}
              <div className={`grid gap-4 ${editorMode === 'split' ? 'grid-cols-12' : 'grid-cols-1'}`}>
                {/* Palette d'outils - toujours visible en mode split */}
                {editorMode === 'split' && (
                  <div className="col-span-3">
                    <VariablePalette 
                      templateType={editForm.type}
                      onInsertVariable={handleInsertVariable}
                    />
                  </div>
                )}
                
                {/* Éditeur de code */}
                {(editorMode === 'code' || editorMode === 'split') && (
                  <div className={editorMode === 'split' ? 'col-span-5' : 'col-span-1'}>
                    <Card className="h-full">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Code className="w-5 h-5" />
                          Éditeur HTML
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="border-t">
                          <Editor
                            height="600px"
                            defaultLanguage="html"
                            value={editForm.html_content}
                            onChange={handleEditorChange}
                            onMount={(editor) => { editorRef.current = editor; }}
                            options={{
                              minimap: { enabled: false },
                              fontSize: 14,
                              wordWrap: 'on',
                              automaticLayout: true,
                              scrollBeyondLastLine: false,
                              renderLineHighlight: 'line',
                              selectOnLineNumbers: true,
                              roundedSelection: false,
                              readOnly: false,
                              cursorStyle: 'line',
                              theme: 'vs-dark'
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {/* Zone de prévisualisation */}
                {(editorMode === 'preview' || editorMode === 'split') && (
                  <div className={editorMode === 'split' ? 'col-span-4' : 'col-span-1'}>
                    <EmailPreview
                      htmlContent={editForm.html_content}
                      variables={editForm.variables || []}
                      templateType={editForm.type}
                    />
                  </div>
                )}
                
                {/* Palette d'outils en mode plein écran */}
                {editorMode !== 'split' && (
                  <div className="col-span-1">
                    <VariablePalette 
                      templateType={editForm.type}
                      onInsertVariable={handleInsertVariable}
                    />
                  </div>
                )}
              </div>
              
              {/* Variables détectées */}
              {editForm.variables && editForm.variables.length > 0 && (
                <Card>
                  <CardContent className="pt-4">
                    <Label className="text-sm font-medium">Variables détectées ({editForm.variables.length})</Label>
                    <div className="mt-2">
                      {renderVariables(editForm.variables)}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Actions */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setActiveTab('list');
                  }}
                >
                  Retour à la Liste
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab('test')}
                    disabled={!editForm.html_content}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Tester
                  </Button>
                  <Button onClick={handleSave} disabled={updateTemplateMutation.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    {updateTemplateMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </div>
              </div>
            </div>
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

        <TabsContent value="validation">
          <EmailSystemValidator />
        </TabsContent>
      </Tabs>
    </div>
  );
};