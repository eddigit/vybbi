import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CalendarDays, Plus, Upload, Eye, BarChart3, Settings, Trash2, Edit } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AdCampaign {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  target_url?: string;
  placement_type: string;
  created_at: string;
  ad_assets: Array<{
    id: string;
    file_name: string;
    file_url: string;
    width?: number;
    height?: number;
  }>;
}

interface AdSettings {
  ads_enabled: boolean;
  header_ads_enabled: boolean;
  sidebar_ads_enabled: boolean;
}

export default function AdminAdvertising() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [settings, setSettings] = useState<AdSettings>({
    ads_enabled: false,
    header_ads_enabled: true,
    sidebar_ads_enabled: true
  });
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Form state for new campaign
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    target_url: '',
    placement_type: 'header'
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!profile) {
      navigate('/auth');
      return;
    }

    // Check if user is admin
    checkAdminRole();
    fetchCampaigns();
    fetchSettings();
  }, [profile, navigate]);

  const checkAdminRole = async () => {
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', profile?.user_id);

    const isAdmin = roles?.some(r => r.role === 'admin');
    if (!isAdmin) {
      navigate('/');
      return;
    }
  };

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .select(`
          *,
          ad_assets (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les campagnes publicitaires",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data } = await supabase
        .from('ad_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['ads_enabled', 'header_ads_enabled', 'sidebar_ads_enabled']);

      if (data) {
        const settingsObj: any = {};
        data.forEach(setting => {
          if (setting.setting_value && typeof setting.setting_value === 'object' && 'enabled' in setting.setting_value) {
            settingsObj[setting.setting_key] = Boolean((setting.setting_value as any).enabled);
          } else {
            settingsObj[setting.setting_key] = false;
          }
        });
        setSettings(settingsObj);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const updateSetting = async (key: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('ad_settings')
        .upsert({
          setting_key: key,
          setting_value: { enabled },
          updated_by: profile?.user_id
        });

      if (error) throw error;

      setSettings(prev => ({ ...prev, [key]: enabled }));
      toast({
        title: "Succès",
        description: "Paramètre mis à jour"
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le paramètre",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const uploadAssets = async (campaignId: string) => {
    const uploadPromises = uploadedFiles.map(async (file, index) => {
      const fileName = `${campaignId}/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('ad-assets')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('ad-assets')
        .getPublicUrl(fileName);

      return {
        campaign_id: campaignId,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        display_order: index
      };
    });

    const assets = await Promise.all(uploadPromises);

    const { error } = await supabase
      .from('ad_assets')
      .insert(assets);

    if (error) throw error;
  };

  const createCampaign = async () => {
    try {
      if (!formData.name || !formData.start_date || !formData.end_date) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive"
        });
        return;
      }

      const { data: campaign, error } = await supabase
        .from('ad_campaigns')
        .insert({
          ...formData,
          created_by: profile?.user_id
        })
        .select()
        .single();

      if (error) throw error;

      if (uploadedFiles.length > 0) {
        await uploadAssets(campaign.id);
      }

      toast({
        title: "Succès",
        description: "Campagne créée avec succès"
      });

      setIsCreateDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        target_url: '',
        placement_type: 'header'
      });
      setUploadedFiles([]);
      fetchCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la campagne",
        variant: "destructive"
      });
    }
  };

  const toggleCampaign = async (id: string, is_active: boolean) => {
    try {
      const { error } = await supabase
        .from('ad_campaigns')
        .update({ is_active: !is_active })
        .eq('id', id);

      if (error) throw error;

      fetchCampaigns();
      toast({
        title: "Succès",
        description: `Campagne ${!is_active ? 'activée' : 'désactivée'}`
      });
    } catch (error) {
      console.error('Error toggling campaign:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier la campagne",
        variant: "destructive"
      });
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) return;

    try {
      const { error } = await supabase
        .from('ad_campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchCampaigns();
      toast({
        title: "Succès",
        description: "Campagne supprimée"
      });
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la campagne",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Régie Publicitaire</h1>
          <p className="text-muted-foreground">
            Gérez vos espaces publicitaires et campagnes
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Campagne
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle campagne</DialogTitle>
              <DialogDescription>
                Configurez votre campagne publicitaire avec ses bannières
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom de la campagne *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="placement">Emplacement *</Label>
                  <Select value={formData.placement_type} onValueChange={(value) => setFormData({...formData, placement_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="header">En-tête</SelectItem>
                      <SelectItem value="sidebar_left">Barre latérale gauche</SelectItem>
                      <SelectItem value="sidebar_right">Barre latérale droite</SelectItem>
                      <SelectItem value="banner_top">Bannière haute</SelectItem>
                      <SelectItem value="banner_bottom">Bannière basse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Date de début *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">Date de fin *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="target_url">URL de redirection</Label>
                <Input
                  id="target_url"
                  type="url"
                  placeholder="https://..."
                  value={formData.target_url}
                  onChange={(e) => setFormData({...formData, target_url: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="files">Bannières publicitaires</Label>
                <Input
                  id="files"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                />
                {uploadedFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="text-sm text-muted-foreground">
                        {file.name} ({Math.round(file.size / 1024)} KB)
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button onClick={createCampaign}>
                <Upload className="mr-2 h-4 w-4" />
                Créer la campagne
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="campaigns">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="campaigns">
            <CalendarDays className="mr-2 h-4 w-4" />
            Campagnes
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Statistiques
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Paramètres
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <div className="grid gap-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {campaign.name}
                      <Badge variant={campaign.is_active ? "default" : "secondary"}>
                        {campaign.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {campaign.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleCampaign(campaign.id, campaign.is_active)}
                    >
                      {campaign.is_active ? "Désactiver" : "Activer"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteCampaign(campaign.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <strong>Emplacement:</strong>
                      <div className="text-muted-foreground">{campaign.placement_type}</div>
                    </div>
                    <div>
                      <strong>Période:</strong>
                      <div className="text-muted-foreground">
                        {campaign.start_date} - {campaign.end_date}
                      </div>
                    </div>
                    <div>
                      <strong>Bannières:</strong>
                      <div className="text-muted-foreground">{campaign.ad_assets?.length || 0}</div>
                    </div>
                    <div>
                      <strong>URL cible:</strong>
                      <div className="text-muted-foreground truncate">
                        {campaign.target_url || "Aucune"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques des campagnes</CardTitle>
              <CardDescription>
                Analyse des performances de vos campagnes publicitaires
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Les statistiques détaillées seront affichées ici.
                <br />
                Impressions, clics, taux de conversion, etc.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres publicitaires</CardTitle>
              <CardDescription>
                Configurez les paramètres globaux de votre régie publicitaire
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Publicités activées</h4>
                  <p className="text-sm text-muted-foreground">
                    Active ou désactive toutes les publicités sur la plateforme
                  </p>
                </div>
                <Switch
                  checked={settings.ads_enabled}
                  onCheckedChange={(checked) => updateSetting('ads_enabled', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Publicités en en-tête</h4>
                  <p className="text-sm text-muted-foreground">
                    Affiche les bannières publicitaires dans l'en-tête
                  </p>
                </div>
                <Switch
                  checked={settings.header_ads_enabled}
                  onCheckedChange={(checked) => updateSetting('header_ads_enabled', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Publicités latérales</h4>
                  <p className="text-sm text-muted-foreground">
                    Affiche les bannières publicitaires sur les côtés
                  </p>
                </div>
                <Switch
                  checked={settings.sidebar_ads_enabled}
                  onCheckedChange={(checked) => updateSetting('sidebar_ads_enabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}