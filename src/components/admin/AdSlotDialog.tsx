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

interface AdSlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slot?: any;
  onSuccess: () => void;
}

export function AdSlotDialog({ open, onOpenChange, slot, onSuccess }: AdSlotDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    width: "",
    height: "",
    page_type: "public",
    is_enabled: true,
    hide_if_empty: true,
    allowed_formats: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"]
  });

  useEffect(() => {
    if (slot) {
      setFormData({
        name: slot.name || "",
        code: slot.code || "",
        width: slot.width?.toString() || "",
        height: slot.height?.toString() || "",
        page_type: slot.page_type || "public",
        is_enabled: slot.is_enabled ?? true,
        hide_if_empty: slot.hide_if_empty ?? true,
        allowed_formats: slot.allowed_formats || ["image/png", "image/jpeg", "image/webp", "image/svg+xml"]
      });
    } else {
      setFormData({
        name: "",
        code: "",
        width: "",
        height: "",
        page_type: "public",
        is_enabled: true,
        hide_if_empty: true,
        allowed_formats: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"]
      });
    }
  }, [slot, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        width: formData.width ? parseInt(formData.width) : null,
        height: formData.height ? parseInt(formData.height) : null,
      };

      if (slot) {
        const { error } = await supabase
          .from('ad_slots')
          .update(data)
          .eq('id', slot.id);
        
        if (error) throw error;
        toast({ title: "Emplacement modifié avec succès" });
      } else {
        const { error } = await supabase
          .from('ad_slots')
          .insert([data]);
        
        if (error) throw error;
        toast({ title: "Emplacement créé avec succès" });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {slot ? "Modifier l'emplacement" : "Nouvel emplacement publicitaire"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Bannière page d'accueil"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Code d'identification</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              placeholder="Ex: home-banner-top"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="width">Largeur (px)</Label>
              <Input
                id="width"
                type="number"
                value={formData.width}
                onChange={(e) => setFormData(prev => ({ ...prev, width: e.target.value }))}
                placeholder="Ex: 728"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Hauteur (px)</Label>
              <Input
                id="height"
                type="number"
                value={formData.height}
                onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                placeholder="Ex: 90"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="page_type">Type de page</Label>
            <Select value={formData.page_type} onValueChange={(value) => setFormData(prev => ({ ...prev, page_type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public (non connecté)</SelectItem>
                <SelectItem value="private">Privé (connecté)</SelectItem>
                <SelectItem value="all">Toutes les pages</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_enabled"
              checked={formData.is_enabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_enabled: checked }))}
            />
            <Label htmlFor="is_enabled">Emplacement actif</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="hide_if_empty"
              checked={formData.hide_if_empty}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hide_if_empty: checked }))}
            />
            <Label htmlFor="hide_if_empty">Masquer si vide</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : slot ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}