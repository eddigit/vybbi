import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Tag, X, Palette } from 'lucide-react';

interface ProspectTag {
  id: string;
  name: string;
  color: string;
  description?: string;
  category: string;
  is_system: boolean;
}

interface ProspectTagManagerProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  className?: string;
}

export default function ProspectTagManager({ selectedTags, onTagsChange, className }: ProspectTagManagerProps) {
  const { toast } = useToast();
  const [tags, setTags] = useState<ProspectTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTag, setNewTag] = useState({
    name: '',
    color: '#3b82f6',
    description: '',
    category: 'custom'
  });

  const colorOptions = [
    { value: '#ef4444', name: 'Rouge' },
    { value: '#f97316', name: 'Orange' }, 
    { value: '#eab308', name: 'Jaune' },
    { value: '#22c55e', name: 'Vert' },
    { value: '#06b6d4', name: 'Cyan' },
    { value: '#3b82f6', name: 'Bleu' },
    { value: '#8b5cf6', name: 'Violet' },
    { value: '#ec4899', name: 'Rose' },
    { value: '#6b7280', name: 'Gris' }
  ];

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const { data } = await supabase
        .from('prospect_tags')
        .select('*')
        .order('is_system', { ascending: false })
        .order('name');
      
      if (data) {
        setTags(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tags:', error);
    }
  };

  const handleCreateTag = async () => {
    if (!newTag.name.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez saisir un nom pour le tag",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('prospect_tags')
        .insert([{
          name: newTag.name.trim(),
          color: newTag.color,
          description: newTag.description.trim() || null,
          category: newTag.category,
          created_by: user?.id
        }]);

      if (error) throw error;

      toast({
        title: "Tag créé",
        description: `Le tag "${newTag.name}" a été créé avec succès`,
      });

      setNewTag({
        name: '',
        color: '#3b82f6',
        description: '',
        category: 'custom'
      });
      setDialogOpen(false);
      loadTags();

    } catch (error) {
      console.error('Erreur lors de la création du tag:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le tag",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tagName: string) => {
    const isSelected = selectedTags.includes(tagName);
    if (isSelected) {
      onTagsChange(selectedTags.filter(t => t !== tagName));
    } else {
      onTagsChange([...selectedTags, tagName]);
    }
  };

  const handleRemoveTag = (tagName: string) => {
    onTagsChange(selectedTags.filter(t => t !== tagName));
  };

  const getTagsByCategory = () => {
    const categories = tags.reduce((acc, tag) => {
      if (!acc[tag.category]) {
        acc[tag.category] = [];
      }
      acc[tag.category].push(tag);
      return acc;
    }, {} as Record<string, ProspectTag[]>);

    return categories;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'priority': 'Priorité',
      'temperature': 'Température',
      'type': 'Type de Contact',
      'opportunity': 'Opportunité',
      'custom': 'Personnalisés',
      'general': 'Général'
    };
    return labels[category] || category;
  };

  return (
    <div className={className}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Tags</Label>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Nouveau Tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouveau tag</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tag_name">Nom du tag *</Label>
                  <Input
                    id="tag_name"
                    value={newTag.name}
                    onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                    placeholder="Ex: Très intéressé"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Couleur</Label>
                  <div className="flex gap-2 flex-wrap">
                    {colorOptions.map(color => (
                      <button
                        key={color.value}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          newTag.color === color.value ? 'border-foreground' : 'border-muted'
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setNewTag({ ...newTag, color: color.value })}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tag_description">Description</Label>
                  <Input
                    id="tag_description"
                    value={newTag.description}
                    onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
                    placeholder="Description optionnelle"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateTag} disabled={loading}>
                    {loading ? 'Création...' : 'Créer'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tags sélectionnés */}
        {selectedTags.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Tags sélectionnés:</Label>
            <div className="flex flex-wrap gap-1">
              {selectedTags.map(tagName => {
                const tag = tags.find(t => t.name === tagName);
                return (
                  <Badge
                    key={tagName}
                    className="text-white cursor-pointer hover:opacity-80"
                    style={{ backgroundColor: tag?.color || '#6b7280' }}
                    onClick={() => handleRemoveTag(tagName)}
                  >
                    {tagName}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Tags disponibles par catégorie */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {Object.entries(getTagsByCategory()).map(([category, categoryTags]) => (
            <div key={category} className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">
                {getCategoryLabel(category)}
              </Label>
              <div className="flex flex-wrap gap-1">
                {categoryTags.map(tag => {
                  const isSelected = selectedTags.includes(tag.name);
                  return (
                    <Badge
                      key={tag.id}
                      className={`cursor-pointer transition-all ${
                        isSelected 
                          ? 'text-white shadow-md' 
                          : 'text-foreground bg-muted hover:opacity-80'
                      }`}
                      style={isSelected ? { backgroundColor: tag.color } : {}}
                      onClick={() => handleTagToggle(tag.name)}
                      title={tag.description}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag.name}
                      {tag.is_system && (
                        <span className="ml-1 text-xs opacity-70">•</span>
                      )}
                    </Badge>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}