import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X } from "lucide-react";

interface AdCreativeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creative?: any;
  onSuccess: () => void;
}

export function AdCreativeDialog({ open, onOpenChange, creative, onSuccess }: AdCreativeDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    file_name: "",
    alt_text: "",
    campaign_id: "",
    width: "",
    height: "",
    display_order: "",
    file_url: "",
    file_size: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    if (open) {
      loadCampaigns();
    }
  }, [open]);

  useEffect(() => {
    if (creative) {
      setFormData({
        file_name: creative.file_name || "",
        alt_text: creative.alt_text || "",
        campaign_id: creative.campaign_id || "",
        width: creative.width?.toString() || "",
        height: creative.height?.toString() || "",
        display_order: creative.display_order?.toString() || "0",
        file_url: creative.file_url || "",
        file_size: creative.file_size?.toString() || ""
      });
      setPreviewUrl(creative.file_url || "");
    } else {
      setFormData({
        file_name: "",
        alt_text: "",
        campaign_id: "",
        width: "",
        height: "",
        display_order: "0",
        file_url: "",
        file_size: ""
      });
      setPreviewUrl("");
    }
    setSelectedFile(null);
  }, [creative, open]);

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .select('id, name, status')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        file_name: file.name,
        file_size: file.size.toString()
      }));

      // Get image dimensions
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          setFormData(prev => ({
            ...prev,
            width: img.width.toString(),
            height: img.height.toString()
          }));
        };
        img.src = url;
      }
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `ad-assets/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('ad-assets')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('ad-assets')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let fileUrl = formData.file_url;

      // Upload new file if selected
      if (selectedFile) {
        setUploading(true);
        fileUrl = await uploadFile(selectedFile);
        setUploading(false);
      }

      if (!fileUrl) {
        throw new Error("Aucun fichier sélectionné");
      }

      const data = {
        file_name: formData.file_name,
        file_url: fileUrl,
        alt_text: formData.alt_text,
        campaign_id: formData.campaign_id,
        width: formData.width ? parseInt(formData.width) : null,
        height: formData.height ? parseInt(formData.height) : null,
        display_order: formData.display_order ? parseInt(formData.display_order) : 0,
        file_size: formData.file_size ? parseInt(formData.file_size) : null,
      };

      if (creative) {
        const { error } = await supabase
          .from('ad_assets')
          .update(data)
          .eq('id', creative.id);
        
        if (error) throw error;
        toast({ title: "Créatif modifié avec succès" });
      } else {
        const { error } = await supabase
          .from('ad_assets')
          .insert([data]);
        
        if (error) throw error;
        toast({ title: "Créatif créé avec succès" });
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
      setUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setFormData(prev => ({
      ...prev,
      file_url: "",
      file_name: "",
      file_size: "",
      width: "",
      height: ""
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {creative ? "Modifier le créatif" : "Nouveau créatif publicitaire"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="campaign_id">Campagne</Label>
            <Select value={formData.campaign_id} onValueChange={(value) => setFormData(prev => ({ ...prev, campaign_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une campagne" />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.name} ({campaign.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fichier image</Label>
            {!previewUrl ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-muted-foreground">
                        Cliquez pour télécharger ou glissez-déposez
                      </span>
                      <span className="text-xs text-muted-foreground">
                        PNG, JPG, WEBP, SVG jusqu'à 10MB
                      </span>
                      <input
                        id="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleFileSelect}
                      />
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Aperçu"
                  className="max-w-full h-auto max-h-48 rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">Largeur (px)</Label>
              <Input
                id="width"
                type="number"
                value={formData.width}
                onChange={(e) => setFormData(prev => ({ ...prev, width: e.target.value }))}
                placeholder="Auto-détecté"
                readOnly={!!selectedFile}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Hauteur (px)</Label>
              <Input
                id="height"
                type="number"
                value={formData.height}
                onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                placeholder="Auto-détecté"
                readOnly={!!selectedFile}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alt_text">Texte alternatif</Label>
            <Input
              id="alt_text"
              value={formData.alt_text}
              onChange={(e) => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
              placeholder="Description de l'image pour l'accessibilité"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_order">Ordre d'affichage</Label>
            <Input
              id="display_order"
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData(prev => ({ ...prev, display_order: e.target.value }))}
              placeholder="0"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {uploading ? "Upload..." : loading ? "Enregistrement..." : creative ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}