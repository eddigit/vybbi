import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Code, Copy, Eye, Settings, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProfileEmbedWidgetProps {
  profileId: string;
  profileType: string;
  profileSlug: string;
  className?: string;
}

interface EmbedConfig {
  width: string;
  height: string;
  theme: 'light' | 'dark' | 'auto';
  showAvatar: boolean;
  showBio: boolean;
  showContact: boolean;
  showSocial: boolean;
  borderRadius: string;
  accentColor: string;
}

export function ProfileEmbedWidget({ profileId, profileType, profileSlug, className }: ProfileEmbedWidgetProps) {
  const [config, setConfig] = useState<EmbedConfig>({
    width: '400',
    height: '600',
    theme: 'auto',
    showAvatar: true,
    showBio: true,
    showContact: true,
    showSocial: true,
    borderRadius: '8',
    accentColor: '#6366f1'
  });

  const baseUrl = window.location.origin;
  const embedUrl = `${baseUrl}/embed/${profileType}/${profileSlug}`;

  const generateEmbedCode = () => {
    const params = new URLSearchParams({
      theme: config.theme,
      avatar: config.showAvatar.toString(),
      bio: config.showBio.toString(),
      contact: config.showContact.toString(),
      social: config.showSocial.toString(),
      radius: config.borderRadius,
      accent: config.accentColor.replace('#', '')
    });

    return `<iframe
  src="${embedUrl}?${params.toString()}"
  width="${config.width}"
  height="${config.height}"
  frameborder="0"
  style="border-radius: ${config.borderRadius}px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"
  allow="clipboard-write"
></iframe>`;
  };

  const generateJavaScriptCode = () => {
    return `<div id="vybbi-embed-${profileId}"></div>
<script>
  (function() {
    const config = ${JSON.stringify(config, null, 2)};
    const container = document.getElementById('vybbi-embed-${profileId}');
    const iframe = document.createElement('iframe');
    
    iframe.src = '${embedUrl}?' + new URLSearchParams({
      theme: config.theme,
      avatar: config.showAvatar,
      bio: config.showBio,
      contact: config.showContact,
      social: config.showSocial,
      radius: config.borderRadius,
      accent: config.accentColor.replace('#', '')
    }).toString();
    
    iframe.width = config.width;
    iframe.height = config.height;
    iframe.frameBorder = '0';
    iframe.style.cssText = 'border-radius: ' + config.borderRadius + 'px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);';
    iframe.allow = 'clipboard-write';
    
    container.appendChild(iframe);
  })();
</script>`;
  };

  const generateReactCode = () => {
    return `import React from 'react';

const VybbiEmbed = ({ profileId = "${profileId}" }) => {
  const config = ${JSON.stringify(config, null, 2)};
  
  const embedUrl = \`${embedUrl}?\` + new URLSearchParams({
    theme: config.theme,
    avatar: config.showAvatar,
    bio: config.showBio,
    contact: config.showContact,
    social: config.showSocial,
    radius: config.borderRadius,
    accent: config.accentColor.replace('#', '')
  }).toString();

  return (
    <iframe
      src={embedUrl}
      width={config.width}
      height={config.height}
      frameBorder="0"
      style={{
        borderRadius: \`\${config.borderRadius}px\`,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}
      allow="clipboard-write"
    />
  );
};

export default VybbiEmbed;`;
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`Code ${type} copié dans le presse-papier !`);
    });
  };

  const openPreview = () => {
    const params = new URLSearchParams({
      theme: config.theme,
      avatar: config.showAvatar.toString(),
      bio: config.showBio.toString(),
      contact: config.showContact.toString(),
      social: config.showSocial.toString(),
      radius: config.borderRadius,
      accent: config.accentColor.replace('#', '')
    });

    window.open(`${embedUrl}?${params.toString()}`, '_blank');
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Code className="h-5 w-5" />
          Widget Embarqué
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Intégrez votre profil sur n'importe quel site web
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="preview">Aperçu</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Largeur (px)</Label>
                <Input
                  id="width"
                  type="number"
                  value={config.width}
                  onChange={(e) => setConfig(prev => ({ ...prev, width: e.target.value }))}
                  min="200"
                  max="800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Hauteur (px)</Label>
                <Input
                  id="height"
                  type="number"
                  value={config.height}
                  onChange={(e) => setConfig(prev => ({ ...prev, height: e.target.value }))}
                  min="300"
                  max="1000"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Thème</Label>
                <Select
                  value={config.theme}
                  onValueChange={(value: 'light' | 'dark' | 'auto') => 
                    setConfig(prev => ({ ...prev, theme: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automatique</SelectItem>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="radius">Bordures arrondies (px)</Label>
                  <Input
                    id="radius"
                    type="number"
                    value={config.borderRadius}
                    onChange={(e) => setConfig(prev => ({ ...prev, borderRadius: e.target.value }))}
                    min="0"
                    max="20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accent">Couleur d'accent</Label>
                  <Input
                    id="accent"
                    type="color"
                    value={config.accentColor}
                    onChange={(e) => setConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Éléments affichés</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="avatar" className="text-sm">Avatar</Label>
                  <Switch
                    id="avatar"
                    checked={config.showAvatar}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, showAvatar: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="bio" className="text-sm">Biographie</Label>
                  <Switch
                    id="bio"
                    checked={config.showBio}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, showBio: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="contact" className="text-sm">Boutons de contact</Label>
                  <Switch
                    id="contact"
                    checked={config.showContact}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, showContact: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="social" className="text-sm">Réseaux sociaux</Label>
                  <Switch
                    id="social"
                    checked={config.showSocial}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, showSocial: checked }))}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="flex justify-center">
              <Button onClick={openPreview} className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Ouvrir l'aperçu
              </Button>
            </div>
            
            <div className="border border-border rounded-lg p-4 bg-muted/20">
              <p className="text-sm text-muted-foreground text-center">
                Cliquez sur "Ouvrir l'aperçu" pour voir le widget dans un nouvel onglet
              </p>
            </div>
          </TabsContent>

          <TabsContent value="code" className="space-y-4">
            <Tabs defaultValue="html" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="react">React</TabsTrigger>
              </TabsList>

              <TabsContent value="html" className="space-y-3">
                <div className="flex justify-between items-center">
                  <Badge variant="outline">HTML/CSS</Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(generateEmbedCode(), 'HTML')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copier
                  </Button>
                </div>
                <Textarea
                  value={generateEmbedCode()}
                  readOnly
                  className="font-mono text-xs h-32 resize-none"
                />
              </TabsContent>

              <TabsContent value="javascript" className="space-y-3">
                <div className="flex justify-between items-center">
                  <Badge variant="outline">JavaScript</Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(generateJavaScriptCode(), 'JavaScript')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copier
                  </Button>
                </div>
                <Textarea
                  value={generateJavaScriptCode()}
                  readOnly
                  className="font-mono text-xs h-40 resize-none"
                />
              </TabsContent>

              <TabsContent value="react" className="space-y-3">
                <div className="flex justify-between items-center">
                  <Badge variant="outline">React/Next.js</Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(generateReactCode(), 'React')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copier
                  </Button>
                </div>
                <Textarea
                  value={generateReactCode()}
                  readOnly
                  className="font-mono text-xs h-48 resize-none"
                />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}