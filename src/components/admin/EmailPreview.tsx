import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Smartphone, Monitor, Tablet } from 'lucide-react';

interface EmailPreviewProps {
  htmlContent: string;
  variables: string[];
  templateType: string;
}

const SAMPLE_DATA: Record<string, any> = {
  user_registration: {
    userName: 'Marie Dupont',
    userEmail: 'marie.dupont@example.com',
    profileType: 'Artiste',
    welcomeMessage: 'Bienvenue sur Vybbi !',
    loginUrl: 'https://vybbi.com/login',
    supportEmail: 'support@vybbi.com'
  },
  admin_notification: {
    userName: 'Jean Martin',
    userEmail: 'jean.martin@example.com',
    profileType: 'Manager',
    registrationDate: new Date().toLocaleDateString('fr-FR'),
    adminUrl: 'https://vybbi.com/admin'
  },
  review_notification: {
    artistName: 'Sophie Laurent',
    reviewerName: 'Club Le Nouveau Casino',
    rating: '4',
    message: 'Excellent artiste, performance remarquable !',
    profileUrl: 'https://vybbi.com/artiste/sophie-laurent'
  },
  contact_message: {
    senderName: 'Paul Dubois',
    senderEmail: 'paul.dubois@example.com',
    message: 'Bonjour, je suis intéressé par vos services...',
    replyUrl: 'https://vybbi.com/messages'
  },
  booking_proposed: {
    artistName: 'Les Nuits Électroniques',
    venueName: 'Olympia',
    eventTitle: 'Concert Électro Night',
    eventDate: '15 Mars 2024',
    proposedFee: '2500€',
    bookingUrl: 'https://vybbi.com/bookings'
  },
  booking_status_changed: {
    artistName: 'DJ Sarah',
    venueName: 'Rex Club',
    eventTitle: 'Soirée House',
    status: 'Confirmé',
    eventDate: '20 Mars 2024',
    bookingUrl: 'https://vybbi.com/bookings'
  }
};

export const EmailPreview: React.FC<EmailPreviewProps> = ({
  htmlContent,
  variables,
  templateType
}) => {
  const [viewMode, setViewMode] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  const getSampleData = () => {
    return SAMPLE_DATA[templateType] || {};
  };

  const processHtmlWithVariables = () => {
    let processedHtml = htmlContent;
    const sampleData = getSampleData();
    
    // Remplacer les variables avec les données d'exemple
    variables.forEach(variable => {
      const regex = new RegExp(`{{\\s*${variable}\\s*}}`, 'g');
      const value = sampleData[variable] || `[${variable}]`;
      processedHtml = processedHtml.replace(regex, value);
    });

    // Ajouter des styles de base pour une meilleure prévisualisation
    const styledHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; background: hsl(var(--card));">
        ${processedHtml}
      </div>
    `;
    
    return styledHtml;
  };

  const getViewportStyle = () => {
    switch (viewMode) {
      case 'mobile':
        return { width: '320px', height: '568px' };
      case 'tablet':
        return { width: '768px', height: '600px' };
      default:
        return { width: '100%', height: '600px' };
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Prévisualisation</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('desktop')}
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'tablet' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('tablet')}
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('mobile')}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {variables.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="text-sm text-muted-foreground">Variables utilisées:</span>
            {variables.slice(0, 5).map((variable) => (
              <Badge key={variable} variant="secondary" className="text-xs">
                {variable}
              </Badge>
            ))}
            {variables.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{variables.length - 5}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs defaultValue="preview" className="w-full">
          <div className="px-6 pb-3">
            <TabsList>
              <TabsTrigger value="preview">
                <Eye className="w-4 h-4 mr-2" />
                Aperçu
              </TabsTrigger>
              <TabsTrigger value="html">Code HTML</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="preview" className="mt-0">
            <div className="flex justify-center p-4 bg-muted/30">
              <div 
                style={getViewportStyle()} 
                className="border border-border rounded-lg overflow-auto bg-card shadow-sm transition-all duration-300"
              >
                <iframe
                  srcDoc={processHtmlWithVariables()}
                  className="w-full h-full border-0"
                  title="Email Preview"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="html" className="mt-0">
            <div className="p-4 bg-muted/30">
              <pre className="bg-background p-4 rounded-lg text-sm overflow-auto max-h-96 border">
                <code className="text-foreground">{processHtmlWithVariables()}</code>
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};