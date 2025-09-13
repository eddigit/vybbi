import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Editor } from '@monaco-editor/react';
import EmailSystemValidator from './EmailSystemValidator';
import { EmailVisualEditor } from './EmailVisualEditor';
import { EmailDragDropEditor, EmailBlockData } from './EmailDragDropEditor';
import { Eye, Code, Split, FileText, Send, CheckCircle, XCircle, Edit, Plus, Filter, Settings, Wand2 } from "lucide-react";

// Types
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  type: string;
  category?: string;
  language?: string;
  is_active: boolean;
  variables?: any;
  created_at: string;
  updated_at: string;
}

const TEMPLATE_TYPES = [
  { value: 'user_registration', label: 'Inscription utilisateur', color: 'bg-blue-100 text-blue-800' },
  { value: 'admin_notification', label: 'Notification admin', color: 'bg-purple-100 text-purple-800' },
  { value: 'review_notification', label: 'Notification avis', color: 'bg-green-100 text-green-800' },
  { value: 'booking_confirmation', label: 'Confirmation réservation', color: 'bg-orange-100 text-orange-800' },
  { value: 'welcome', label: 'Bienvenue', color: 'bg-pink-100 text-pink-800' },
  { value: 'password_reset', label: 'Réinitialisation mot de passe', color: 'bg-red-100 text-red-800' },
  { value: 'newsletter', label: 'Newsletter', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'promotional', label: 'Promotionnel', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'system', label: 'Système', color: 'bg-gray-100 text-gray-800' }
];

const TEMPLATE_CATEGORIES = [
  { value: 'notifications', label: 'Notifications', color: 'bg-blue-500' },
  { value: 'artistes', label: 'Artistes', color: 'bg-purple-500' },
  { value: 'lieux', label: 'Lieux', color: 'bg-green-500' },
  { value: 'agents', label: 'Agents', color: 'bg-orange-500' }
];

const TEMPLATE_LANGUAGES = [
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'en', label: 'English', flag: '🇬🇧' }
];

const DEFAULT_VARIABLES: Record<string, Record<string, string>> = {
  user_registration: {
    userName: 'Nom de l\'utilisateur',
    userEmail: 'Email de l\'utilisateur',
    profileType: 'Type de profil',
    welcomeMessage: 'Message de bienvenue',
    loginUrl: 'Lien de connexion',
    supportEmail: 'Email de support'
  },
  admin_notification: {
    userName: 'Nom de l\'utilisateur',
    userEmail: 'Email de l\'utilisateur',
    profileType: 'Type de profil',
    registrationDate: 'Date d\'inscription',
    adminUrl: 'Lien admin'
  },
  review_notification: {
    artistName: 'Nom de l\'artiste',
    reviewerName: 'Nom du reviewer',
    rating: 'Note donnée',
    message: 'Message du review',
    profileUrl: 'Lien vers le profil'
  }
};

export const EmailTemplateManager: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'editor' | 'dragdrop' | 'visual' | 'test' | 'validation'>('list');
  const [editorMode, setEditorMode] = useState<'code' | 'split' | 'preview'>('code');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [emailBlocks, setEmailBlocks] = useState<EmailBlockData[]>([]);
  const [testEmail, setTestEmail] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    html_content: '',
    type: '',
    category: 'notifications',
    language: 'fr',
    is_active: true
  });

  const queryClient = useQueryClient();

  // Fetch email templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('category', { ascending: true })
        .order('language', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EmailTemplate[];
    }
  });

  // Filter templates
  const filteredTemplates = templates?.filter(template => {
    const categoryMatch = filterCategory === 'all' || template.category === filterCategory;
    const languageMatch = filterLanguage === 'all' || template.language === filterLanguage;
    return categoryMatch && languageMatch;
  }) || [];

  const updateTemplateMutation = useMutation({
    mutationFn: async (updates: Partial<EmailTemplate>) => {
      if (!selectedTemplate) throw new Error('No template selected');
      
      const { data, error } = await supabase
        .from('email_templates')
        .update(updates)
        .eq('id', selectedTemplate.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Template mis à jour avec succès');
      setIsEditing(false);
    },
    onError: (error) => {
      console.error('Error updating template:', error);
      toast.error('Erreur lors de la mise à jour du template');
    }
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('email_templates')
        .insert([templateData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Template créé avec succès');
      setActiveTab('list');
    },
    onError: (error) => {
      console.error('Error creating template:', error);
      toast.error('Erreur lors de la création du template');
    }
  });

  const testEmailMutation = useMutation({
    mutationFn: async ({ templateId, email }: { templateId: string; email: string }) => {
      const template = templates?.find(t => t.id === templateId);
      if (!template) throw new Error('Template non trouvé');

      // Mock data for testing
      const mockData: Record<string, any> = {
        userName: 'John Doe',
        userEmail: email,
        profileType: 'artist',
        artistName: 'Jane Artist',
        reviewerName: 'Mike Reviewer',
        rating: 5,
        message: 'Ceci est un message de test pour le template email.'
      };

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
      toast.success(`Email de test envoyé à ${testEmail}`);
      setTestEmail('');
    },
    onError: (error) => {
      console.error('Error sending test email:', error);
      toast.error('Erreur lors de l\'envoi du test');
    }
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

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      html_content: template.html_content,
      type: template.type,
      category: template.category || 'notifications',
      language: template.language || 'fr',
      is_active: template.is_active
    });
    setIsEditing(true);
    setActiveTab('dragdrop');
  };

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setFormData({
      name: '',
      subject: '',
      html_content: '',
      type: '',
      category: 'notifications',
      language: 'fr',
      is_active: true
    });
    setEmailBlocks([]);
    setIsEditing(true);
    setActiveTab('dragdrop');
  };

  const handleSave = () => {
    if (selectedTemplate) {
      updateTemplateMutation.mutate(formData);
    } else {
      createTemplateMutation.mutate(formData);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setFormData(prev => ({ ...prev, html_content: value }));
    }
  };

  const handleInsertVariable = (variable: string) => {
    setFormData(prev => ({ 
      ...prev, 
      html_content: prev.html_content + `{{${variable}}}` 
    }));
  };

  const handleTestEmail = (templateId: string) => {
    if (!testEmail) {
      toast.error('Veuillez saisir une adresse email pour le test');
      return;
    }
    testEmailMutation.mutate({ templateId, email: testEmail });
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
            <Send className="h-5 w-5" />
            Gestion des Templates Email
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="w-full">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Liste
            </TabsTrigger>
            <TabsTrigger value="dragdrop" className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Constructeur
            </TabsTrigger>
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Éditeur HTML
            </TabsTrigger>
            <TabsTrigger value="visual" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Éditeur Visuel
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Test
            </TabsTrigger>
            <TabsTrigger value="validation" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Validation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <Label>Catégorie:</Label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      {TEMPLATE_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Label>Langue:</Label>
                  <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      {TEMPLATE_LANGUAGES.map(lang => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.flag} {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleCreateNew} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nouveau template
              </Button>
            </div>

            <div className="grid gap-4">
              {TEMPLATE_CATEGORIES.map(category => {
                const categoryTemplates = filteredTemplates.filter(t => t.category === category.value);
                if (categoryTemplates.length === 0) return null;
                
                return (
                  <div key={category.value} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                      <h3 className="font-medium text-lg">{category.label}</h3>
                      <Badge variant="secondary">{categoryTemplates.length}</Badge>
                    </div>
                    
                    <div className="grid gap-3 ml-5">
                      {categoryTemplates.map((template) => (
                        <Card key={template.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold">{template.name}</h4>
                                <span className="text-lg">
                                  {TEMPLATE_LANGUAGES.find(l => l.value === template.language)?.flag}
                                </span>
                                {TEMPLATE_TYPES.find(t => t.value === template.type) && (
                                  <Badge variant="outline" className="text-xs">
                                    {TEMPLATE_TYPES.find(t => t.value === template.type)?.label}
                                  </Badge>
                                )}
                                <div className="flex items-center gap-2">
                                  {template.is_active ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-red-500" />
                                  )}
                                  <span className="text-sm text-muted-foreground">
                                    {template.is_active ? 'Actif' : 'Inactif'}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                <strong>Sujet:</strong> {template.subject}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Mis à jour: {new Date(template.updated_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <Button
                              onClick={() => handleEdit(template)}
                              className="flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Modifier
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="dragdrop" className="space-y-4">
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  {selectedTemplate ? `Édition: ${selectedTemplate.name}` : 'Nouveau template'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Form fields */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du template</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nom du template"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TEMPLATE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Langue</Label>
                    <Select
                      value={formData.language}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TEMPLATE_LANGUAGES.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.flag} {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Sujet</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Sujet de l'email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
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
                </div>

                {/* Drag & Drop Editor */}
                <div className="border rounded-lg" style={{ height: '600px' }}>
                  <EmailDragDropEditor
                    initialBlocks={emailBlocks}
                    onBlocksChange={setEmailBlocks}
                    onHtmlChange={(html) => setFormData(prev => ({ ...prev, html_content: html }))}
                    variables={Object.keys(DEFAULT_VARIABLES[formData.type] || {})}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={updateTemplateMutation.isPending || createTemplateMutation.isPending}
                  >
                    {(updateTemplateMutation.isPending || createTemplateMutation.isPending) ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="editor" className="space-y-4">
            {selectedTemplate && (
              <Card className="p-6">
                <CardHeader>
                  <CardTitle>Éditeur HTML - {selectedTemplate.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <Label>Contenu HTML</Label>
                    <div className="flex space-x-2">
                      <Button
                        variant={editorMode === 'code' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setEditorMode('code')}
                      >
                        <Code className="w-4 h-4 mr-2" />
                        Code
                      </Button>
                      <Button
                        variant={editorMode === 'split' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setEditorMode('split')}
                      >
                        <Split className="w-4 h-4 mr-2" />
                        Divisé
                      </Button>
                      <Button
                        variant={editorMode === 'preview' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setEditorMode('preview')}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Aperçu
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden" style={{ height: '500px' }}>
                    {editorMode === 'code' && (
                      <Editor
                        height="500px"
                        defaultLanguage="html"
                        value={formData.html_content}
                        onChange={handleEditorChange}
                        options={{
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          fontSize: 14,
                          wordWrap: 'on'
                        }}
                      />
                    )}
                    
                    {editorMode === 'split' && (
                      <div className="flex h-full">
                        <div className="flex-1 border-r">
                          <Editor
                            height="500px"
                            defaultLanguage="html"
                            value={formData.html_content}
                            onChange={handleEditorChange}
                            options={{
                              minimap: { enabled: false },
                              scrollBeyondLastLine: false,
                              fontSize: 12
                            }}
                          />
                        </div>
                        <div className="flex-1 p-4 bg-gray-50 overflow-auto">
                          <div 
                            className="bg-white p-4 rounded shadow-sm"
                            dangerouslySetInnerHTML={{ __html: formData.html_content }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {editorMode === 'preview' && (
                      <div className="p-4 bg-gray-50 h-full overflow-auto">
                        <div 
                          className="bg-white p-4 rounded shadow-sm max-w-2xl mx-auto"
                          dangerouslySetInnerHTML={{ __html: formData.html_content }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Variable palette */}
                  <div className="bg-muted p-4 rounded-lg">
                    <Label className="text-sm font-medium mb-2 block">Variables disponibles</Label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(DEFAULT_VARIABLES[formData.type] || {}).map(([key, description]) => (
                        <Button
                          key={key}
                          variant="outline"
                          size="sm"
                          onClick={() => handleInsertVariable(key)}
                          className="text-xs"
                        >
                          {`{{${key}}}`}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleSave}>
                      Sauvegarder
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="visual" className="space-y-4">
            {selectedTemplate && (
              <Card className="p-6">
                <CardHeader>
                  <CardTitle>Éditeur Visuel - {selectedTemplate.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <EmailVisualEditor
                    htmlContent={formData.html_content}
                    onContentChange={(content) => setFormData(prev => ({ ...prev, html_content: content }))}
                    onSave={handleSave}
                    isLoading={updateTemplateMutation.isPending}
                    templateType={formData.type}
                    variables={Object.keys(DEFAULT_VARIABLES[formData.type] || {})}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Test d'envoi d'email</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="email@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    type="email"
                  />
                  <Button 
                    onClick={() => selectedTemplate && handleTestEmail(selectedTemplate.id)}
                    disabled={!selectedTemplate || testEmailMutation.isPending}
                  >
                    {testEmailMutation.isPending ? 'Envoi...' : 'Envoyer test'}
                  </Button>
                </div>
                
                <div className="grid gap-4">
                  {filteredTemplates
                    .filter(template => template.is_active)
                    .map((template) => (
                      <Card key={template.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{template.name}</h4>
                            <p className="text-sm text-muted-foreground">{template.subject}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleTestEmail(template.id)}
                            disabled={!testEmail || testEmailMutation.isPending}
                          >
                            Test
                          </Button>
                        </div>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="validation" className="space-y-4">
            <EmailSystemValidator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};