import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProspectDialog from '@/components/prospecting/ProspectDialog';
import ProspectingEmailSender from '@/components/prospecting/ProspectingEmailSender';
import { 
  Users, 
  TrendingUp, 
  Phone, 
  Mail, 
  Calendar,
  Euro,
  Filter,
  Plus,
  Eye,
  Edit,
  Target
} from 'lucide-react';

interface ProspectingStats {
  totalProspects: number;
  contactedToday: number;
  conversionsThisMonth: number;
  totalCommissions: number;
  activeAgents: number;
}

interface Prospect {
  id: string;
  prospect_type: 'artist' | 'venue' | 'agent' | 'manager';
  company_name?: string;
  contact_name: string;
  email?: string;
  phone?: string;
  status: 'new' | 'contacted' | 'qualified' | 'interested' | 'converted' | 'rejected' | 'unresponsive';
  qualification_score: number;
  assigned_agent_id?: string;
  last_contact_at?: string;
  next_follow_up_at?: string;
  created_at: string;
}

interface VybbiAgent {
  id: string;
  agent_name: string;
  email: string;
  total_prospects_assigned: number;
  total_converted: number;
  total_commissions: number;
  is_active: boolean;
}

export default function AdminProspecting() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<ProspectingStats>({
    totalProspects: 0,
    contactedToday: 0,
    conversionsThisMonth: 0,
    totalCommissions: 0,
    activeAgents: 0
  });
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [agents, setAgents] = useState<VybbiAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [prospectDialogOpen, setProspectDialogOpen] = useState(false);
  const [selectedProspectId, setSelectedProspectId] = useState<string | undefined>();
  const [emailSenderOpen, setEmailSenderOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<{
    id: string;
    contact_name: string;
    email: string;
    company_name?: string;
    prospect_type: string;
    status: string;
  } | undefined>();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load prospects
      const { data: prospectsData } = await supabase
        .from('prospects')
        .select('*')
        .order('created_at', { ascending: false });

      // Load agents
      const { data: agentsData } = await supabase
        .from('vybbi_agents')
        .select('*')
        .eq('is_active', true);

      // Calculate stats
      const totalProspects = prospectsData?.length || 0;
      const contactedToday = prospectsData?.filter(p => 
        p.last_contact_at && new Date(p.last_contact_at).toDateString() === new Date().toDateString()
      ).length || 0;

      const conversionsThisMonth = prospectsData?.filter(p => 
        p.status === 'converted' && 
        p.converted_at && 
        new Date(p.converted_at).getMonth() === new Date().getMonth()
      ).length || 0;

      const totalCommissions = agentsData?.reduce((sum, agent) => sum + Number(agent.total_commissions || 0), 0) || 0;

      setStats({
        totalProspects,
        contactedToday,
        conversionsThisMonth,
        totalCommissions,
        activeAgents: agentsData?.length || 0
      });

      setProspects(prospectsData || []);
      setAgents(agentsData || []);

    } catch (error) {
      console.error('Error loading prospecting data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de prospection",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'new': 'bg-blue-500',
      'contacted': 'bg-yellow-500',
      'qualified': 'bg-orange-500',
      'interested': 'bg-green-500',
      'converted': 'bg-emerald-600',
      'rejected': 'bg-red-500',
      'unresponsive': 'bg-gray-500'
    };

    const statusLabels = {
      'new': 'Nouveau',
      'contacted': 'Contacté',
      'qualified': 'Qualifié',
      'interested': 'Intéressé',
      'converted': 'Converti',
      'rejected': 'Rejeté',
      'unresponsive': 'Sans réponse'
    };

    return (
      <Badge className={`${statusStyles[status as keyof typeof statusStyles]} text-white`}>
        {statusLabels[status as keyof typeof statusLabels]}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeStyles = {
      'artist': 'bg-purple-500',
      'venue': 'bg-indigo-500',
      'agent': 'bg-cyan-500',
      'manager': 'bg-teal-500'
    };

    const typeLabels = {
      'artist': 'Artiste',
      'venue': 'Lieu',
      'agent': 'Agent',
      'manager': 'Manager'
    };

    return (
      <Badge className={`${typeStyles[type as keyof typeof typeStyles]} text-white`}>
        {typeLabels[type as keyof typeof typeLabels]}
      </Badge>
    );
  };

  const filteredProspects = prospects.filter(prospect => {
    const statusMatch = statusFilter === 'all' || prospect.status === statusFilter;
    const typeMatch = typeFilter === 'all' || prospect.prospect_type === typeFilter;
    return statusMatch && typeMatch;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-96">Chargement...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Système de Prospection Vybbi</h1>
          <p className="text-muted-foreground">Gestion complète de la prospection commerciale</p>
        </div>
        <Button onClick={() => {
          setSelectedProspectId(undefined);
          setProspectDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Prospect
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prospects</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProspects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contactés Aujourd'hui</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contactedToday}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions ce Mois</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionsThisMonth}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions Totales</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCommissions.toFixed(2)}€</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agents Actifs</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAgents}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="prospects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="prospects">Prospects</TabsTrigger>
          <TabsTrigger value="agents">Agents Vybbi</TabsTrigger>
          <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="prospects" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="new">Nouveau</SelectItem>
                <SelectItem value="contacted">Contacté</SelectItem>
                <SelectItem value="qualified">Qualifié</SelectItem>
                <SelectItem value="interested">Intéressé</SelectItem>
                <SelectItem value="converted">Converti</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
                <SelectItem value="unresponsive">Sans réponse</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="artist">Artiste</SelectItem>
                <SelectItem value="venue">Lieu</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Prospects Table */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des Prospects ({filteredProspects.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Agent Assigné</TableHead>
                    <TableHead>Dernier Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProspects.map((prospect) => (
                    <TableRow key={prospect.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{prospect.contact_name}</div>
                          <div className="text-sm text-muted-foreground">{prospect.company_name}</div>
                          <div className="text-sm text-muted-foreground">{prospect.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(prospect.prospect_type)}</TableCell>
                      <TableCell>{getStatusBadge(prospect.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            prospect.qualification_score >= 80 ? 'bg-green-500' :
                            prospect.qualification_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          {prospect.qualification_score}/100
                        </div>
                      </TableCell>
                      <TableCell>
                        {prospect.assigned_agent_id ? 
                          agents.find(a => a.id === prospect.assigned_agent_id)?.agent_name || 'Agent assigné'
                          : 'Non assigné'
                        }
                      </TableCell>
                      <TableCell>
                        {prospect.last_contact_at ? 
                          new Date(prospect.last_contact_at).toLocaleDateString('fr-FR')
                          : 'Jamais contacté'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedProspectId(prospect.id);
                              setProspectDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedProspectId(prospect.id);
                              setProspectDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const prospectForEmail = {
                                id: prospect.id,
                                contact_name: prospect.contact_name,
                                email: prospect.email || '',
                                company_name: prospect.company_name,
                                prospect_type: prospect.prospect_type,
                                status: prospect.status
                              };
                              setSelectedProspect(prospectForEmail);
                              setEmailSenderOpen(true);
                            }}
                            disabled={!prospect.email}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agents Vybbi ({agents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Prospects Assignés</TableHead>
                    <TableHead>Conversions</TableHead>
                    <TableHead>Commissions</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell className="font-medium">{agent.agent_name}</TableCell>
                      <TableCell>{agent.email}</TableCell>
                      <TableCell>{agent.total_prospects_assigned}</TableCell>
                      <TableCell>{agent.total_converted}</TableCell>
                      <TableCell>{Number(agent.total_commissions).toFixed(2)}€</TableCell>
                      <TableCell>
                        <Badge className={agent.is_active ? 'bg-green-500' : 'bg-red-500'}>
                          {agent.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Campagnes de Prospection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Fonctionnalité en développement - Gestion des campagnes email et de prospection de masse</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Rapports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Fonctionnalité en développement - Tableaux de bord analytics détaillés</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ProspectDialog
        open={prospectDialogOpen}
        onOpenChange={setProspectDialogOpen}
        prospectId={selectedProspectId}
        onProspectUpdated={loadData}
      />

      <ProspectingEmailSender
        isOpen={emailSenderOpen}
        onClose={() => setEmailSenderOpen(false)}
        selectedProspect={selectedProspect}
        onEmailSent={loadData}
      />
    </div>
  );
}