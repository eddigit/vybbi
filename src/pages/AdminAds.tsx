import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  BarChart3, 
  Download,
  Play, 
  Pause, 
  Square,
  Eye,
  EyeOff,
  Power,
  PowerOff
} from "lucide-react";

export default function AdminAds() {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!hasRole("admin")) {
      window.location.href = "/dashboard";
    }
  }, [hasRole]);

  if (!hasRole("admin")) {
    return <div>Accès refusé</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Régie Publicitaire</h1>
          <p className="text-muted-foreground">
            Gérez vos emplacements publicitaires, campagnes et créatifs
          </p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1">
          Version 1.0
        </Badge>
      </div>

      <Tabs defaultValue="slots" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="slots">Emplacements</TabsTrigger>
          <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
          <TabsTrigger value="creatives">Créatifs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* EMPLACEMENTS */}
        <TabsContent value="slots" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Emplacements publicitaires</h2>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvel emplacement
            </Button>
          </div>

          <div className="grid gap-4">
            <SlotsManager />
          </div>
        </TabsContent>

        {/* CAMPAGNES */}
        <TabsContent value="campaigns" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Campagnes publicitaires</h2>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle campagne
            </Button>
          </div>

          <div className="grid gap-4">
            <CampaignsManager />
          </div>
        </TabsContent>

        {/* CRÉATIFS */}
        <TabsContent value="creatives" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Créatifs publicitaires</h2>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau créatif
            </Button>
          </div>

          <div className="grid gap-4">
            <CreativesManager />
          </div>
        </TabsContent>

        {/* ANALYTICS */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Analytics & Paramètres</h2>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="grid gap-6">
            <AnalyticsOverview />
            <GlobalSettings />
            <Documentation />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// COMPOSANTS GESTIONNAIRES

function SlotsManager() {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_slots')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSlots(data || []);
    } catch (error) {
      console.error('Error loading slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSlot = async (slotId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('ad_slots')
        .update({ is_enabled: !enabled })
        .eq('id', slotId);

      if (error) throw error;
      loadSlots();
    } catch (error) {
      console.error('Error toggling slot:', error);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-4">
      {slots.map((slot) => (
        <Card key={slot.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{slot.name}</h3>
                  <Badge variant={slot.is_enabled ? "default" : "secondary"}>
                    {slot.is_enabled ? "Actif" : "Inactif"}
                  </Badge>
                  <Badge variant="outline">{slot.page_type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Code: {slot.code} • {slot.width}x{slot.height}px
                </p>
                <p className="text-xs text-muted-foreground">
                  Formats: {slot.allowed_formats?.join(', ')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toggleSlot(slot.id, slot.is_enabled)}
                >
                  {slot.is_enabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CampaignsManager() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .select(`
          *,
          ad_campaign_slots(
            id,
            weight,
            priority,
            is_enabled,
            ad_slots(name, code)
          ),
          ad_assets(id, file_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCampaign = async (campaignId: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('ad_campaigns')
        .update({ is_active: !active })
        .eq('id', campaignId);

      if (error) throw error;
      loadCampaigns();
    } catch (error) {
      console.error('Error toggling campaign:', error);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <Card key={campaign.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{campaign.name}</h3>
                  <Badge variant={campaign.is_active ? "default" : "secondary"}>
                    {campaign.is_active ? "Actif" : "Inactif"}
                  </Badge>
                  <Badge variant="outline">{campaign.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {campaign.advertiser && `Annonceur: ${campaign.advertiser} • `}
                  {campaign.start_date} → {campaign.end_date}
                </p>
                <p className="text-xs text-muted-foreground">
                  Emplacements: {campaign.ad_campaign_slots?.map((s: any) => s.ad_slots?.name).join(', ') || 'Aucun'}
                  {campaign.ad_assets?.length > 0 && ` • ${campaign.ad_assets.length} créatif(s)`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toggleCampaign(campaign.id, campaign.is_active)}
                >
                  {campaign.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CreativesManager() {
  const [creatives, setCreatives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCreatives();
  }, []);

  const loadCreatives = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_assets')
        .select(`
          *,
          ad_campaigns(name, is_active, status)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCreatives(data || []);
    } catch (error) {
      console.error('Error loading creatives:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {creatives.map((creative) => (
        <Card key={creative.id}>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img 
                  src={creative.file_url} 
                  alt={creative.alt_text || creative.file_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-sm">{creative.file_name}</h4>
                <p className="text-xs text-muted-foreground">
                  {creative.width}x{creative.height}px • {Math.round((creative.file_size || 0) / 1024)}KB
                </p>
                <p className="text-xs text-muted-foreground">
                  Campagne: {creative.ad_campaigns?.name || 'Aucune'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-3 h-3" />
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AnalyticsOverview() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_metrics')
        .select(`
          *,
          ad_campaigns(name),
          ad_assets(file_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setMetrics(data || []);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const impressions = metrics.filter(m => m.event_type === 'impression').length;
  const clicks = metrics.filter(m => m.event_type === 'click').length;
  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Impressions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{impressions.toLocaleString()}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Clics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{clicks.toLocaleString()}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            CTR
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{ctr}%</div>
        </CardContent>
      </Card>
    </div>
  );
}

function GlobalSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_settings')
        .select('*')
        .eq('setting_key', 'ads.global')
        .single();

      if (error) throw error;
      setSettings(data?.setting_value || {});
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleGlobalAds = async () => {
    try {
      const newSettings = {
        ...settings,
        enabled: !settings.enabled
      };

      const { error } = await supabase
        .from('ad_settings')
        .update({ setting_value: newSettings })
        .eq('setting_key', 'ads.global');

      if (error) throw error;
      setSettings(newSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Paramètres globaux
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Diffusion publicitaire</h4>
            <p className="text-sm text-muted-foreground">
              Active ou désactive toutes les bannières du site
            </p>
          </div>
          <Button 
            variant={settings?.enabled ? "default" : "outline"}
            onClick={toggleGlobalAds}
            className="gap-2"
          >
            {settings?.enabled ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
            {settings?.enabled ? 'Activé' : 'Désactivé'}
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Limite impressions/session:</span>
            <span className="ml-2 font-medium">{settings?.frequency_cap_per_session || 1}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Anti-spam clics:</span>
            <span className="ml-2 font-medium">{settings?.click_throttle_ms || 2000}ms</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Documentation() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentation d'usage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>• <strong>Emplacements:</strong> Définissent où apparaissent les publicités (Landing, Dashboard, etc.)</p>
        <p>• <strong>Campagnes:</strong> Groupent les créatifs avec dates, horaires et ciblage</p>
        <p>• <strong>Créatifs:</strong> Images/bannières associées aux campagnes</p>
        <p>• <strong>Mapping:</strong> Associe campagnes → emplacements avec priorité/pondération</p>
        <p>• <strong>Diffusion:</strong> Sélection automatique selon statut, dates, fenêtre horaire, fréquence</p>
        <p>• <strong>Tracking:</strong> Impression (viewport) + Clic avec UTM automatiques</p>
        <p>• <strong>Responsive:</strong> Emplacements masqués sur mobile selon breakpoint défini</p>
        <p>• <strong>Sécurité:</strong> Lecture publique limitée, écriture admins uniquement</p>
        <p>• <strong>Analytics:</strong> Exportable CSV avec impressions, clics, CTR par période/slot/campagne</p>
        <p>• <strong>Performance:</strong> Cache session, anti-spam, dimensions optimisées</p>
      </CardContent>
    </Card>
  );
}