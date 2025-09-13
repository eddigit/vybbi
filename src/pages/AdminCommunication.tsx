import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Eye, MessageSquare, Settings, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BlogPostDialog } from "@/components/admin/BlogPostDialog";
import { EmailTemplateManager } from "@/components/admin/EmailTemplateManager";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

interface TickerMessage {
  id: string;
  message: string;
  is_active: boolean;
  display_order: number;
  start_date?: string;
  end_date?: string;
  days_of_week?: string[];
  start_time?: string;
  end_time?: string;
  timezone?: string;
  priority?: number;
  created_at: string;
  updated_at: string;
}

export default function AdminCommunication() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [newTickerMessage, setNewTickerMessage] = useState("");
  const [newTickerSchedule, setNewTickerSchedule] = useState({
    start_date: "",
    end_date: "",
    days_of_week: [] as string[],
    start_time: "",
    end_time: "",
    priority: 1
  });
  const [editingTicker, setEditingTicker] = useState<TickerMessage | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const daysOfWeek = [
    { value: 'monday', label: 'Lundi' },
    { value: 'tuesday', label: 'Mardi' },
    { value: 'wednesday', label: 'Mercredi' },
    { value: 'thursday', label: 'Jeudi' },
    { value: 'friday', label: 'Vendredi' },
    { value: 'saturday', label: 'Samedi' },
    { value: 'sunday', label: 'Dimanche' }
  ];

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BlogPost[];
    },
  });

  const { data: tickerMessages = [], isLoading: isLoadingTicker } = useQuery({
    queryKey: ['admin-ticker-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_ticker_messages')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as TickerMessage[];
    },
  });

  const deleteTickerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('site_ticker_messages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ticker-messages'] });
      toast({
        title: "Message supprimé",
        description: "Le message du bandeau a été supprimé avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le message.",
        variant: "destructive",
      });
    },
  });

  const createTickerMutation = useMutation({
    mutationFn: async (data: { 
      message: string; 
      start_date?: string; 
      end_date?: string; 
      days_of_week?: string[]; 
      start_time?: string; 
      end_time?: string; 
      priority?: number; 
    }) => {
      const { error } = await supabase
        .from('site_ticker_messages')
        .insert([{
          message: data.message,
          is_active: true,
          display_order: tickerMessages.length,
          start_date: data.start_date || null,
          end_date: data.end_date || null,
          days_of_week: data.days_of_week?.length ? data.days_of_week : null,
          start_time: data.start_time || null,
          end_time: data.end_time || null,
          priority: data.priority || 1
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ticker-messages'] });
      setNewTickerMessage("");
      setNewTickerSchedule({
        start_date: "",
        end_date: "",
        days_of_week: [],
        start_time: "",
        end_time: "",
        priority: 1
      });
      toast({
        title: "Message ajouté",
        description: "Le message du bandeau a été ajouté avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le message.",
        variant: "destructive",
      });
    },
  });

  const updateTickerMutation = useMutation({
    mutationFn: async (data: TickerMessage) => {
      const { error } = await supabase
        .from('site_ticker_messages')
        .update({ 
          message: data.message, 
          is_active: data.is_active,
          start_date: data.start_date || null,
          end_date: data.end_date || null,
          days_of_week: data.days_of_week?.length ? data.days_of_week : null,
          start_time: data.start_time || null,
          end_time: data.end_time || null,
          priority: data.priority || 1
        })
        .eq('id', data.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ticker-messages'] });
      setEditingTicker(null);
      toast({
        title: "Message mis à jour",
        description: "Le message du bandeau a été mis à jour avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le message.",
        variant: "destructive",
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      toast({
        title: "Article supprimé",
        description: "L'article a été supprimé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'article.",
        variant: "destructive",
      });
    },
  });

  const handleCreate = (type?: string) => {
    if (type === 'tech') {
      // Pre-fill with tech manifesto content
      setEditingPost({
        title: "Manifeste Technologique Vybbi",
        content: `Quand la Technologie Rencontre la Passion

Derrière l'interface élégante de Vybbi.app se cache un arsenal technologique digne des plus grandes plateformes mondiales. Notre mission : utiliser l'innovation pour résoudre les vrais problèmes de l'industrie musicale nocturne.

## Intelligence Artificielle : Le Matching Parfait

**Le Problème :** Comment trouver l'artiste parfait parmi des milliers de profils ?

**Notre Solution :** Un algorithme d'IA propriétaire qui analyse :
• Style musical et influences
• Historique de performances
• Feedback et ratings
• Disponibilités géographiques
• Budget et préférences de l'organisateur

**Le Résultat :** 87% de taux de satisfaction sur les recommandations (vs 34% pour la recherche manuelle).

## Blockchain : La Révolution des Droits d'Auteur

**Le Problème :** Traçabilité des œuvres, paiements des royalties, contrats opaques.

**Notre Innovation :** Partenariat exclusif pour intégrer :
• Certification NFT des performances live
• Smart contracts pour paiements automatiques
• Traçabilité blockchain des créations
• Droits d'auteur numériques inviolables

**L'Impact :** Premier écosystème musical avec blockchain native intégrée.

L'avenir de la musique se construit en code. Et nous écrivons l'histoire.`,
        slug: "manifeste-technologique-vybbi",
        status: "draft" as const,
        excerpt: "Découvrez l'arsenal technologique qui révolutionne l'industrie musicale nocturne.",
        image_url: "",
        published_at: null
      } as any);
    } else {
      setEditingPost(null);
    }
    setIsDialogOpen(true);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      deletePostMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default">Publié</Badge>;
      case 'draft':
        return <Badge variant="secondary">Brouillon</Badge>;
      case 'archived':
        return <Badge variant="outline">Archivé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Communication</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les articles de blog, les messages du bandeau défilant et les templates d'email
          </p>
        </div>
      </div>

      <Tabs defaultValue="blog" className="space-y-6">
        <TabsList>
          <TabsTrigger value="blog">
            <MessageSquare className="w-4 h-4 mr-2" />
            Articles de Blog
          </TabsTrigger>
          <TabsTrigger value="ticker">
            <Settings className="w-4 h-4 mr-2" />
            Bandeau Défilant
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="w-4 h-4 mr-2" />
            Templates Email
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blog" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Articles de Blog</h2>
            <div className="flex gap-4">
              <Button onClick={() => handleCreate()}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvel article
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleCreate('tech')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer l'article "Manifeste Tech"
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg line-clamp-2">
                          {post.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(post.status)}
                          <span className="text-xs text-muted-foreground">
                            {new Date(post.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    {post.excerpt && (
                      <CardDescription className="line-clamp-3">
                        {post.excerpt}
                      </CardDescription>
                    )}
                  </CardHeader>
                  
                  {post.image_url && (
                    <div className="px-6 pb-4">
                      <img 
                        src={post.image_url} 
                        alt={post.title}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    </div>
                  )}

                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(post)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Éditer
                      </Button>
                      {post.status === 'published' && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="w-4 h-4 mr-1" />
                            Voir
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {posts.length === 0 && !isLoading && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <h3 className="text-lg font-semibold mb-2">Aucun article</h3>
                <p className="text-muted-foreground mb-4">
                  Commencez par créer votre premier article de blog.
                </p>
                <Button onClick={() => handleCreate()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un article
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ticker" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Messages du Bandeau Défilant</h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ajouter un nouveau message</CardTitle>
              <CardDescription>
                Ce message apparaîtra dans le bandeau défilant en haut du site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-message">Message</Label>
                <Textarea
                  id="new-message"
                  placeholder="THE HYPE OF THE NIGHT"
                  value={newTickerMessage}
                  onChange={(e) => setNewTickerMessage(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium text-sm">Programmation (optionnel)</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Date de début</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={newTickerSchedule.start_date}
                      onChange={(e) => setNewTickerSchedule(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">Date de fin</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={newTickerSchedule.end_date}
                      onChange={(e) => setNewTickerSchedule(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Jours de la semaine</Label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map((day) => (
                      <div key={day.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={day.value}
                          checked={newTickerSchedule.days_of_week.includes(day.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewTickerSchedule(prev => ({
                                ...prev,
                                days_of_week: [...prev.days_of_week, day.value]
                              }));
                            } else {
                              setNewTickerSchedule(prev => ({
                                ...prev,
                                days_of_week: prev.days_of_week.filter(d => d !== day.value)
                              }));
                            }
                          }}
                          className="rounded border-input"
                        />
                        <Label htmlFor={day.value} className="text-sm">{day.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Heure de début</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={newTickerSchedule.start_time}
                      onChange={(e) => setNewTickerSchedule(prev => ({ ...prev, start_time: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-time">Heure de fin</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={newTickerSchedule.end_time}
                      onChange={(e) => setNewTickerSchedule(prev => ({ ...prev, end_time: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priorité (1-10)</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    max="10"
                    value={newTickerSchedule.priority}
                    onChange={(e) => setNewTickerSchedule(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>
              <Button 
                onClick={() => createTickerMutation.mutate({
                  message: newTickerMessage,
                  start_date: newTickerSchedule.start_date || undefined,
                  end_date: newTickerSchedule.end_date || undefined,
                  days_of_week: newTickerSchedule.days_of_week.length > 0 ? newTickerSchedule.days_of_week : undefined,
                  start_time: newTickerSchedule.start_time || undefined,
                  end_time: newTickerSchedule.end_time || undefined,
                  priority: newTickerSchedule.priority
                })}
                disabled={!newTickerMessage.trim() || createTickerMutation.isPending}
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter le message
              </Button>
            </CardContent>
          </Card>

          {isLoadingTicker ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {tickerMessages.map((ticker) => (
                <Card key={ticker.id}>
                  <CardContent className="p-6">
                    {editingTicker?.id === ticker.id ? (
                      <div className="space-y-4">
                        <Textarea
                          value={editingTicker.message}
                          onChange={(e) => setEditingTicker({ ...editingTicker, message: e.target.value })}
                          className="min-h-[100px]"
                        />
                        
                        <div className="space-y-4 border-t pt-4">
                          <h4 className="font-medium text-sm">Programmation</h4>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Date de début</Label>
                              <Input
                                type="date"
                                value={editingTicker.start_date || ""}
                                onChange={(e) => setEditingTicker({ ...editingTicker, start_date: e.target.value || undefined })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Date de fin</Label>
                              <Input
                                type="date"
                                value={editingTicker.end_date || ""}
                                onChange={(e) => setEditingTicker({ ...editingTicker, end_date: e.target.value || undefined })}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Jours de la semaine</Label>
                            <div className="flex flex-wrap gap-2">
                              {daysOfWeek.map((day) => (
                                <div key={day.value} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`edit-${day.value}`}
                                    checked={editingTicker.days_of_week?.includes(day.value) || false}
                                    onChange={(e) => {
                                      const currentDays = editingTicker.days_of_week || [];
                                      if (e.target.checked) {
                                        setEditingTicker({ 
                                          ...editingTicker, 
                                          days_of_week: [...currentDays, day.value]
                                        });
                                      } else {
                                        setEditingTicker({ 
                                          ...editingTicker, 
                                          days_of_week: currentDays.filter(d => d !== day.value)
                                        });
                                      }
                                    }}
                                    className="rounded border-input"
                                  />
                                  <Label htmlFor={`edit-${day.value}`} className="text-sm">{day.label}</Label>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Heure de début</Label>
                              <Input
                                type="time"
                                value={editingTicker.start_time || ""}
                                onChange={(e) => setEditingTicker({ ...editingTicker, start_time: e.target.value || undefined })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Heure de fin</Label>
                              <Input
                                type="time"
                                value={editingTicker.end_time || ""}
                                onChange={(e) => setEditingTicker({ ...editingTicker, end_time: e.target.value || undefined })}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Priorité (1-10)</Label>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              value={editingTicker.priority || 1}
                              onChange={(e) => setEditingTicker({ ...editingTicker, priority: parseInt(e.target.value) || 1 })}
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={editingTicker.is_active}
                            onCheckedChange={(checked) => setEditingTicker({ ...editingTicker, is_active: checked })}
                          />
                          <Label>Actif</Label>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => updateTickerMutation.mutate(editingTicker)}
                            disabled={updateTickerMutation.isPending}
                            size="sm"
                          >
                            Sauvegarder
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setEditingTicker(null)}
                            size="sm"
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium mb-2">{ticker.message}</p>
                          <div className="flex items-center flex-wrap gap-2 text-sm text-muted-foreground">
                            <Badge variant={ticker.is_active ? "default" : "secondary"}>
                              {ticker.is_active ? "Actif" : "Inactif"}
                            </Badge>
                            {ticker.priority && ticker.priority > 1 && (
                              <Badge variant="outline">Priorité {ticker.priority}</Badge>
                            )}
                            <span>
                              Créé le {new Date(ticker.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          {(ticker.start_date || ticker.end_date || ticker.days_of_week?.length || ticker.start_time || ticker.end_time) && (
                            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                              <h5 className="font-medium text-sm mb-2">Programmation:</h5>
                              <div className="text-sm space-y-1">
                                {(ticker.start_date || ticker.end_date) && (
                                  <p>
                                    📅 {ticker.start_date ? `Du ${new Date(ticker.start_date).toLocaleDateString('fr-FR')}` : ''} 
                                    {ticker.end_date ? ` au ${new Date(ticker.end_date).toLocaleDateString('fr-FR')}` : ''}
                                  </p>
                                )}
                                {ticker.days_of_week?.length && (
                                  <p>📆 Jours: {ticker.days_of_week.map(day => 
                                    daysOfWeek.find(d => d.value === day)?.label || day
                                  ).join(', ')}</p>
                                )}
                                {(ticker.start_time || ticker.end_time) && (
                                  <p>
                                    🕐 {ticker.start_time ? `De ${ticker.start_time}` : ''} 
                                    {ticker.end_time ? ` à ${ticker.end_time}` : ''}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingTicker(ticker)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Éditer
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteTickerMutation.mutate(ticker.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {tickerMessages.length === 0 && !isLoadingTicker && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <h3 className="text-lg font-semibold mb-2">Aucun message</h3>
                <p className="text-muted-foreground mb-4">
                  Commencez par ajouter votre premier message de bandeau.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="email">
          <EmailTemplateManager />
        </TabsContent>
      </Tabs>

      <BlogPostDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        post={editingPost}
      />
    </div>
  );
}