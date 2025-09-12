import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Settings, Save, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function VybbiConfig() {
  const { toast } = useToast();
  const [systemPrompt, setSystemPrompt] = useState(`Tu es Vybbi, l'intelligence artificielle chef d'orchestre de la plateforme musicale.

## Ton rôle :
- Centraliser et analyser toutes les données de la plateforme
- Faire du matching intelligent entre artistes et opportunités  
- Effectuer des recherches complexes en langage naturel
- Proposer des recommandations personnalisées
- Alerter proactivement sur les opportunités

## Capacités principales :
1. **Matching automatique** : Détecte les correspondances artistes/événements
2. **Recherche complexe** : Comprends le langage naturel
3. **Recommandations** : Analyse les profils pour suggérer des collaborations
4. **Alerts proactives** : Notifie les opportunités de booking

Toujours répondre en français avec des suggestions concrètes.`);
  
  const [settings, setSettings] = useState({
    autoMatching: true,
    proactiveAlerts: true,
    complexSearch: true,
    realTimeAnalysis: true,
    smartNotifications: true
  });

  const handleSave = () => {
    // Sauvegarder la configuration
    toast({
      title: "Configuration sauvegardée",
      description: "Les paramètres de Vybbi ont été mis à jour"
    });
  };

  const resetToDefault = () => {
    setSystemPrompt(`Tu es Vybbi, l'intelligence artificielle chef d'orchestre de la plateforme musicale.

## Ton rôle :
- Centraliser et analyser toutes les données de la plateforme
- Faire du matching intelligent entre artistes et opportunités  
- Effectuer des recherches complexes en langage naturel
- Proposer des recommandations personnalisées
- Alerter proactivement sur les opportunités

## Capacités principales :
1. **Matching automatique** : Détecte les correspondances artistes/événements
2. **Recherche complexe** : Comprends le langage naturel
3. **Recommandations** : Analyse les profils pour suggérer des collaborations
4. **Alerts proactives** : Notifie les opportunités de booking

Toujours répondre en français avec des suggestions concrètes.`);
    
    setSettings({
      autoMatching: true,
      proactiveAlerts: true,
      complexSearch: true,
      realTimeAnalysis: true,
      smartNotifications: true
    });

    toast({
      title: "Configuration réinitialisée",
      description: "Tous les paramètres ont été remis aux valeurs par défaut"
    });
  };

  const capabilities = [
    { key: 'autoMatching', label: 'Matching automatique', description: 'Détection automatique des correspondances' },
    { key: 'proactiveAlerts', label: 'Alertes proactives', description: 'Notifications automatiques d\'opportunités' },
    { key: 'complexSearch', label: 'Recherche complexe', description: 'Recherche en langage naturel' },
    { key: 'realTimeAnalysis', label: 'Analyse temps réel', description: 'Analyse continue des données' },
    { key: 'smartNotifications', label: 'Notifications intelligentes', description: 'Notifications contextuelles' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Configuration du Prompt Système
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="system-prompt">Prompt Système de Vybbi</Label>
            <Textarea
              id="system-prompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="min-h-[300px] mt-2 font-mono text-sm"
              placeholder="Définir les instructions et la personnalité de Vybbi..."
            />
            <div className="text-sm text-muted-foreground mt-2">
              Ce prompt définit comment Vybbi se comporte et répond aux utilisateurs. Modifie-le pour adapter son comportement.
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Sauvegarder
            </Button>
            <Button onClick={resetToDefault} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Capacités de Vybbi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {capabilities.map((capability) => (
              <div key={capability.key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Label className="font-medium">{capability.label}</Label>
                    <Badge variant={settings[capability.key as keyof typeof settings] ? "default" : "secondary"}>
                      {settings[capability.key as keyof typeof settings] ? "Activé" : "Désactivé"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {capability.description}
                  </div>
                </div>
                <Switch
                  checked={settings[capability.key as keyof typeof settings]}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, [capability.key]: checked }))
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}