import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Send, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  provider?: string;
  required_variables?: string[];
}

interface EmailTemplatePreviewProps {
  template: EmailTemplate;
  onEdit: (template: EmailTemplate) => void;
  onTest: (templateId: string) => void;
  testEmail: string;
  setTestEmail: (email: string) => void;
  isLoading?: boolean;
}

export const EmailTemplatePreview: React.FC<EmailTemplatePreviewProps> = ({
  template,
  onEdit,
  onTest,
  testEmail,
  setTestEmail,
  isLoading = false
}) => {
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'user_registration': 'bg-blue-500',
      'admin_notification': 'bg-purple-500',
      'review_notification': 'bg-green-500',
      'booking_proposed': 'bg-orange-500',
      'booking_status_changed': 'bg-yellow-500',
      'message_received': 'bg-indigo-500',
      'prospect_follow_up': 'bg-pink-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      'notifications': 'bg-blue-100 text-blue-800',
      'artistes': 'bg-purple-100 text-purple-800',
      'lieux': 'bg-green-100 text-green-800',
      'agents': 'bg-orange-100 text-orange-800',
    };
    return colors[category || 'notifications'] || 'bg-gray-100 text-gray-800';
  };

  // Générer des données de test pour la prévisualisation
  const mockData: Record<string, string> = {
    userName: 'Jean Dupont',
    userEmail: 'jean.dupont@example.com',
    profileType: 'artist',
    artistName: 'Jean Dupont',
    reviewerName: 'Marie Martin',
    rating: '5',
    message: 'Excellent travail, très professionnel !',
    eventTitle: 'Concert au Zénith',
    eventDate: '15 mars 2024',
    venueName: 'Zénith de Paris',
    proposedFee: '1500',
    status: 'confirmé',
    statusColor: '#10b981',
    senderName: 'Sophie Leroy',
    recipientName: 'Jean Dupont',
    dashboardUrl: `${window.location.origin}/dashboard`,
    profileUrl: `${window.location.origin}/profile/123`,
    messageUrl: `${window.location.origin}/messages/456`,
    unsubscribeUrl: `${window.location.origin}/unsubscribe`,
    adminUrl: `${window.location.origin}/admin/dashboard`,
    registrationDate: new Date().toLocaleDateString('fr-FR')
  };

  // Remplacer les variables dans le contenu pour la prévisualisation
  const getPreviewContent = () => {
    let previewHtml = template.html_content;
    let previewSubject = template.subject;

    Object.entries(mockData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      previewHtml = previewHtml.replace(regex, value);
      previewSubject = previewSubject.replace(regex, value);
    });

    return { html: previewHtml, subject: previewSubject };
  };

  const { html: previewHtml, subject: previewSubject } = getPreviewContent();

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <Badge variant={template.is_active ? "default" : "secondary"}>
              {template.is_active ? 'Actif' : 'Inactif'}
            </Badge>
            <Badge className={getTypeColor(template.type)} variant="outline">
              {template.type}
            </Badge>
            <Badge className={getCategoryColor(template.category)} variant="outline">
              {template.category}
            </Badge>
            <Badge variant="outline">{template.language || 'fr'} 🇫🇷</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline" 
              size="sm"
              onClick={() => onEdit(template)}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Éditer
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          <strong>Sujet:</strong> {previewSubject}
        </div>
        {template.required_variables && template.required_variables.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <strong>Variables requises:</strong>
            {template.required_variables.map((variable, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {`{{${variable}}}`}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {/* Aperçu du contenu */}
        <div className="mb-4">
          <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
            <div 
              dangerouslySetInnerHTML={{ __html: previewHtml }}
              className="email-preview"
            />
          </div>
        </div>

        {/* Test de l'email */}
        <div className="flex items-center gap-3 pt-3 border-t">
          <div className="flex-1">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Email de test (ex: test@example.com)"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button
            onClick={() => testEmail && onTest(template.id)}
            disabled={!testEmail || isLoading}
            size="sm"
            className="min-w-[100px]"
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Envoi...' : 'Tester'}
          </Button>
        </div>
      </CardContent>

      <style>{`
        .email-preview {
          font-family: Arial, sans-serif;
        }
        .email-preview img {
          max-width: 100%;
          height: auto;
        }
        .email-preview a {
          color: #3b82f6;
          text-decoration: underline;
        }
      `}</style>
    </Card>
  );
};