import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AdCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign?: any;
  onSuccess: () => void;
}

export function AdCampaignDialog({ open, onOpenChange, campaign, onSuccess }: AdCampaignDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    advertiser: "",
    target_url: "",
    start_date: "",
    end_date: "",
        placement_type: "header",
    status: "draft",
    is_active: true,
    daily_window_start: "",
    daily_window_end: "",
    selected_slots: [] as string[]
  });

  useEffect(() => {
    if (open) {
      loadSlots();
    }
  }, [open]);

  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name || "",
        description: campaign.description || "",
        advertiser: campaign.advertiser || "",
        target_url: campaign.target_url || "",
        start_date: campaign.start_date || "",
        end_date: campaign.end_date || "",
        placement_type: campaign.placement_type || "header",
        status: campaign.status || "draft",
        is_active: campaign.is_active ?? true,
        daily_window_start: campaign.daily_window_start || "",
        daily_window_end: campaign.daily_window_end || "",
        selected_slots: campaign.ad_campaign_slots?.map((cs: any) => cs.slot_id) || []
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        name: "",
        description: "",
        advertiser: "",
        target_url: "",
        start_date: today,
        end_date: "",
        placement_type: "header",
        status: "draft",
        is_active: true,
        daily_window_start: "",
        daily_window_end: "",
        selected_slots: []
      });
    }
  }, [campaign, open]);

  const loadSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_slots')
        .select('*')
        .eq('is_enabled', true)
        .order('name');

      if (error) throw error;
      setSlots(data || []);
    } catch (error) {
      console.error('Error loading slots:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast({ title: "Le nom de campagne est requis", variant: "destructive" });
      return;
    }
    
    if (!formData.start_date || !formData.end_date) {
      toast({ title: "Les dates de début et fin sont requises", variant: "destructive" });
      return;
    }
    
    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      toast({ title: "La date de fin doit être après la date de début", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const campaignData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        advertiser: formData.advertiser?.trim() || null,
        target_url: formData.target_url?.trim() || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        placement_type: formData.placement_type,
        status: formData.status,
        is_active: formData.is_active,
        daily_window_start: formData.daily_window_start || null,
        daily_window_end: formData.daily_window_end || null,
      };

      let campaignId;

      if (campaign) {
        const { error } = await supabase
          .from('ad_campaigns')
          .update(campaignData)
          .eq('id', campaign.id);
        
        if (error) throw error;
        campaignId = campaign.id;
        
        // Delete existing slots
        await supabase
          .from('ad_campaign_slots')
          .delete()
          .eq('campaign_id', campaignId);
      } else {
        const { data, error } = await supabase
          .from('ad_campaigns')
          .insert([campaignData])
          .select()
          .maybeSingle();
        
        if (error) throw error;
        campaignId = data.id;
      }

      // Insert campaign slots
      if (formData.selected_slots?.length > 0) {
        const validSlotIds = formData.selected_slots.filter(id => id);
        
        if (validSlotIds.length > 0) {
          const slotsData = validSlotIds.map(slotId => ({
            campaign_id: campaignId,
            slot_id: slotId,
            weight: 1,
            priority: 0,
            is_enabled: true
          }));

          const { error: slotsError } = await supabase
            .from('ad_campaign_slots')
            .insert(slotsData);
          
          if (slotsError) throw slotsError;
        }
      }

      toast({
        title: campaign ? "Campagne modifiée" : "Campagne créée",
        description: "Les modifications ont été enregistrées"
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'enregistrement",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSlot = (slotId: string) => {
    if (!slotId) return; // Safety check
    
    setFormData(prev => ({
      ...prev,
      selected_slots: prev.selected_slots.includes(slotId)
        ? prev.selected_slots.filter(id => id !== slotId)
        : [...prev.selected_slots, slotId]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {campaign ? "Modifier la campagne" : "Nouvelle campagne publicitaire"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la campagne</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Campagne été 2024"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="advertiser">Annonceur</Label>
              <Input
                id="advertiser"
                value={formData.advertiser}
                onChange={(e) => setFormData(prev => ({ ...prev, advertiser: e.target.value }))}
                placeholder="Ex: Acme Corp"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description de la campagne..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_url">URL de destination</Label>
            <Input
              id="target_url"
              type="url"
              value={formData.target_url}
              onChange={(e) => setFormData(prev => ({ ...prev, target_url: e.target.value }))}
              placeholder="https://example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Date de début</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Date de fin</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="daily_window_start">Heure de début (optionnel)</Label>
              <Input
                id="daily_window_start"
                type="time"
                value={formData.daily_window_start}
                onChange={(e) => setFormData(prev => ({ ...prev, daily_window_start: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="daily_window_end">Heure de fin (optionnel)</Label>
              <Input
                id="daily_window_end"
                type="time"
                value={formData.daily_window_end}
                onChange={(e) => setFormData(prev => ({ ...prev, daily_window_end: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="placement_type">Type d'emplacement</Label>
              <Select value={formData.placement_type} onValueChange={(value) => setFormData(prev => ({ ...prev, placement_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="header">Header</SelectItem>
                  <SelectItem value="sidebar_left">Sidebar Gauche</SelectItem>
                  <SelectItem value="sidebar_right">Sidebar Droite</SelectItem>
                  <SelectItem value="banner_top">Banner Haut</SelectItem>
                  <SelectItem value="banner_bottom">Banner Bas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="paused">En pause</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Campagne active</Label>
          </div>

          <div className="space-y-2">
            <Label>Emplacements publicitaires</Label>
            <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto border rounded p-2">
              {slots.map((slot) => (
                <div key={slot.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`slot-${slot.id}`}
                    checked={formData.selected_slots.includes(slot.id)}
                    onChange={() => toggleSlot(slot.id)}
                    className="rounded"
                  />
                  <Label htmlFor={`slot-${slot.id}`} className="text-sm cursor-pointer">
                    {slot.name} ({slot.width}x{slot.height}px)
                  </Label>
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              Sélectionnez plusieurs emplacements pour diffuser sur plusieurs zones simultanément
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {campaign ? "Modification..." : "Création..."}
                </>
              ) : (
                campaign ? "Modifier" : "Créer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}