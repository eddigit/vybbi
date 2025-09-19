import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  MessageSquare, 
  Calendar, 
  Mail, 
  Webhook, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Zap,
  Slack,
  Smartphone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Integration {
  id: string;
  name: string;
  type: 'whatsapp' | 'calendar' | 'email' | 'webhook' | 'zapier';
  icon: any;
  status: 'connected' | 'disconnected' | 'error';
  description: string;
  config?: Record<string, any>;
  last_sync?: string;
}

const AVAILABLE_INTEGRATIONS = [
  {
    type: 'whatsapp',
    name: 'WhatsApp Business',
    icon: Smartphone,
    description: 'Envoi automatique de messages WhatsApp aux prospects',
    configFields: [
      { key: 'phone_number_id', label: 'Phone Number ID', type: 'text', required: true },
      { key: 'access_token', label: 'Access Token', type: 'password', required: true },
      { key: 'webhook_verify_token', label: 'Webhook Verify Token', type: 'text', required: true }
    ]
  },
  {
    type: 'calendar',
    name: 'Calendly Integration',
    icon: Calendar,
    description: 'Synchronisation automatique des rendez-vous planifiés',
    configFields: [
      { key: 'calendly_token', label: 'Calendly Personal Access Token', type: 'password', required: true },
      { key: 'event_type_uuid', label: 'Event Type UUID', type: 'text', required: true },
      { key: 'webhook_url', label: 'Webhook URL', type: 'text', required: false }
    ]
  },
  {
    type: 'email',
    name: 'Brevo Email Marketing',
    icon: Mail,
    description: 'Campagnes email automatisées et templates personnalisés',
    configFields: [
      { key: 'api_key', label: 'Brevo API Key', type: 'password', required: true },
      { key: 'sender_email', label: 'Email Expéditeur', type: 'email', required: true },
      { key: 'sender_name', label: 'Nom Expéditeur', type: 'text', required: true }
    ]
  },
  {
    type: 'zapier',
    name: 'Zapier Automation',
    icon: Zap,
    description: 'Connectez avec 5000+ applications via Zapier',
    configFields: [
      { key: 'webhook_url', label: 'Zapier Webhook URL', type: 'url', required: true },
      { key: 'secret_key', label: 'Secret Key (optionnel)', type: 'password', required: false }
    ]
  },
  {
    type: 'webhook',
    name: 'Custom Webhooks',
    icon: Webhook,
    description: 'Webhooks personnalisés pour intégrations sur mesure',
    configFields: [
      { key: 'url', label: 'Webhook URL', type: 'url', required: true },
      { key: 'secret', label: 'Secret', type: 'password', required: false },
      { key: 'events', label: 'Événements (séparés par virgule)', type: 'text', required: true }
    ]
  }
];

export const IntegrationsCenter: React.FC = () => {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [configuring, setConfiguring] = useState<string | null>(null);
  const [configData, setConfigData] = useState<Record<string, any>>({});
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('*');

      if (error) throw error;

      // Map database integrations with available ones
      const mappedIntegrations = AVAILABLE_INTEGRATIONS.map(template => {
        const existingIntegration = data?.find(int => int.type === template.type);
        return {
          id: existingIntegration?.id || `new-${template.type}`,
          name: template.name,
          type: template.type,
          icon: template.icon,
          status: existingIntegration?.is_active ? 'connected' : 'disconnected',
          description: template.description,
          config: existingIntegration?.config || {},
          last_sync: existingIntegration?.last_sync_at
        } as Integration;
      });

      setIntegrations(mappedIntegrations);
    } catch (error) {
      console.error('Error loading integrations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les intégrations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfigureIntegration = (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (integration) {
      setConfiguring(integrationId);
      setConfigData(integration.config || {});
    }
  };

  const handleSaveConfiguration = async () => {
    if (!configuring) return;

    const integration = integrations.find(i => i.id === configuring);
    if (!integration) return;

    try {
      const { error } = await supabase
        .from('integrations')
        .upsert({
          id: integration.id.startsWith('new-') ? undefined : integration.id,
          type: integration.type,
          name: integration.name,
          config: configData,
          is_active: true,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Configuration sauvegardée",
        description: `L'intégration ${integration.name} a été configurée avec succès`
      });

      setConfiguring(null);
      setConfigData({});
      loadIntegrations();
    } catch (error) {
      console.error('Error saving integration:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive"
      });
    }
  };

  const handleTestConnection = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    setTestingConnection(integrationId);
    try {
      // Test connection based on integration type
      let testEndpoint = '';
      let testPayload = {};

      switch (integration.type) {
        case 'whatsapp':
          testEndpoint = 'whatsapp-sender';
          testPayload = {
            phone: '33123456789',
            message: 'Test de connexion Vybbi CRM',
            test_mode: true
          };
          break;
        case 'email':
          testEndpoint = 'send-notification';
          testPayload = {
            type: 'test_connection',
            recipient: integration.config?.sender_email,
            data: { test: true }
          };
          break;
        case 'webhook':
        case 'zapier':
          // Test webhook by sending a ping
          await fetch(integration.config?.webhook_url || integration.config?.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event_type: 'connection_test',
              timestamp: new Date().toISOString(),
              source: 'vybbi_crm'
            })
          });
          break;
      }

      if (testEndpoint) {
        const { error } = await supabase.functions.invoke(testEndpoint, {
          body: testPayload
        });

        if (error) throw error;
      }

      // Update integration status
      await supabase
        .from('integrations')
        .update({ 
          last_sync_at: new Date().toISOString(),
          status: 'active'
        })
        .eq('id', integration.id);

      toast({
        title: "Test réussi !",
        description: `La connexion avec ${integration.name} fonctionne correctement`
      });

      loadIntegrations();
    } catch (error) {
      console.error('Connection test failed:', error);
      toast({
        title: "Test échoué",
        description: `Impossible de se connecter à ${integration.name}`,
        variant: "destructive"
      });
    } finally {
      setTestingConnection(null);
    }
  };

  const handleToggleIntegration = async (integrationId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('integrations')
        .update({ is_active: enabled })
        .eq('id', integrationId);

      if (error) throw error;

      loadIntegrations();
      toast({
        title: enabled ? "Intégration activée" : "Intégration désactivée",
        description: "Les modifications ont été appliquées"
      });
    } catch (error) {
      console.error('Error toggling integration:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'intégration",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'success';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return CheckCircle;
      case 'error': return AlertCircle;
      default: return Settings;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Centre d'Intégrations</h2>
        <p className="text-muted-foreground">
          Connectez Vybbi CRM avec vos outils préférés pour automatiser votre prospection.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          const StatusIcon = getStatusIcon(integration.status);
          const template = AVAILABLE_INTEGRATIONS.find(t => t.type === integration.type);

          return (
            <Card key={integration.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{integration.name}</CardTitle>
                      <Badge 
                        variant={getStatusColor(integration.status) as any}
                        className="mt-1"
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {integration.status === 'connected' ? 'Connecté' : 
                         integration.status === 'error' ? 'Erreur' : 'Déconnecté'}
                      </Badge>
                    </div>
                  </div>
                  {integration.status === 'connected' && (
                    <Switch
                      checked={integration.status === 'connected'}
                      onCheckedChange={(enabled) => handleToggleIntegration(integration.id, enabled)}
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {integration.description}
                </p>
                
                {integration.last_sync && (
                  <p className="text-xs text-muted-foreground">
                    Dernière sync: {new Date(integration.last_sync).toLocaleString('fr-FR')}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConfigureIntegration(integration.id)}
                    className="flex-1"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Configurer
                  </Button>
                  {integration.status === 'connected' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestConnection(integration.id)}
                      disabled={testingConnection === integration.id}
                    >
                      {testingConnection === integration.id ? 'Test...' : 'Tester'}
                    </Button>
                  )}
                </div>
              </CardContent>

              {/* Configuration Modal */}
              {configuring === integration.id && template && (
                <div className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Configuration {integration.name}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfiguring(null)}
                    >
                      ✕
                    </Button>
                  </div>
                  
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {template.configFields.map((field) => (
                      <div key={field.key} className="space-y-1">
                        <Label className="text-xs">{field.label}</Label>
                        <Input
                          type={field.type}
                          placeholder={field.label}
                          value={configData[field.key] || ''}
                          onChange={(e) => setConfigData(prev => ({
                            ...prev,
                            [field.key]: e.target.value
                          }))}
                          required={field.required}
                          className="h-8"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfiguring(null)}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveConfiguration}
                      className="flex-1"
                    >
                      Sauvegarder
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Integration Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiques d'Intégrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {integrations.filter(i => i.status === 'connected').length}
              </div>
              <div className="text-sm text-muted-foreground">Intégrations actives</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {integrations.filter(i => i.last_sync).length}
              </div>
              <div className="text-sm text-muted-foreground">Synchronisées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                {integrations.filter(i => i.status === 'error').length}
              </div>
              <div className="text-sm text-muted-foreground">En erreur</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {integrations.filter(i => i.status === 'disconnected').length}
              </div>
              <div className="text-sm text-muted-foreground">À configurer</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};