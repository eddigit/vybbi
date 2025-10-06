import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PinProtection } from "@/components/admin/PinProtection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Key, Shield, Eye, EyeOff, Copy, Search, Filter, GripVertical, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

interface AdminSecret {
  id: string;
  name: string;
  category: string;
  value: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  last_accessed_at: string | null;
  order_number: number;
}

const categories = [
  'database',
  'finance',
  'mail_account',
  'api_keys',
  'passwords', 
  'wallets',
  'tokens',
  'credentials',
  'certificates',
  'general'
];

const categoryLabels = {
  database: 'BDD',
  finance: 'Finance',
  mail_account: 'Mail Account',
  api_keys: 'Clés API',
  passwords: 'Mots de passe',
  wallets: 'Wallets Crypto',
  tokens: 'Tokens',
  credentials: 'Identifiants',
  certificates: 'Certificats',
  general: 'Général'
};

const categoryColors = {
  database: 'bg-indigo-500',
  finance: 'bg-emerald-500',
  mail_account: 'bg-amber-500',
  api_keys: 'bg-blue-500',
  passwords: 'bg-red-500',
  wallets: 'bg-purple-500',
  tokens: 'bg-green-500',
  credentials: 'bg-orange-500',
  certificates: 'bg-cyan-500',
  general: 'bg-gray-500'
};

export default function AdminCoffreFort() {
  const { user, hasRole } = useAuth();
  const [secrets, setSecrets] = useState<AdminSecret[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSecret, setEditingSecret] = useState<AdminSecret | null>(null);
  const [showValues, setShowValues] = useState<{ [key: string]: boolean }>({});
  const [formData, setFormData] = useState({
    name: '',
    category: 'general',
    value: '',
    description: ''
  });

  useEffect(() => {
    if (!user || !hasRole('admin')) return;
    fetchSecrets();
  }, [user, hasRole]);

  const fetchSecrets = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_secrets')
        .select('*')
        .order('order_number', { ascending: true });

      if (error) throw error;
      setSecrets(data || []);
    } catch (error) {
      console.error('Error fetching secrets:', error);
      toast.error('Erreur lors du chargement des secrets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSecret) {
        const { error } = await supabase
          .from('admin_secrets')
          .update({
            name: formData.name,
            category: formData.category,
            value: formData.value,
            description: formData.description,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingSecret.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        toast.success('Secret mis à jour avec succès');
      } else {
        // Get the highest order_number to add new secret at the end
        const maxOrder = secrets.length > 0 
          ? Math.max(...secrets.map(s => s.order_number || 0)) 
          : 0;

        const { error } = await supabase
          .from('admin_secrets')
          .insert([{
            name: formData.name,
            category: formData.category,
            value: formData.value,
            description: formData.description,
            created_by: user?.id,
            order_number: maxOrder + 1
          }]);

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        toast.success('Secret ajouté avec succès');
      }

      setIsDialogOpen(false);
      setEditingSecret(null);
      setFormData({ name: '', category: 'general', value: '', description: '' });
      fetchSecrets();
    } catch (error: any) {
      console.error('Error saving secret:', error);
      toast.error(error?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (secret: AdminSecret) => {
    setEditingSecret(secret);
    setFormData({
      name: secret.name,
      category: secret.category,
      value: secret.value,
      description: secret.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce secret ?')) return;

    try {
      const { error } = await supabase
        .from('admin_secrets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Secret supprimé avec succès');
      fetchSecrets();
    } catch (error) {
      console.error('Error deleting secret:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleShowValue = (id: string) => {
    setShowValues(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success('Copié dans le presse-papier');
    } catch (error) {
      toast.error('Erreur lors de la copie');
    }
  };

  const updateLastAccessed = async (id: string) => {
    try {
      await supabase
        .from('admin_secrets')
        .update({
          last_accessed_at: new Date().toISOString(),
          last_accessed_by: user?.id
        })
        .eq('id', id);
    } catch (error) {
      console.error('Error updating last accessed:', error);
    }
  };

  const filteredSecrets = secrets.filter(secret => {
    const matchesSearch = secret.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         secret.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || secret.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(filteredSecrets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately for better UX
    const reorderedSecrets = items.map((item, index) => ({
      ...item,
      order_number: index
    }));

    // Update all secrets with new order in the filtered list
    const allSecrets = secrets.map(secret => {
      const reordered = reorderedSecrets.find(s => s.id === secret.id);
      return reordered || secret;
    });
    
    setSecrets(allSecrets);

    // Update database
    try {
      const updates = reorderedSecrets.map((secret, index) => ({
        id: secret.id,
        order_number: index
      }));

      for (const update of updates) {
        await supabase
          .from('admin_secrets')
          .update({ order_number: update.order_number })
          .eq('id', update.id);
      }

      toast.success('Ordre mis à jour');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Erreur lors de la mise à jour de l\'ordre');
      fetchSecrets(); // Reload on error
    }
  };

  const handleExportJSON = () => {
    if (!confirm('⚠️ Vous êtes sur le point d\'exporter TOUS les secrets en clair. Continuer ?')) {
      return;
    }

    try {
      const exportData = {
        metadata: {
          exported_at: new Date().toISOString(),
          total_secrets: secrets.length,
          exported_by: user?.email || 'admin',
          export_id: crypto.randomUUID(),
          warning: '⚠️ CONFIDENTIEL - Ne pas partager'
        },
        secrets: secrets.map(secret => ({
          name: secret.name,
          category: secret.category,
          value: secret.value,
          description: secret.description,
          created_at: secret.created_at,
          last_accessed_at: secret.last_accessed_at
        }))
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vybbi-secrets-${new Date().toISOString().slice(0,16).replace(/:/g,'-')}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success('Export JSON réussi', {
        description: 'Fichier téléchargé avec succès'
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export JSON');
    }
  };

  const handleExportENV = () => {
    if (!confirm('⚠️ Vous êtes sur le point d\'exporter TOUS les secrets en format .env. Continuer ?')) {
      return;
    }

    try {
      let envContent = '# ========================================\n';
      envContent += '# VYBBI SECRETS - CONFIGURATION ENV\n';
      envContent += `# Exporté le ${new Date().toLocaleString('fr-FR')}\n`;
      envContent += '# ========================================\n\n';

      // Grouper par catégorie
      const groupedByCategory = secrets.reduce((acc, secret) => {
        if (!acc[secret.category]) {
          acc[secret.category] = [];
        }
        acc[secret.category].push(secret);
        return acc;
      }, {} as Record<string, AdminSecret[]>);

      // Générer le contenu ENV par catégorie
      Object.entries(groupedByCategory).forEach(([category, categorySecrets]) => {
        envContent += `# === ${categoryLabels[category as keyof typeof categoryLabels].toUpperCase()} ===\n`;
        
        categorySecrets.forEach(secret => {
          // Convertir le nom en UPPER_SNAKE_CASE
          const envKey = secret.name
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');

          // Description en commentaire si disponible
          if (secret.description) {
            envContent += `# ${secret.description}\n`;
          }

          // Gestion des valeurs multiligne
          const value = secret.value.includes('\n') 
            ? `"${secret.value.replace(/"/g, '\\"')}"` 
            : secret.value;

          envContent += `${envKey}=${value}\n`;
        });
        
        envContent += '\n';
      });

      const blob = new Blob([envContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `.env.local-${new Date().toISOString().slice(0,10)}`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success('Export .env réussi', {
        description: 'Renommez le fichier en .env.local avant utilisation'
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export .env');
    }
  };

  // Access control
  if (!user || !hasRole('admin')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-destructive mb-4" />
              <h2 className="text-lg font-semibold mb-2">Accès Refusé</h2>
              <p className="text-muted-foreground">
                Vous devez avoir les droits d'administrateur pour accéder au coffre-fort.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <PinProtection>
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Coffre-Fort Admin
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestion sécurisée des mots de passe, clés API et secrets de la plateforme
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportJSON}>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button variant="outline" onClick={handleExportENV}>
            <FileText className="h-4 w-4 mr-2" />
            Export .env
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Secret
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>
                {editingSecret ? 'Modifier le Secret' : 'Nouveau Secret'}
              </DialogTitle>
              <DialogDescription>
                Ajoutez ou modifiez un secret. Toutes les données sont chiffrées.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ex: OpenAI API Key"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {categoryLabels[cat as keyof typeof categoryLabels]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="value">Valeur *</Label>
                <Textarea
                  id="value"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="Saisissez la valeur secrète..."
                  className="min-h-[100px]"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description ou notes..."
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingSecret ? 'Mettre à jour' : 'Créer'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Secrets</p>
                <p className="text-2xl font-bold">{secrets.length}</p>
              </div>
              <Key className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        {categories.slice(0, 3).map((category) => (
          <Card key={category}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </p>
                  <p className="text-2xl font-bold">
                    {secrets.filter(s => s.category === category).length}
                  </p>
                </div>
                <Badge className={`${categoryColors[category as keyof typeof categoryColors]} text-white`}>
                  {category.toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secrets Table with Drag & Drop */}
      <Card>
        <CardHeader>
          <CardTitle>Secrets ({filteredSecrets.length})</CardTitle>
          <CardDescription>
            Liste des secrets stockés de manière sécurisée. Glissez-déposez pour réorganiser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Valeur</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Dernier accès</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <Droppable droppableId="secrets">
                {(provided) => (
                  <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                    {filteredSecrets.map((secret, index) => (
                      <Draggable key={secret.id} draggableId={secret.id} index={index}>
                        {(provided, snapshot) => (
                          <TableRow
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={snapshot.isDragging ? "bg-muted" : ""}
                          >
                            <TableCell {...provided.dragHandleProps}>
                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
                            </TableCell>
                            <TableCell className="font-medium">{secret.name}</TableCell>
                            <TableCell>
                              <Badge className={`${categoryColors[secret.category as keyof typeof categoryColors]} text-white`}>
                                {categoryLabels[secret.category as keyof typeof categoryLabels]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <code className="text-sm bg-muted px-2 py-1 rounded max-w-[200px] truncate">
                                  {showValues[secret.id] ? secret.value : '••••••••••••'}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    toggleShowValue(secret.id);
                                    if (!showValues[secret.id]) {
                                      updateLastAccessed(secret.id);
                                    }
                                  }}
                                >
                                  {showValues[secret.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    copyToClipboard(secret.value);
                                    updateLastAccessed(secret.id);
                                  }}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {secret.description || '-'}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {secret.last_accessed_at 
                                ? new Date(secret.last_accessed_at).toLocaleDateString('fr-FR')
                                : 'Jamais'
                              }
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(secret)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(secret.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </TableBody>
                )}
              </Droppable>
            </Table>
          </DragDropContext>
          
          {filteredSecrets.length === 0 && (
            <div className="text-center py-8">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun secret trouvé</h3>
              <p className="text-muted-foreground">
                {searchTerm || categoryFilter !== 'all' 
                  ? 'Aucun secret ne correspond à vos critères de recherche.'
                  : 'Commencez par ajouter votre premier secret.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </PinProtection>
  );
}