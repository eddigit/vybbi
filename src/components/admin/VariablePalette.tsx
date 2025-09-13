import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Plus, Search, Braces } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VariablePaletteProps {
  templateType: string;
  onInsertVariable: (variable: string) => void;
}

const DEFAULT_VARIABLES: Record<string, string[]> = {
  user_registration: ['userName', 'userEmail', 'profileType', 'welcomeMessage', 'loginUrl', 'supportEmail'],
  admin_notification: ['userName', 'userEmail', 'profileType', 'registrationDate', 'adminUrl'],
  review_notification: ['artistName', 'reviewerName', 'rating', 'message', 'profileUrl'],
  contact_message: ['senderName', 'senderEmail', 'message', 'replyUrl'],
  booking_proposed: ['artistName', 'venueName', 'eventTitle', 'eventDate', 'proposedFee', 'bookingUrl'],
  booking_status_changed: ['artistName', 'venueName', 'eventTitle', 'status', 'eventDate', 'bookingUrl']
};

const COMMON_VARIABLES = [
  'siteName', 'siteUrl', 'logoUrl', 'currentYear', 'currentDate', 
  'supportEmail', 'unsubscribeUrl', 'privacyUrl', 'termsUrl'
];

const HTML_SNIPPETS = [
  {
    name: 'Bouton CTA',
    code: `<div style="text-align: center; margin: 20px 0;">
  <a href="{{ actionUrl }}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
    {{ buttonText }}
  </a>
</div>`
  },
  {
    name: 'En-tête avec Logo',
    code: `<div style="text-align: center; padding: 20px; background-color: #f8f9fa;">
  <img src="{{ logoUrl }}" alt="{{ siteName }}" style="max-height: 60px;">
  <h1 style="margin: 10px 0; color: #333;">{{ emailTitle }}</h1>
</div>`
  },
  {
    name: 'Pied de Page',
    code: `<div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin-top: 30px; border-top: 1px solid #dee2e6;">
  <p style="margin: 0; color: #6c757d; font-size: 12px;">
    © {{ currentYear }} {{ siteName }}. Tous droits réservés.
  </p>
  <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 12px;">
    <a href="{{ unsubscribeUrl }}" style="color: #6c757d;">Se désabonner</a> | 
    <a href="{{ privacyUrl }}" style="color: #6c757d;">Confidentialité</a>
  </p>
</div>`
  },
  {
    name: 'Section de Contenu',
    code: `<div style="background-color: white; padding: 30px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
  <h2 style="color: #333; margin-top: 0;">{{ sectionTitle }}</h2>
  <p style="color: #666; line-height: 1.6;">{{ sectionContent }}</p>
</div>`
  }
];

export const VariablePalette: React.FC<VariablePaletteProps> = ({
  templateType,
  onInsertVariable
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [customVariable, setCustomVariable] = React.useState('');
  const { toast } = useToast();

  const templateVariables = DEFAULT_VARIABLES[templateType] || [];
  
  const filteredTemplateVars = templateVariables.filter(variable =>
    variable.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredCommonVars = COMMON_VARIABLES.filter(variable =>
    variable.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInsertVariable = (variable: string) => {
    onInsertVariable(`{{ ${variable} }}`);
    toast({
      description: `Variable {{ ${variable} }} insérée`,
    });
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: "Code copié dans le presse-papier",
    });
  };

  const handleInsertCustomVariable = () => {
    if (customVariable.trim()) {
      handleInsertVariable(customVariable.trim());
      setCustomVariable('');
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Braces className="w-5 h-5" />
          Palette d'Outils
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une variable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Tabs defaultValue="template" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="template" className="text-xs">Template</TabsTrigger>
            <TabsTrigger value="common" className="text-xs">Communes</TabsTrigger>
            <TabsTrigger value="snippets" className="text-xs">Snippets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="template" className="space-y-2 max-h-60 overflow-y-auto">
            <Label className="text-sm font-medium">Variables du Template</Label>
            {filteredTemplateVars.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune variable trouvée</p>
            ) : (
              <div className="space-y-1">
                {filteredTemplateVars.map((variable) => (
                  <Button
                    key={variable}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleInsertVariable(variable)}
                    className="w-full justify-start h-auto p-2"
                  >
                    <Badge variant="secondary" className="mr-2 font-mono text-xs">
                      {variable}
                    </Badge>
                  </Button>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="common" className="space-y-2 max-h-60 overflow-y-auto">
            <Label className="text-sm font-medium">Variables Communes</Label>
            {filteredCommonVars.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune variable trouvée</p>
            ) : (
              <div className="space-y-1">
                {filteredCommonVars.map((variable) => (
                  <Button
                    key={variable}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleInsertVariable(variable)}
                    className="w-full justify-start h-auto p-2"
                  >
                    <Badge variant="outline" className="mr-2 font-mono text-xs">
                      {variable}
                    </Badge>
                  </Button>
                ))}
              </div>
            )}
            
            <div className="border-t pt-3 mt-3">
              <Label className="text-sm font-medium">Variable Personnalisée</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="nomVariable"
                  value={customVariable}
                  onChange={(e) => setCustomVariable(e.target.value)}
                  className="flex-1 font-mono text-sm"
                />
                <Button 
                  size="sm" 
                  onClick={handleInsertCustomVariable}
                  disabled={!customVariable.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="snippets" className="space-y-2 max-h-60 overflow-y-auto">
            <Label className="text-sm font-medium">Fragments HTML</Label>
            <div className="space-y-2">
              {HTML_SNIPPETS.map((snippet, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm">{snippet.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyToClipboard(snippet.code)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <pre className="text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap bg-muted/30 p-2 rounded">
                    {snippet.code.substring(0, 100)}...
                  </pre>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};