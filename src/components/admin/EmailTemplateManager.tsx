import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
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
import { EmailTemplatePreview } from './EmailTemplatePreview';
import { Eye, Code, Split, FileText, Send, CheckCircle, XCircle, Edit, Plus, Filter, Settings, Wand2 } from "lucide-react";

// Types
type TabValue = 'list' | 'editor' | 'dragdrop' | 'design' | 'visual' | 'test' | 'validation';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  type: string;
  category?: string;
  language?: string;
  is_active: boolean;
  variables?: Json | null;
  
  brevo_template_id?: string | null;
  created_at: string;
  updated_at: string;
}

interface BrevoTemplateItem {
  id: number;
  name: string;
  subject?: string;
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
  const [activeTab, setActiveTab] = useState<TabValue>('list');
  const [editorMode, setEditorMode] = useState<'code' | 'split' | 'preview'>('code');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [emailBlocks, setEmailBlocks] = useState<EmailBlockData[]>([]);
  const [testEmail, setTestEmail] = useState('');
  const [brevoTemplates, setBrevoTemplates] = useState<BrevoTemplateItem[]>([]);
  const [brevoLoading, setBrevoLoading] = useState(false);
  
  // Design global state
  const [designSettings, setDesignSettings] = useState({
    backgroundColor: '#f4f4f4',
    containerBackground: '#ffffff',
    primaryColor: '#6366f1',
    textColor: '#333333',
    linkColor: '#6366f1',
    buttonBackground: '#6366f1',
    buttonTextColor: '#ffffff',
    borderRadius: '6px'
  });
  
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
  .select('id, name, subject, html_content, type, category, language, is_active, variables, brevo_template_id, created_at, updated_at')
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
        .maybeSingle();
      
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
        .maybeSingle();
      
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
  const mockData: Record<string, string | number> = {
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

  // Parser HTML existant vers blocs
  const parseHtmlToBlocks = (htmlContent: string): EmailBlockData[] => {
    const blocks: EmailBlockData[] = [];
    
    if (!htmlContent.trim()) return blocks;
    
    // Parser simple pour convertir HTML en blocs
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const body = doc.body;
    
    let blockIndex = 0;
    
    const parseElement = (element: Element) => {
      const tagName = element.tagName.toLowerCase();
    const textContent = element.textContent?.trim() || '';
      const innerHTML = element.innerHTML;
      const style = element.getAttribute('style') || '';
      
      // Ignorer les éléments vides sauf hr et img
      if (!textContent && !['hr', 'img'].includes(tagName) && !innerHTML.includes('<img')) {
        // Parser les enfants récursivement
        Array.from(element.children).forEach(child => parseElement(child));
        return;
      }
      
      switch (tagName) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          if (textContent) {
            blocks.push({
              id: `block-${Date.now()}-${blockIndex++}`,
              type: 'title',
              content: textContent,
              properties: {
                level: parseInt(tagName.charAt(1)),
                color: extractStyleValue(style, 'color') || '#333333',
                align: extractStyleValue(style, 'text-align') || 'left'
              }
            });
          }
          break;
          
        case 'p':
          if (textContent) {
            // Vérifier si c'est une variable
            const variableMatch = textContent.match(/^\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}$/);
            if (variableMatch) {
              blocks.push({
                id: `block-${Date.now()}-${blockIndex++}`,
                type: 'variable',
                content: variableMatch[1],
                properties: {}
              });
            } else {
              blocks.push({
                id: `block-${Date.now()}-${blockIndex++}`,
                type: 'text',
                content: textContent,
                properties: {
                  color: extractStyleValue(style, 'color') || '#333333',
                  align: extractStyleValue(style, 'text-align') || 'left',
                  fontSize: extractStyleValue(style, 'font-size') || '14px'
                }
              });
            }
          }
          break;
          
        case 'img': {
          const src = element.getAttribute('src');
          const alt = element.getAttribute('alt');
          if (src) {
            // Vérifier si c'est un logo (par convention ou taille)
            const isLogo = alt?.toLowerCase().includes('logo') || 
                          src.toLowerCase().includes('logo') ||
                          extractStyleValue(style, 'max-width') === '150px';
            
            blocks.push({
              id: `block-${Date.now()}-${blockIndex++}`,
              type: isLogo ? 'logo' : 'image',
              content: src,
              properties: {
                alt: alt || '',
                align: extractStyleValue(style, 'text-align') || getImageAlign(element) || 'center',
                maxWidth: isLogo ? extractStyleValue(style, 'max-width') || '150px' : undefined
              }
            });
          }
          break; }
          
        case 'a': {
          const href = element.getAttribute('href');
          const parentDiv = element.parentElement;
          const parentStyle = parentDiv?.getAttribute('style') || '';
          
          if (href && textContent) {
            // Vérifier si c'est un bouton (a des styles de bouton)
            const hasButtonStyles = style.includes('background-color') || 
                                  style.includes('padding') ||
                                  parentStyle.includes('background-color') ||
                                  (element as HTMLElement).style?.display === 'inline-block';
            
            if (hasButtonStyles) {
              blocks.push({
                id: `block-${Date.now()}-${blockIndex++}`,
                type: 'button',
                content: textContent,
                properties: {
                  url: href,
                  backgroundColor: extractStyleValue(style, 'background-color') || extractStyleValue(parentStyle, 'background-color') || '#007bff',
                  textColor: extractStyleValue(style, 'color') || '#ffffff',
                  align: extractStyleValue(parentStyle, 'text-align') || 'center',
                  padding: extractStyleValue(style, 'padding') || '12px 24px',
                  borderRadius: extractStyleValue(style, 'border-radius') || '4px'
                }
              });
            }
          }
          break; }
          
        case 'hr':
          blocks.push({
            id: `block-${Date.now()}-${blockIndex++}`,
            type: 'separator',
            content: '',
            properties: {
              color: extractStyleValue(style, 'background-color') || extractStyleValue(style, 'border-color') || '#e0e0e0',
              margin: extractStyleValue(style, 'margin') || '30px 0'
            }
          });
          break;
          
        case 'div': {
          // Vérifier si c'est un conteneur avec une image logo
          const imgChild = element.querySelector('img');
          if (imgChild && (imgChild.alt?.toLowerCase().includes('logo') || (imgChild as HTMLImageElement).src.toLowerCase().includes('logo'))) {
            const src = imgChild.getAttribute('src');
            if (src) {
              blocks.push({
                id: `block-${Date.now()}-${blockIndex++}`,
                type: 'logo',
                content: src,
                properties: {
                  align: extractStyleValue(style, 'text-align') || 'center',
                  maxWidth: extractStyleValue((imgChild.getAttribute('style') || ''), 'max-width') || '150px'
                }
              });
            }
          } else {
            // Parser les enfants récursivement
            Array.from(element.children).forEach(child => parseElement(child));
          }
          break; }
          
        default:
          // Parser les enfants récursivement
          Array.from(element.children).forEach(child => parseElement(child));
          break;
      }
    };
    
    const getImageAlign = (imgElement: Element): string => {
      const parent = imgElement.parentElement;
      if (parent) {
        const parentStyle = parent.getAttribute('style') || '';
        const align = extractStyleValue(parentStyle, 'text-align');
        if (align) return align;
        
        if (parentStyle.includes('margin: 0 auto') || parentStyle.includes('margin:0 auto')) {
          return 'center';
        }
      }
      return 'center';
    };
    
    // Parser le contenu principal
    if (body.children.length > 0) {
      Array.from(body.children).forEach(child => parseElement(child));
    } else {
      // Si pas de structure body, parser directement le contenu
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      Array.from(tempDiv.children).forEach(child => parseElement(child));
    }
    
    // Ajouter les variables trouvées dans le contenu comme blocs séparés
    const allVariables = extractVariables(htmlContent);
    allVariables.forEach(variable => {
      // Vérifier si cette variable n'est pas déjà incluse dans un bloc texte
      const alreadyInBlock = blocks.some(block => 
        block.type === 'variable' && block.content === variable
      );
      
      if (!alreadyInBlock) {
        blocks.push({
          id: `block-${Date.now()}-${blockIndex++}`,
          type: 'variable',
          content: variable,
          properties: {}
        });
      }
    });
    
    return blocks;
  };
  
  const extractStyleValue = (style: string, property: string): string | null => {
    const regex = new RegExp(`${property}\\s*:\\s*([^;]+)`, 'i');
    const match = style.match(regex);
    return match ? match[1].trim() : null;
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
    
    // Convertir le HTML existant en blocs
    const parsedBlocks = parseHtmlToBlocks(template.html_content);
    setEmailBlocks(parsedBlocks);
    
    setIsEditing(true);
    setActiveTab('dragdrop');
  };

  // Charger la liste des templates Brevo quand on passe sur provider=brevo
  useEffect(() => {
    const loadBrevoTemplates = async () => {
      try {
        setBrevoLoading(true);
        interface BrevoTemplatesResponse { templates?: BrevoTemplateItem[] }
        const { data, error } = await supabase.functions.invoke<BrevoTemplatesResponse>('brevo-templates');
        if (error) throw error;
        const list: BrevoTemplateItem[] = Array.isArray(data?.templates)
          ? data!.templates.map((t) => ({ id: t.id, name: t.name, subject: t.subject }))
          : [];
        setBrevoTemplates(list);
      } catch (e) {
        console.error('Erreur chargement templates Brevo:', e);
        toast.error("Impossible de charger les templates Brevo");
      } finally {
        setBrevoLoading(false);
      }
    };
    // Always load templates (removed provider check)
  }, [brevoTemplates.length]);

  // Créer des templates par défaut si aucun n'existe
  const createDefaultTemplates = () => {
    const defaultTemplates = [
      {
        name: 'Bienvenue utilisateur',
        subject: 'Bienvenue sur Vybbi !',
        type: 'user_registration',
        category: 'notifications',
        language: 'fr',
        is_active: true,
        html_content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bienvenue</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="https://via.placeholder.com/150x50/6366f1/ffffff?text=VYBBI" alt="Logo Vybbi" style="max-width: 150px;" />
  </div>
  
  <h1 style="color: #333; text-align: center;">Bienvenue {{userName}} !</h1>
  
  <p style="color: #666; font-size: 16px; line-height: 1.6;">
    Nous sommes ravis de vous accueillir sur Vybbi, la plateforme qui connecte les artistes, les lieux et les professionnels de la musique.
  </p>
  
  <p style="color: #666; font-size: 16px; line-height: 1.6;">
    Votre profil <strong>{{profileType}}</strong> a été créé avec succès. Vous pouvez maintenant explorer toutes les fonctionnalités de notre plateforme.
  </p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{loginUrl}}" style="display: inline-block; background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
      Accéder à mon tableau de bord
    </a>
  </div>
  
  <hr style="border: none; height: 1px; background-color: #e0e0e0; margin: 30px 0;" />
  
  <p style="color: #999; font-size: 14px; text-align: center;">
    Besoin d'aide ? Contactez notre support : {{supportEmail}}
  </p>
</body>
</html>`
      },
      {
        name: 'Notification admin',
        subject: 'Nouvelle inscription - {{userName}}',
        type: 'admin_notification',
        category: 'notifications',
        language: 'fr',
        is_active: true,
        html_content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Nouvelle inscription</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #333;">Nouvelle inscription sur Vybbi</h2>
  
  <p style="color: #666; font-size: 16px;">
    Un nouvel utilisateur vient de s'inscrire sur la plateforme :
  </p>
  
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
    <p><strong>Nom :</strong> {{userName}}</p>
    <p><strong>Email :</strong> {{userEmail}}</p>
    <p><strong>Type de profil :</strong> {{profileType}}</p>
    <p><strong>Date d'inscription :</strong> {{registrationDate}}</p>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{adminUrl}}" style="display: inline-block; background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
      Voir dans l'administration
    </a>
  </div>
</body>
</html>`
      }
    ];

    defaultTemplates.forEach(template => {
      createTemplateMutation.mutate(template);
    });
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
  is_active: true,
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
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabValue)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Liste
            </TabsTrigger>
            <TabsTrigger value="dragdrop" className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Constructeur
            </TabsTrigger>
            <TabsTrigger value="design" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Design
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
              <div className="flex items-center space-x-2">
                <Button onClick={handleCreateNew} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Nouveau template
                </Button>
                {(!templates || templates.length === 0) && (
                  <Button 
                    onClick={createDefaultTemplates} 
                    variant="outline" 
                    className="flex items-center gap-2"
                    disabled={createTemplateMutation.isPending}
                  >
                    <Settings className="w-4 h-4" />
                    {createTemplateMutation.isPending ? 'Création...' : 'Créer templates par défaut'}
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-4">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <Send className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">Aucun template trouvé</h3>
                  <p className="text-muted-foreground mb-4">
                    {templates?.length === 0 
                      ? "Commencez par créer des templates par défaut ou créez votre premier template."
                      : "Aucun template ne correspond aux filtres sélectionnés."
                    }
                  </p>
                  {templates?.length === 0 && (
                    <Button 
                      onClick={createDefaultTemplates}
                      disabled={createTemplateMutation.isPending}
                      className="mr-2"
                    >
                      {createTemplateMutation.isPending ? 'Création...' : 'Créer templates par défaut'}
                    </Button>
                  )}
                  <Button onClick={handleCreateNew} variant="outline">
                    Créer un template
                  </Button>
                </div>
              ) : (
                 <div className="space-y-4">
                   {filteredTemplates.map((template) => (
                     <EmailTemplatePreview
                       key={template.id}
                       template={template}
                       onEdit={handleEdit}
                       onTest={(templateId) => testEmailMutation.mutate({ 
                         templateId, 
                         email: testEmail 
                       })}
                       testEmail={testEmail}
                       setTestEmail={setTestEmail}
                       isLoading={testEmailMutation.isPending}
                     />
                   ))}
                 </div>
              )}
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select
                      value={formData.language}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TEMPLATE_LANGUAGES.map(lang => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.flag} {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.is_active ? 'active' : 'inactive'}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, is_active: value === 'active' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="inactive">Inactif</SelectItem>
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
                    designSettings={designSettings}
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

          <TabsContent value="design" className="space-y-4">
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configuration du design global
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Ces paramètres s'appliquent à l'ensemble du template email
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Couleurs de fond</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Label className="w-32">Arrière-plan</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={designSettings.backgroundColor}
                            onChange={(e) => setDesignSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                            className="w-12 h-8 rounded border cursor-pointer"
                          />
                          <Input
                            value={designSettings.backgroundColor}
                            onChange={(e) => setDesignSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                            className="w-24 text-xs"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Label className="w-32">Conteneur</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={designSettings.containerBackground}
                            onChange={(e) => setDesignSettings(prev => ({ ...prev, containerBackground: e.target.value }))}
                            className="w-12 h-8 rounded border cursor-pointer"
                          />
                          <Input
                            value={designSettings.containerBackground}
                            onChange={(e) => setDesignSettings(prev => ({ ...prev, containerBackground: e.target.value }))}
                            className="w-24 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Couleurs du texte</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Label className="w-32">Texte principal</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={designSettings.textColor}
                            onChange={(e) => setDesignSettings(prev => ({ ...prev, textColor: e.target.value }))}
                            className="w-12 h-8 rounded border cursor-pointer"
                          />
                          <Input
                            value={designSettings.textColor}
                            onChange={(e) => setDesignSettings(prev => ({ ...prev, textColor: e.target.value }))}
                            className="w-24 text-xs"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Label className="w-32">Liens</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={designSettings.linkColor}
                            onChange={(e) => setDesignSettings(prev => ({ ...prev, linkColor: e.target.value }))}
                            className="w-12 h-8 rounded border cursor-pointer"
                          />
                          <Input
                            value={designSettings.linkColor}
                            onChange={(e) => setDesignSettings(prev => ({ ...prev, linkColor: e.target.value }))}
                            className="w-24 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Boutons</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Label className="w-32">Fond bouton</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={designSettings.buttonBackground}
                            onChange={(e) => setDesignSettings(prev => ({ ...prev, buttonBackground: e.target.value }))}
                            className="w-12 h-8 rounded border cursor-pointer"
                          />
                          <Input
                            value={designSettings.buttonBackground}
                            onChange={(e) => setDesignSettings(prev => ({ ...prev, buttonBackground: e.target.value }))}
                            className="w-24 text-xs"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Label className="w-32">Texte bouton</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={designSettings.buttonTextColor}
                            onChange={(e) => setDesignSettings(prev => ({ ...prev, buttonTextColor: e.target.value }))}
                            className="w-12 h-8 rounded border cursor-pointer"
                          />
                          <Input
                            value={designSettings.buttonTextColor}
                            onChange={(e) => setDesignSettings(prev => ({ ...prev, buttonTextColor: e.target.value }))}
                            className="w-24 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Styles</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Label className="w-32">Couleur primaire</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={designSettings.primaryColor}
                            onChange={(e) => setDesignSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="w-12 h-8 rounded border cursor-pointer"
                          />
                          <Input
                            value={designSettings.primaryColor}
                            onChange={(e) => setDesignSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="w-24 text-xs"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Label className="w-32">Bordures</Label>
                        <Input
                          value={designSettings.borderRadius}
                          onChange={(e) => setDesignSettings(prev => ({ ...prev, borderRadius: e.target.value }))}
                          className="w-24 text-xs"
                          placeholder="6px"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prévisualisation des couleurs */}
                <div className="border rounded-lg p-4" style={{ backgroundColor: designSettings.backgroundColor }}>
                  <div 
                    className="p-6 rounded" 
                    style={{ 
                      backgroundColor: designSettings.containerBackground,
                      borderRadius: designSettings.borderRadius 
                    }}
                  >
                    <h3 style={{ color: designSettings.textColor, margin: '0 0 10px 0' }}>
                      Aperçu du design
                    </h3>
                    <p style={{ color: designSettings.textColor, margin: '0 0 15px 0' }}>
                      Ceci est un exemple de texte avec un{' '}
                      <a href="#" style={{ color: designSettings.linkColor }}>lien coloré</a>.
                    </p>
                    <div style={{ textAlign: 'center' }}>
                      <a 
                        href="#"
                        style={{
                          display: 'inline-block',
                          backgroundColor: designSettings.buttonBackground,
                          color: designSettings.buttonTextColor,
                          padding: '12px 24px',
                          textDecoration: 'none',
                          borderRadius: designSettings.borderRadius,
                          fontWeight: 'bold'
                        }}
                      >
                        Exemple de bouton
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="editor" className="space-y-4">
            {isEditing && (
              <Card className="p-6">
                <CardHeader>
                  <CardTitle>
                    Éditeur HTML - {selectedTemplate ? selectedTemplate.name : 'Nouveau template'}
                  </CardTitle>
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
                            className="bg-card p-4 rounded shadow-sm"
                            dangerouslySetInnerHTML={{ __html: formData.html_content }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {editorMode === 'preview' && (
                      <div className="p-4 bg-gray-50 h-full overflow-auto">
                        <div 
                          className="bg-card p-4 rounded shadow-sm max-w-2xl mx-auto"
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