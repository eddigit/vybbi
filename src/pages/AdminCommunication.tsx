import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BlogPostDialog } from "@/components/admin/BlogPostDialog";

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

export default function AdminCommunication() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
            Gérez les articles de blog et les actualités de la plateforme
          </p>
        </div>
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

      <BlogPostDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        post={editingPost}
      />
    </div>
  );
}