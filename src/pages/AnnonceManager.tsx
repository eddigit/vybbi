import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { Annonce, Application, AnnonceStatus } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ImageUpload from "@/components/ImageUpload";

export function AnnonceManager() {
  const { profile } = useAuth();
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [applications, setApplications] = useState<Record<string, Application[]>>({});
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAnnonce, setEditingAnnonce] = useState<Annonce | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    event_date: "",
    deadline: "",
    budget_min: "",
    budget_max: "",
    requirements: "",
    genres: "",
    status: "draft" as AnnonceStatus,
    image_url: ""
  });

  useEffect(() => {
    if (profile) {
      fetchAnnonces();
    }
  }, [profile]);

  const fetchAnnonces = async () => {
    try {
      const { data, error } = await supabase
        .from("annonces")
        .select("*")
        .eq("user_id", profile?.user_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAnnonces(data || []);

      // Fetch applications for each annonce
      for (const annonce of data || []) {
        fetchApplications(annonce.id);
      }
    } catch (error) {
      console.error("Error fetching annonces:", error);
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (annonceId: string) => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          profiles!inner (*)
        `)
        .eq("annonce_id", annonceId);

      if (error) throw error;
      setApplications(prev => ({
        ...prev,
        [annonceId]: data || []
      }));
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const annonceData = {
        title: formData.title,
        description: formData.description,
        location: formData.location || null,
        event_date: formData.event_date || null,
        deadline: formData.deadline || null,
        budget_min: formData.budget_min ? parseInt(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseInt(formData.budget_max) : null,
        requirements: formData.requirements || null,
        genres: formData.genres ? formData.genres.split(",").map(g => g.trim()) : null,
        status: formData.status,
        image_url: formData.image_url || null,
        user_id: profile?.user_id
      };

      if (editingAnnonce) {
        const { error } = await supabase
          .from("annonces")
          .update(annonceData)
          .eq("id", editingAnnonce.id);

        if (error) throw error;
        toast.success("Announcement updated successfully");
      } else {
        const { error } = await supabase
          .from("annonces")
          .insert(annonceData);

        if (error) throw error;
        toast.success("Announcement created successfully");
      }

      setShowCreateDialog(false);
      setEditingAnnonce(null);
      resetForm();
      fetchAnnonces();
    } catch (error) {
      console.error("Error saving annonce:", error);
      toast.error("Failed to save announcement");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const { error } = await supabase
        .from("annonces")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Announcement deleted successfully");
      fetchAnnonces();
    } catch (error) {
      console.error("Error deleting annonce:", error);
      toast.error("Failed to delete announcement");
    }
  };

  const handleStatusChange = async (id: string, status: AnnonceStatus) => {
    try {
      const { error } = await supabase
        .from("annonces")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      toast.success("Status updated successfully");
      fetchAnnonces();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      event_date: "",
      deadline: "",
      budget_min: "",
      budget_max: "",
      requirements: "",
      genres: "",
      status: "draft",
      image_url: ""
    });
  };

  const openEditDialog = (annonce: Annonce) => {
    setEditingAnnonce(annonce);
    setFormData({
      title: annonce.title,
      description: annonce.description,
      location: annonce.location || "",
      event_date: annonce.event_date || "",
      deadline: annonce.deadline || "",
      budget_min: annonce.budget_min?.toString() || "",
      budget_max: annonce.budget_max?.toString() || "",
      requirements: annonce.requirements || "",
      genres: annonce.genres?.join(", ") || "",
      status: annonce.status,
      image_url: annonce.image_url || ""
    });
    setShowCreateDialog(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Announcements</h1>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingAnnonce(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAnnonce ? "Edit Announcement" : "Create New Announcement"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Event or opportunity title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the opportunity"
                  rows={4}
                  required
                />
              </div>

              <ImageUpload
                currentImageUrl={formData.image_url}
                onImageChange={(imageUrl) => setFormData(prev => ({ ...prev, image_url: imageUrl || "" }))}
                bucket="annonces"
                folder="images"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Event location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Event Date</label>
                  <Input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Budget Min (€)</label>
                  <Input
                    type="number"
                    value={formData.budget_min}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget_min: e.target.value }))}
                    placeholder="Minimum budget"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Budget Max (€)</label>
                  <Input
                    type="number"
                    value={formData.budget_max}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget_max: e.target.value }))}
                    placeholder="Maximum budget"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select value={formData.status} onValueChange={(value: AnnonceStatus) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4">
                <Button type="submit">{editingAnnonce ? "Update" : "Create"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {annonces.map((annonce) => (
          <Card key={annonce.id} className="overflow-hidden">
            {annonce.image_url && (
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={annonce.image_url} 
                  alt={annonce.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{annonce.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Status: {annonce.status} • Created: {new Date(annonce.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEditDialog(annonce)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(annonce.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{annonce.description}</p>
              
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-muted-foreground">
                  {applications[annonce.id]?.length || 0} applications
                </div>
                <Select
                  value={annonce.status}
                  onValueChange={(value: AnnonceStatus) => handleStatusChange(annonce.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {applications[annonce.id] && applications[annonce.id].length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Recent Applications</h4>
                  <div className="space-y-2">
                    {applications[annonce.id].slice(0, 3).map((app: any) => (
                      <div key={app.id} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span className="font-medium">{app.profiles?.display_name}</span>
                        <span className={`text-sm px-2 py-1 rounded ${
                          app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {annonces.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No announcements yet. Create your first one!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}