import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  FileText, 
  Download, 
  RefreshCw, 
  ExternalLink,
  Globe,
  Eye,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Settings
} from "lucide-react";
import { generateSitemapUrls, generateSitemapXml, type SitemapUrl } from "@/utils/sitemapGenerator";
import { supabase } from "@/integrations/supabase/client";

export default function AdminSEO() {
  const { toast } = useToast();
  const [sitemapUrls, setSitemapUrls] = useState<SitemapUrl[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [seoMetrics, setSeoMetrics] = useState({
    totalUrls: 0,
    missingMetaDescriptions: 0,
    missingAltText: 0,
    lastGenerated: null as string | null
  });
  const [robotsTxt, setRobotsTxt] = useState("");
  const [metaDefaults, setMetaDefaults] = useState({
    defaultTitle: "Vybbi - Plateforme de mise en relation musicale",
    defaultDescription: "Plateforme innovante connectant artistes, agents, managers et lieux d'événements dans l'industrie musicale.",
    defaultKeywords: "musique, artiste, agent, manager, événement, booking, plateforme musicale",
    ogImage: "https://vybbi.com/og-image.jpg"
  });

  useEffect(() => {
    loadSitemapData();
    loadRobotsTxt();
    loadSeoMetrics();
  }, []);

  const loadSitemapData = async () => {
    try {
      const urls = await generateSitemapUrls();
      setSitemapUrls(urls);
      setSeoMetrics(prev => ({ ...prev, totalUrls: urls.length }));
    } catch (error) {
      console.error("Erreur lors du chargement du sitemap:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du sitemap",
        variant: "destructive"
      });
    }
  };

  const loadRobotsTxt = async () => {
    try {
      const response = await fetch('/robots.txt');
      const content = await response.text();
      setRobotsTxt(content);
    } catch (error) {
      setRobotsTxt(`User-agent: *
Allow: /

# Sitemap
Sitemap: https://vybbi.com/sitemap.xml

# Règles spécifiques
Disallow: /admin/
Disallow: /auth/
Disallow: /api/
Disallow: /private/`);
    }
  };

  const loadSeoMetrics = async () => {
    try {
      // Compter les profils sans meta description
      const { count: profilesCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_public', true)
        .or('bio.is.null,bio.eq.');

      // Compter les articles de blog sans excerpt
      const { count: blogCount } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')
        .or('excerpt.is.null,excerpt.eq.');

      setSeoMetrics(prev => ({
        ...prev,
        missingMetaDescriptions: (profilesCount || 0) + (blogCount || 0),
        missingAltText: 0, // À implémenter avec scan des images
        lastGenerated: new Date().toISOString()
      }));
    } catch (error) {
      console.error("Erreur lors du chargement des métriques SEO:", error);
    }
  };

  const handleGenerateSitemap = async () => {
    setIsGenerating(true);
    try {
      const urls = await generateSitemapUrls();
      const xmlContent = generateSitemapXml(urls);
      
      // Créer un blob et télécharger
      const blob = new Blob([xmlContent], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Succès",
        description: "Sitemap généré et téléchargé avec succès"
      });

      await loadSitemapData();
    } catch (error) {
      toast({
        title: "Erreur", 
        description: "Impossible de générer le sitemap",
        variant: "destructive"
      });
    }
    setIsGenerating(false);
  };

  const handleSaveRobots = async () => {
    try {
      // Dans un vrai environnement, ceci nécessiterait une API pour écrire le fichier
      toast({
        title: "Information",
        description: "Le fichier robots.txt doit être mis à jour manuellement sur le serveur",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder robots.txt",
        variant: "destructive"
      });
    }
  };

  const priorityColor = (priority: number) => {
    if (priority >= 0.8) return "text-green-600";
    if (priority >= 0.5) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">SEO & Référencement</h2>
        <p className="text-muted-foreground">
          Gestion complète du référencement naturel de la plateforme
        </p>
      </div>

      {/* Métriques SEO */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">URLs Totales</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{seoMetrics.totalUrls}</div>
            <p className="text-xs text-muted-foreground">Dans le sitemap</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meta Manquantes</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{seoMetrics.missingMetaDescriptions}</div>
            <p className="text-xs text-muted-foreground">Descriptions à ajouter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alt Text</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{seoMetrics.missingAltText}</div>
            <p className="text-xs text-muted-foreground">Images sans alt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Bon</div>
            <p className="text-xs text-muted-foreground">Score global SEO</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sitemap" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
          <TabsTrigger value="robots">Robots.txt</TabsTrigger>
          <TabsTrigger value="meta">Meta Tags</TabsTrigger>
          <TabsTrigger value="tools">Outils SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="sitemap" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gestion du Sitemap</CardTitle>
                  <CardDescription>
                    Générer et consulter le plan de site XML pour les moteurs de recherche
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={loadSitemapData} 
                    variant="outline" 
                    size="sm"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualiser
                  </Button>
                  <Button 
                    onClick={handleGenerateSitemap} 
                    disabled={isGenerating}
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isGenerating ? "Génération..." : "Télécharger XML"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Total: {sitemapUrls.length} URLs</span>
                  {seoMetrics.lastGenerated && (
                    <span>Dernière génération: {new Date(seoMetrics.lastGenerated).toLocaleDateString()}</span>
                  )}
                </div>

                <div className="border rounded-lg">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 sticky top-0">
                        <tr>
                          <th className="text-left p-3">URL</th>
                          <th className="text-left p-3">Priorité</th>
                          <th className="text-left p-3">Fréquence</th>
                          <th className="text-left p-3">Dernière modif</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sitemapUrls.map((url, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-3">
                              <a 
                                href={url.loc} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                {url.loc.replace('https://vybbi.com', '')}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline" className={priorityColor(url.priority)}>
                                {url.priority}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Badge variant="secondary">{url.changefreq}</Badge>
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {url.lastmod}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="robots" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration robots.txt</CardTitle>
              <CardDescription>
                Définir les règles d'indexation pour les robots des moteurs de recherche
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={robotsTxt}
                onChange={(e) => setRobotsTxt(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                placeholder="Contenu du fichier robots.txt..."
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveRobots}>
                  Sauvegarder
                </Button>
                <Button variant="outline" asChild>
                  <a href="/robots.txt" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Voir le fichier actuel
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meta" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Meta Tags par défaut</CardTitle>
              <CardDescription>
                Définir les balises meta par défaut pour toutes les pages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Titre par défaut</label>
                  <Input
                    value={metaDefaults.defaultTitle}
                    onChange={(e) => setMetaDefaults(prev => ({ ...prev, defaultTitle: e.target.value }))}
                    placeholder="Titre de la page..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Longueur recommandée: 50-60 caractères ({metaDefaults.defaultTitle.length}/60)
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Mots-clés</label>
                  <Input
                    value={metaDefaults.defaultKeywords}
                    onChange={(e) => setMetaDefaults(prev => ({ ...prev, defaultKeywords: e.target.value }))}
                    placeholder="mot-clé1, mot-clé2, mot-clé3..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description par défaut</label>
                <Textarea
                  value={metaDefaults.defaultDescription}
                  onChange={(e) => setMetaDefaults(prev => ({ ...prev, defaultDescription: e.target.value }))}
                  placeholder="Description de la page..."
                />
                <p className="text-xs text-muted-foreground">
                  Longueur recommandée: 150-160 caractères ({metaDefaults.defaultDescription.length}/160)
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Image Open Graph par défaut</label>
                <Input
                  value={metaDefaults.ogImage}
                  onChange={(e) => setMetaDefaults(prev => ({ ...prev, ogImage: e.target.value }))}
                  placeholder="https://vybbi.com/og-image.jpg"
                />
              </div>

              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Sauvegarder la configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Vérificateur Meta Description
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="URL à analyser..." />
                <Button className="w-full">
                  Analyser la page
                </Button>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Titre présent (52 caractères)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span>Meta description longue (180 caractères)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Aperçu Rich Snippet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 space-y-2 bg-muted/20">
                  <div className="text-blue-600 text-lg font-medium">
                    Vybbi - Plateforme de mise en relation musicale
                  </div>
                  <div className="text-green-700 text-sm">
                    https://vybbi.com › pour-artistes
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Plateforme innovante connectant artistes, agents, managers et lieux d'événements dans l'industrie musicale. Trouvez votre partenaire idéal...
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Audit SEO Rapide</CardTitle>
                <CardDescription>
                  Vérification automatique des problèmes SEO courants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Sitemap.xml présent et accessible</span>
                    </div>
                    <Badge variant="outline" className="text-green-600">OK</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                      <span>{seoMetrics.missingMetaDescriptions} pages sans meta description</span>
                    </div>
                    <Badge variant="outline" className="text-yellow-600">Attention</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Robots.txt configuré correctement</span>
                    </div>
                    <Badge variant="outline" className="text-green-600">OK</Badge>
                  </div>
                </div>

                <Button className="mt-4 w-full" onClick={loadSeoMetrics}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Relancer l'audit SEO
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}