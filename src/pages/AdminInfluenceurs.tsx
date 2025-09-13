import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Link, TrendingUp, DollarSign, Eye } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { Profile, InfluencerLink, AffiliateConversion } from "@/lib/types";

interface InfluencerStats extends Profile {
  totalLinks: number;
  totalClicks: number;
  totalConversions: number;
  totalCommissions: number;
  slug?: string;
}

export default function AdminInfluenceurs() {
  const { hasRole } = useAuth();
  const [influencers, setInfluencers] = useState<InfluencerStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hasRole('admin')) {
      fetchInfluencers();
    }
  }, [hasRole]);

  const fetchInfluencers = async () => {
    try {
      // Fetch all influencer profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('profile_type', 'influenceur')
        .eq('is_public', true);

      if (profilesError) throw profilesError;

        // For each influencer, get their stats
        const influencerStats = await Promise.all(
          (profiles || []).map(async (profile) => {
            // Get links count and total clicks
            const { data: links, error: linksError } = await supabase
              .from('influencer_links')
              .select('id, clicks_count, conversions_count')
              .eq('influencer_profile_id', profile.id);

            if (linksError) throw linksError;

            // Get link IDs first
            const linkIds = links?.map(l => l.id) || [];
            
            // Get conversions and commissions
            const { data: conversions, error: conversionsError } = await supabase
              .from('affiliate_conversions')
              .select('commission_amount')
              .in('link_id', linkIds);

            if (conversionsError) throw conversionsError;

            const totalLinks = links?.length || 0;
            const totalClicks = links?.reduce((sum, link) => sum + (link.clicks_count || 0), 0) || 0;
            const totalConversions = links?.reduce((sum, link) => sum + (link.conversions_count || 0), 0) || 0;
            const totalCommissions = conversions?.reduce((sum, conv) => sum + (conv.commission_amount || 0), 0) || 0;

            return {
              ...profile,
              totalLinks,
              totalClicks,
              totalConversions,
              totalCommissions
            };
          })
        );

      setInfluencers(influencerStats);
    } catch (error) {
      console.error('Error fetching influencers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!hasRole('admin')) {
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const totalStats = influencers.reduce(
    (acc, inf) => ({
      links: acc.links + inf.totalLinks,
      clicks: acc.clicks + inf.totalClicks,
      conversions: acc.conversions + inf.totalConversions,
      commissions: acc.commissions + inf.totalCommissions
    }),
    { links: 0, clicks: 0, conversions: 0, commissions: 0 }
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Influenceurs</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble et gestion des partenaires influenceurs
          </p>
        </div>
        <Badge variant="secondary">
          {influencers.length} influenceurs actifs
        </Badge>
      </div>

      {/* Stats globales */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Liens Actifs</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.links}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clics Totaux</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.clicks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.conversions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.commissions.toFixed(2)}€</div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des influenceurs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Influenceurs Actifs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Influenceur</TableHead>
                <TableHead>Liens</TableHead>
                <TableHead>Clics</TableHead>
                <TableHead>Conversions</TableHead>
                <TableHead>Commissions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {influencers.map((influencer) => (
                <TableRow key={influencer.id}>
                  <TableCell className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={influencer.avatar_url || ''} />
                      <AvatarFallback>
                        {influencer.display_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{influencer.display_name}</div>
                      <div className="text-sm text-muted-foreground">{influencer.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{influencer.totalLinks}</TableCell>
                  <TableCell>{influencer.totalClicks}</TableCell>
                  <TableCell>{influencer.totalConversions}</TableCell>
                  <TableCell>{influencer.totalCommissions.toFixed(2)}€</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <RouterLink to={`/influenceurs/${influencer.slug || influencer.id}`}>
                        Voir Profil
                      </RouterLink>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}