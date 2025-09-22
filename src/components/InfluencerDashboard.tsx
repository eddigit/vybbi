import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { InfluencerLink, AffiliateConversion } from '@/lib/types';
import { Plus, ExternalLink, QrCode, Copy, TrendingUp, Users, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AffiliateQRGenerator } from './AffiliateQRGenerator';
import { AffiliateLinkDialog } from './AffiliateLinkDialog';

interface DashboardStats {
  totalLinks: number;
  totalClicks: number;
  totalConversions: number;
  totalCommissions: number;
  activeLinks: number;
}

export const InfluencerDashboard = () => {
  const { user } = useAuth();
  const [links, setLinks] = useState<InfluencerLink[]>([]);
  const [conversions, setConversions] = useState<AffiliateConversion[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalLinks: 0,
    totalClicks: 0,
    totalConversions: 0,
    totalCommissions: 0,
    activeLinks: 0
  });
  const [loading, setLoading] = useState(true);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [selectedLink, setSelectedLink] = useState<InfluencerLink | null>(null);

  useEffect(() => {
    if (user) {
      fetchInfluencerData();
    }
  }, [user]);

  const fetchInfluencerData = async () => {
    try {
      setLoading(true);
      
      // Get user profile to find influencer profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .eq('profile_type', 'influenceur')
        .maybeSingle();

      if (!profile) return;

      // Fetch links
      const { data: linksData, error: linksError } = await supabase
        .from('influencer_links')
        .select('*')
        .eq('influencer_profile_id', profile.id)
        .order('created_at', { ascending: false });

      if (linksError) throw linksError;
      setLinks(linksData || []);

      // Fetch conversions
      const { data: conversionsData, error: conversionsError } = await supabase
        .from('affiliate_conversions')
        .select(`
          *,
          influencer_links!inner(influencer_profile_id)
        `)
        .eq('influencer_links.influencer_profile_id', profile.id)
        .order('converted_at', { ascending: false });

      if (conversionsError) throw conversionsError;
      setConversions((conversionsData as AffiliateConversion[]) || []);

      // Calculate stats
      const totalClicks = linksData?.reduce((sum, link) => sum + link.clicks_count, 0) || 0;
      const totalConversions = linksData?.reduce((sum, link) => sum + link.conversions_count, 0) || 0;
      const totalCommissions = conversionsData?.reduce((sum, conv) => sum + (conv.commission_amount || 0), 0) || 0;
      const activeLinks = linksData?.filter(link => link.is_active).length || 0;

      setStats({
        totalLinks: linksData?.length || 0,
        totalClicks,
        totalConversions,
        totalCommissions,
        activeLinks
      });

    } catch (error) {
      console.error('Error fetching influencer data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAffiliateUrl = (code: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}?ref=${code}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copié !",
        description: "Le lien a été copié dans le presse-papiers"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive"
      });
    }
  };

  const toggleLinkStatus = async (link: InfluencerLink) => {
    try {
      const { error } = await supabase
        .from('influencer_links')
        .update({ is_active: !link.is_active })
        .eq('id', link.id);

      if (error) throw error;
      
      await fetchInfluencerData();
      toast({
        title: "Succès",
        description: `Lien ${link.is_active ? 'désactivé' : 'activé'}`
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du lien",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Chargement...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Influenceur</h1>
            <p className="text-muted-foreground">
              Gérez vos liens d'affiliation et suivez vos performances
            </p>
          </div>
          <Button onClick={() => setShowLinkDialog(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouveau lien
          </Button>
        </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Liens Actifs</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLinks}</div>
            <p className="text-xs text-muted-foreground">
              sur {stats.totalLinks} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clics Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClicks}</div>
            <p className="text-xs text-muted-foreground">
              visiteurs uniques
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalClicks > 0 ? `${((stats.totalConversions / stats.totalClicks) * 100).toFixed(1)}% taux` : '0% taux'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCommissions.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">
              gains totaux
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="links" className="space-y-4">
        <TabsList>
          <TabsTrigger value="links">Mes Liens</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
        </TabsList>

        <TabsContent value="links" className="space-y-4">
          <div className="grid gap-4">
            {links.map((link) => (
              <Card key={link.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{link.name || link.code}</h3>
                        <Badge variant={link.is_active ? "default" : "secondary"}>
                          {link.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{link.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>{link.clicks_count} clics</span>
                        <span>{link.conversions_count} conversions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-muted rounded text-xs">
                          {generateAffiliateUrl(link.code)}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(generateAffiliateUrl(link.code))}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedLink(link)}
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        onClick={() => toggleLinkStatus(link)}
                      >
                        {link.is_active ? 'Désactiver' : 'Activer'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="conversions" className="space-y-4">
          <div className="grid gap-4">
            {conversions.map((conversion) => (
              <Card key={conversion.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{conversion.conversion_type}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(conversion.converted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{conversion.commission_amount?.toFixed(2)}€</div>
                      <Badge variant={
                        conversion.conversion_status === 'confirmed' ? 'default' :
                        conversion.conversion_status === 'paid' ? 'secondary' :
                        'outline'
                      }>
                        {conversion.conversion_status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AffiliateLinkDialog
        open={showLinkDialog}
        onOpenChange={setShowLinkDialog}
        onLinkCreated={fetchInfluencerData}
      />

      <AffiliateQRGenerator
        link={selectedLink}
        open={selectedLink !== null}
        onOpenChange={(open) => !open && setSelectedLink(null)}
      />
    </div>
    </div>
  );
};