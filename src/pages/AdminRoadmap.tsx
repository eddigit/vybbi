import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Calendar, Users, Target } from "lucide-react";
import { toast } from "sonner";

interface RoadmapItem {
  id: string;
  type: 'feature' | 'task' | 'selling_point';
  title: string;
  description: string | null;
  status: 'done' | 'in_progress' | 'planned' | 'on_hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  area: string | null;
  audience: string | null;
  due_date: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const statusColors = {
  done: 'bg-green-500',
  in_progress: 'bg-blue-500',
  planned: 'bg-yellow-500',
  on_hold: 'bg-orange-500',
  cancelled: 'bg-red-500'
};

const priorityColors = {
  low: 'bg-gray-500',
  medium: 'bg-blue-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500'
};

export default function AdminRoadmap() {
  const { user, profile } = useAuth();
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'feature' | 'task' | 'selling_point'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null);
  const [formData, setFormData] = useState({
    type: 'task' as 'feature' | 'task' | 'selling_point',
    title: '',
    description: '',
    status: 'planned' as 'done' | 'in_progress' | 'planned' | 'on_hold' | 'cancelled',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    area: '',
    audience: '',
    due_date: ''
  });

  // Use hasRole from useAuth hook
  const { hasRole } = useAuth();

  useEffect(() => {
    if (!user || !hasRole('admin')) return;
    fetchRoadmapItems();
  }, [user, hasRole]);

  const fetchRoadmapItems = async () => {
    try {
      const { data, error } = await supabase
        .from('roadmap_items')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setRoadmapItems(data || []);
    } catch (error) {
      console.error('Error fetching roadmap items:', error);
      toast.error('Erreur lors du chargement de la roadmap');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('roadmap_items')
          .update({
            ...formData,
            due_date: formData.due_date || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Élément mis à jour');
      } else {
        const { error } = await supabase
          .from('roadmap_items')
          .insert({
            ...formData,
            due_date: formData.due_date || null,
            created_by: user?.id
          });

        if (error) throw error;
        toast.success('Élément ajouté');
      }

      setIsDialogOpen(false);
      setEditingItem(null);
      setFormData({
        type: 'task',
        title: '',
        description: '',
        status: 'planned',
        priority: 'medium',
        area: '',
        audience: '',
        due_date: ''
      });
      fetchRoadmapItems();
    } catch (error) {
      console.error('Error saving roadmap item:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (item: RoadmapItem) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
      title: item.title,
      description: item.description || '',
      status: item.status,
      priority: item.priority,
      area: item.area || '',
      audience: item.audience || '',
      due_date: item.due_date || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;

    try {
      const { error } = await supabase
        .from('roadmap_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Élément supprimé');
      fetchRoadmapItems();
    } catch (error) {
      console.error('Error deleting roadmap item:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  if (!user || !hasRole('admin')) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Accès Refusé</h2>
            <p className="text-muted-foreground">
              Vous devez être administrateur pour accéder à cette page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const filteredItems = roadmapItems.filter(item => {
    if (filter !== 'all' && item.type !== filter) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    return true;
  });

  const features = roadmapItems.filter(item => item.type === 'feature');
  const tasks = roadmapItems.filter(item => item.type === 'task');
  const sellingPoints = roadmapItems.filter(item => item.type === 'selling_point');

  const statusStats = {
    done: roadmapItems.filter(item => item.status === 'done').length,
    in_progress: roadmapItems.filter(item => item.status === 'in_progress').length,
    planned: roadmapItems.filter(item => item.status === 'planned').length
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Roadmap Admin</h1>
        <p className="text-muted-foreground">
          Gestion des fonctionnalités, tâches et arguments commerciaux de la plateforme
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="tasks">Gestion des Tâches</TabsTrigger>
          <TabsTrigger value="arguments">Arguments Commerciaux</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Terminé</CardTitle>
                <Badge className={statusColors.done}>
                  {statusStats.done}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statusStats.done}</div>
                <p className="text-xs text-muted-foreground">
                  Fonctionnalités implémentées
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Cours</CardTitle>
                <Badge className={statusColors.in_progress}>
                  {statusStats.in_progress}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statusStats.in_progress}</div>
                <p className="text-xs text-muted-foreground">
                  Tâches en développement
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Planifié</CardTitle>
                <Badge className={statusColors.planned}>
                  {statusStats.planned}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statusStats.planned}</div>
                <p className="text-xs text-muted-foreground">
                  Tâches à venir
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Fonctionnalités ({features.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {features.slice(0, 5).map(feature => (
                  <div key={feature.id} className="flex items-center justify-between">
                    <span className="text-sm">{feature.title}</span>
                    <Badge className={statusColors[feature.status]}>
                      {feature.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Tâches Récentes ({tasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {tasks.slice(0, 5).map(task => (
                  <div key={task.id} className="flex items-center justify-between">
                    <span className="text-sm">{task.title}</span>
                    <Badge className={priorityColors[task.priority]}>
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="feature">Fonctionnalités</SelectItem>
                  <SelectItem value="task">Tâches</SelectItem>
                  <SelectItem value="selling_point">Arguments</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="done">Terminé</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="planned">Planifié</SelectItem>
                  <SelectItem value="on_hold">En attente</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingItem(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? 'Modifier' : 'Ajouter'} un élément
                    </DialogTitle>
                    <DialogDescription>
                      {editingItem ? 'Modifiez' : 'Ajoutez'} un élément à la roadmap
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="type" className="text-right">
                        Type
                      </Label>
                      <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="feature">Fonctionnalité</SelectItem>
                          <SelectItem value="task">Tâche</SelectItem>
                          <SelectItem value="selling_point">Argument</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">
                        Titre
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="status" className="text-right">
                        Statut
                      </Label>
                      <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planned">Planifié</SelectItem>
                          <SelectItem value="in_progress">En cours</SelectItem>
                          <SelectItem value="done">Terminé</SelectItem>
                          <SelectItem value="on_hold">En attente</SelectItem>
                          <SelectItem value="cancelled">Annulé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="priority" className="text-right">
                        Priorité
                      </Label>
                      <Select value={formData.priority} onValueChange={(value: any) => setFormData({...formData, priority: value})}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Basse</SelectItem>
                          <SelectItem value="medium">Moyenne</SelectItem>
                          <SelectItem value="high">Haute</SelectItem>
                          <SelectItem value="critical">Critique</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      {editingItem ? 'Modifier' : 'Ajouter'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge variant="outline">
                        {item.type === 'feature' ? 'Fonctionnalité' : 
                         item.type === 'task' ? 'Tâche' : 'Argument'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[item.status]}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityColors[item.priority]}>
                        {item.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.area}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="arguments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Arguments Commerciaux ({sellingPoints.length})
              </CardTitle>
              <CardDescription>
                Points de vente et avantages de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {sellingPoints.map((point) => (
                  <Card key={point.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{point.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {point.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <Badge className={priorityColors[point.priority]}>
                          {point.priority}
                        </Badge>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(point)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(point.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}