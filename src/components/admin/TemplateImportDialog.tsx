import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Download, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface TemplateImportDialogProps {
  onImport: (htmlContent: string, detectedVariables: string[]) => void;
  children: React.ReactNode;
}

export const TemplateImportDialog: React.FC<TemplateImportDialogProps> = ({
  onImport,
  children
}) => {
  const [open, setOpen] = useState(false);
  const [importContent, setImportContent] = useState('');
  const [detectedVariables, setDetectedVariables] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<'paste' | 'file'>('paste');

  // Patterns de variables couramment utilisés
  const VARIABLE_PATTERNS = [
    // Brevo/Sendinblue: {{ contact.ATTRIBUTE }}
    /\{\{\s*contact\.([A-Z_]+)\s*\}\}/g,
    // Vybbi: {{ variableName }}
    /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g,
    // Mailchimp: *|VARIABLE|*
    /\*\|([A-Z_]+)\|\*/g,
    // Campaign Monitor: [variable]
    /\[([a-zA-Z_][a-zA-Z0-9_]*)\]/g,
  ];

  const detectVariables = (html: string): string[] => {
    const variables = new Set<string>();
    
    VARIABLE_PATTERNS.forEach(pattern => {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      while ((match = regex.exec(html)) !== null) {
        if (match[1]) {
          // Normaliser les noms de variables
          let variableName = match[1].toLowerCase();
          if (variableName.startsWith('contact.')) {
            variableName = variableName.replace('contact.', '');
          }
          variables.add(variableName);
        }
      }
    });
    
    return Array.from(variables);
  };

  const cleanAndConvertHtml = (html: string): string => {
    let cleanedHtml = html;
    
    // Convertir les variables Brevo vers le format Vybbi
    cleanedHtml = cleanedHtml.replace(/\{\{\s*contact\.([A-Z_]+)\s*\}\}/g, (match, variable) => {
      return `{{ ${variable.toLowerCase()} }}`;
    });
    
    // Convertir les variables Mailchimp vers le format Vybbi
    cleanedHtml = cleanedHtml.replace(/\*\|([A-Z_]+)\|\*/g, (match, variable) => {
      return `{{ ${variable.toLowerCase()} }}`;
    });
    
    // Convertir les variables Campaign Monitor vers le format Vybbi
    cleanedHtml = cleanedHtml.replace(/\[([a-zA-Z_][a-zA-Z0-9_]*)\]/g, (match, variable) => {
      return `{{ ${variable.toLowerCase()} }}`;
    });
    
    // Supprimer les métadonnées Brevo/autres services
    cleanedHtml = cleanedHtml.replace(/<meta[^>]*name="generator"[^>]*>/gi, '');
    cleanedHtml = cleanedHtml.replace(/<!--.*?-->/gs, '');
    
    // Nettoyer les styles en ligne excessifs (optionnel)
    // cleanedHtml = cleanedHtml.replace(/style="[^"]*"/g, '');
    
    return cleanedHtml.trim();
  };

  const handleContentChange = (content: string) => {
    setImportContent(content);
    const variables = detectVariables(content);
    setDetectedVariables(variables);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        handleContentChange(content);
      };
      reader.readAsText(file);
    }
  };

  const handleImport = () => {
    if (importContent.trim()) {
      const cleanedHtml = cleanAndConvertHtml(importContent);
      const finalVariables = detectVariables(cleanedHtml);
      onImport(cleanedHtml, finalVariables);
      setOpen(false);
      setImportContent('');
      setDetectedVariables([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Importer un Template
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={importMode} onValueChange={(value) => setImportMode(value as 'paste' | 'file')}>
          <TabsList>
            <TabsTrigger value="paste">
              <FileText className="w-4 h-4 mr-2" />
              Coller le Code
            </TabsTrigger>
            <TabsTrigger value="file">
              <Upload className="w-4 h-4 mr-2" />
              Importer un Fichier
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="paste" className="space-y-4">
            <div>
              <Label htmlFor="html-content">Code HTML du Template</Label>
              <Textarea
                id="html-content"
                placeholder="Collez ici le code HTML de votre template (Brevo, Mailchimp, etc.)"
                value={importContent}
                onChange={(e) => handleContentChange(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="file" className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Fichier HTML</Label>
              <input
                id="file-upload"
                type="file"
                accept=".html,.htm"
                onChange={handleFileUpload}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
            
            {importContent && (
              <div>
                <Label>Aperçu du Contenu</Label>
                <Textarea
                  value={importContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {detectedVariables.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>Variables détectées dans le template :</p>
                <div className="flex flex-wrap gap-1">
                  {detectedVariables.map((variable) => (
                    <Badge key={variable} variant="secondary" className="text-xs">
                      {variable}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ces variables seront automatiquement converties au format Vybbi.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!importContent.trim()}
          >
            <Download className="w-4 h-4 mr-2" />
            Importer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};