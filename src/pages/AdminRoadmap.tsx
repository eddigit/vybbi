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
  const [areaFilter, setAreaFilter] = useState<string>('all');
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
            due_date: formData.due_date || null
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
    if (areaFilter !== 'all' && item.area !== areaFilter) return false;
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="tasks">Gestion des Tâches</TabsTrigger>
          <TabsTrigger value="arguments">Arguments Commerciaux</TabsTrigger>
          <TabsTrigger value="documentation">Documentation ADN</TabsTrigger>
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
              
              <Select onValueChange={(value) => setAreaFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Domaine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les domaines</SelectItem>
                  <SelectItem value="Multimédia">Multimédia</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Analytics">Analytics</SelectItem>
                  <SelectItem value="Monétisation">Monétisation</SelectItem>
                  <SelectItem value="Technique">Technique</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
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

        <TabsContent value="documentation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                Documentation ADN - Plateforme Vybbi
              </CardTitle>
              <CardDescription>
                Guide complet de l'écosystème et des fonctionnalités de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert max-w-none space-y-8">
              
              <section>
                <h2 className="text-2xl font-bold mb-4 text-primary">🎯 Vision & Mission</h2>
                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Notre Vision</h3>
                  <p className="mb-4">Démocratiser l'accès au talent musical en créant le premier écosystème complet de découverte, développement et promotion d'artistes émergents.</p>
                  
                  <h3 className="text-lg font-semibold mb-2">Notre Mission</h3>
                  <p>Connecter artistes, agents, managers et lieux événementiels via une plateforme intelligente intégrant IA de prospection, diffusion média (radio/web TV) et monétisation transparente.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-primary">🚀 Fonctionnalités Core</h2>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">🎵 Multimédia Intégré</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• <strong>Radio Vybbi</strong> : Diffusion continue avec playlists intelligentes</li>
                      <li>• <strong>Web TV</strong> : Interviews, reportages et concerts live</li>
                      <li>• <strong>Studio Live</strong> : Production et streaming en direct</li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">🤖 IA & Prospection</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• <strong>Prospection automatisée</strong> : Identification de talents via réseaux sociaux</li>
                      <li>• <strong>Scoring prédictif</strong> : Évaluation du potentiel artistique</li>
                      <li>• <strong>Matching intelligent</strong> : Connexion artistes-professionnels</li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">📊 Analytics Avancés</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• <strong>Métriques temps réel</strong> : Écoutes, vues, engagement</li>
                      <li>• <strong>ROI tracking</strong> : Suivi performance et conversions</li>
                      <li>• <strong>Reporting personnalisé</strong> : Dashboard par profil utilisateur</li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">💰 Monétisation Multi-Sources</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• <strong>Abonnements Premium</strong> : Boost visibilité et fonctionnalités exclusives</li>
                      <li>• <strong>Commissions affiliés</strong> : Système transparent de rémunération</li>
                      <li>• <strong>Marketplace services</strong> : Mixing, mastering, coaching</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-primary">💎 Arguments Commerciaux Clés</h2>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg border-l-4 border-primary">
                    <h3 className="font-semibold">🎯 Solution Tout-en-Un Unique</h3>
                    <p className="text-sm mt-1">Seule plateforme intégrant découverte IA + diffusion média + booking + monétisation en un écosystème cohérent.</p>
                  </div>

                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg border-l-4 border-primary">
                    <h3 className="font-semibold">🤖 Technologie IA Propriétaire</h3>
                    <p className="text-sm mt-1">Algorithmes exclusifs d'identification de talents émergents avec scoring prédictif de succès.</p>
                  </div>

                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg border-l-4 border-primary">
                    <h3 className="font-semibold">📺 Écosystème Média Complet</h3>
                    <p className="text-sm mt-1">Radio + Web TV + Streaming = Maximum d'exposition pour les artistes sur tous canaux.</p>
                  </div>

                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg border-l-4 border-primary">
                    <h3 className="font-semibold">📊 ROI Mesurable & Transparent</h3>
                    <p className="text-sm mt-1">Analytics détaillés justifiant chaque investissement avec métriques de performance en temps réel.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-primary">👥 Profils Utilisateurs</h2>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">🎤 Artistes</h3>
                    <p className="text-sm text-muted-foreground">Talents émergents cherchant visibilité, booking et développement professionnel.</p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">🤝 Agents</h3>
                    <p className="text-sm text-muted-foreground">Représentants artistiques utilisant l'IA pour identifier et développer nouveaux talents.</p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">📋 Managers</h3>
                    <p className="text-sm text-muted-foreground">Gestionnaires de carrière optimisant promotion et monétisation d'artistes.</p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">🏢 Lieux & Événements</h3>
                    <p className="text-sm text-muted-foreground">Organisateurs recherchant talents adaptés via filtres et recommandations intelligentes.</p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">🌟 Influenceurs</h3>
                    <p className="text-sm text-muted-foreground">Créateurs de contenu monétisant leur audience via système d'affiliation.</p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">🎯 Partenaires</h3>
                    <p className="text-sm text-muted-foreground">Marques et entreprises intégrant l'écosystème Vybbi via API et partenariats.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-primary">🏗️ Architecture Technique</h2>
                
                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="font-semibold mb-2">Frontend</h3>
                      <ul className="text-sm space-y-1">
                        <li>• React + TypeScript + Tailwind CSS</li>
                        <li>• PWA avec fonctionnalités offline</li>
                        <li>• Applications mobile natives (iOS/Android)</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Backend</h3>
                      <ul className="text-sm space-y-1">
                        <li>• Supabase (PostgreSQL + Edge Functions)</li>
                        <li>• API REST et GraphQL</li>
                        <li>• Microservices streaming audio/vidéo</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">IA & Machine Learning</h3>
                      <ul className="text-sm space-y-1">
                        <li>• OpenAI GPT pour analyse de contenu</li>
                        <li>• Modèles prédictifs propriétaires</li>
                        <li>• Computer vision pour analyse vidéo</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Infrastructure</h3>
                      <ul className="text-sm space-y-1">
                        <li>• CDN global pour streaming</li>
                        <li>• Auto-scaling sur AWS/Vercel</li>
                        <li>• Monitoring temps réel et alertes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-primary">🌟 Différenciateurs Concurrentiels</h2>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Intégration Verticale Complète</strong> - De la découverte à la monétisation
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <strong>IA Prédictive Propriétaire</strong> - Identification automatique de talents à potentiel
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Écosystème Média Intégré</strong> - Radio, TV et streaming natifs
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Monétisation Multi-Facettes</strong> - Sources de revenus diversifiées et transparentes
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-primary">🎯 Roadmap Stratégique 2026</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Q1 2026 - Consolidation & Communautés</h3>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <ul className="space-y-1 text-sm">
                        <li>✅ Radio Vybbi avec abonnements premium et chat live</li>
                        <li>✅ Système de communautés intégré (5 communautés principales)</li>
                        <li>✅ Affiliation avancée avec QR codes et tracking complet</li>
                        <li>🔄 Web TV avec studio live intégré</li>
                        <li>🔄 Optimisation système de prospection IA</li>
                        <li>📋 API publique v1.0 pour partenariats</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Q2 2026 - Expansion & Monétisation</h3>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <ul className="space-y-1 text-sm">
                        <li>📱 Applications mobiles natives iOS/Android</li>
                        <li>🌍 Internationalisation (UK, US, Canada)</li>
                        <li>🏪 Marketplace services étendu avec commissions automatisées</li>
                        <li>💳 Système d'abonnements premium multi-niveaux</li>
                        <li>📧 Plateforme emailing avancée avec templates dynamiques</li>
                        <li>🤝 Partenariats labels et distributeurs majeurs</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Q4 2026 - Innovation & Écosystème Complet</h3>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <ul className="space-y-1 text-sm">
                        <li>🎮 Expériences immersives AR/VR pour concerts virtuels</li>
                        <li>🎵 IA générative pour composition assistée</li>
                        <li>🔗 Intégration blockchain et NFTs</li>
                        <li>📊 Analytics prédictifs avancés avec IA</li>
                        <li>🏢 Plateforme tout-en-un unifiée</li>
                        <li>🌐 Écosystème média intégré (Radio + TV + Streaming + Live)</li>
                        <li>🤖 IA de prospection unique sur le marché</li>
                        <li>💰 ROI mesurable et transparent pour tous les acteurs</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}