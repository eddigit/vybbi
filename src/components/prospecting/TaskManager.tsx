import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckSquare, 
  Clock, 
  Calendar, 
  Mail, 
  Phone, 
  MessageCircle, 
  AlertCircle,
  Filter,
  Eye,
  Play,
  SkipForward,
  User
} from 'lucide-react';

interface ProspectTask {
  id: string;
  prospect_id: string;
  workflow_id?: string;
  task_type: 'email' | 'call' | 'whatsapp' | 'reminder' | 'note';
  title: string;
  description?: string;
  scheduled_at: string;
  completed_at?: string;
  status: 'pending' | 'completed' | 'skipped' | 'failed';
  auto_created: boolean;
  template_data?: any;
  created_at: string;
  // Relations
  prospect?: {
    contact_name: string;
    company_name?: string;
    prospect_type: string;
    qualification_score: number;
  };
  workflow?: {
    name: string;
  };
}

interface TaskStats {
  pending: number;
  overdue: number;
  completedToday: number;
  totalTasks: number;
}

export default function TaskManager() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<ProspectTask[]>([]);
  const [stats, setStats] = useState<TaskStats>({
    pending: 0,
    overdue: 0,
    completedToday: 0,
    totalTasks: 0
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);

      // Charger les tâches avec les informations des prospects
      const { data: tasksData } = await supabase
        .from('prospect_tasks')
        .select(`
          *,
          prospect:prospects(contact_name, company_name, prospect_type, qualification_score),
          workflow:prospecting_workflows(name)
        `)
        .order('scheduled_at', { ascending: true });

      if (tasksData) {
        setTasks(tasksData as ProspectTask[]);
        
        // Calculer les statistiques
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const pending = tasksData.filter(t => t.status === 'pending').length;
        const overdue = tasksData.filter(t => 
          t.status === 'pending' && new Date(t.scheduled_at) < now
        ).length;
        const completedToday = tasksData.filter(t => 
          t.status === 'completed' && 
          t.completed_at && 
          new Date(t.completed_at) >= today && 
          new Date(t.completed_at) < tomorrow
        ).length;

        setStats({
          pending,
          overdue,
          completedToday,
          totalTasks: tasksData.length
        });
      }

    } catch (error) {
      console.error('Erreur chargement tâches:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les tâches",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('prospect_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Tâche marquée comme terminée"
      });

      loadTasks();
    } catch (error) {
      console.error('Erreur completion tâche:', error);
    }
  };

  const handleSkipTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('prospect_tasks')
        .update({ status: 'skipped' })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Tâche ignorée"
      });

      loadTasks();
    } catch (error) {
      console.error('Erreur skip tâche:', error);
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'call': return <Phone className="h-4 w-4" />;
      case 'whatsapp': return <MessageCircle className="h-4 w-4" />;
      case 'reminder': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string, scheduledAt: string) => {
    const isOverdue = new Date(scheduledAt) < new Date() && status === 'pending';
    
    if (isOverdue) {
      return <Badge variant="destructive">En retard</Badge>;
    }
    
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Terminée</Badge>;
      case 'skipped':
        return <Badge variant="outline">Ignorée</Badge>;
      case 'failed':
        return <Badge variant="destructive">Échouée</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTaskTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'email': 'Email',
      'call': 'Appel',
      'whatsapp': 'WhatsApp',
      'reminder': 'Rappel',
      'note': 'Note'
    };
    return labels[type] || type;
  };

  const getProspectTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'artist': 'Artiste',
      'venue': 'Lieu',
      'agent': 'Agent',
      'manager': 'Manager',
      'sponsors': 'Sponsor',
      'media': 'Média',
      'academie': 'École',
      'agence': 'Agence',
      'influenceur': 'Influenceur'
    };
    return labels[type] || type;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return `Aujourd'hui ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Demain ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const filteredTasks = tasks.filter(task => {
    let statusMatch = true;
    let typeMatch = true;

    if (activeTab !== 'all') {
      switch (activeTab) {
        case 'pending':
          statusMatch = task.status === 'pending';
          break;
        case 'overdue':
          statusMatch = task.status === 'pending' && new Date(task.scheduled_at) < new Date();
          break;
        case 'today':
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          statusMatch = new Date(task.scheduled_at) >= today && new Date(task.scheduled_at) < tomorrow;
          break;
        case 'completed':
          statusMatch = task.status === 'completed';
          break;
      }
    }

    if (statusFilter !== 'all') {
      statusMatch = statusMatch && task.status === statusFilter;
    }

    if (typeFilter !== 'all') {
      typeMatch = task.task_type === typeFilter;
    }

    return statusMatch && typeMatch;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement des tâches...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CheckSquare className="h-6 w-6" />
            Gestion des Tâches
          </h2>
          <p className="text-muted-foreground">
            Suivez et gérez toutes vos tâches de prospection automatiques
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Retard</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminées Aujourd'hui</CardTitle>
            <CheckSquare className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedToday}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tâches</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et Tabs */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="pending">En Attente ({stats.pending})</TabsTrigger>
                <TabsTrigger value="overdue">En Retard ({stats.overdue})</TabsTrigger>
                <TabsTrigger value="today">Aujourd'hui</TabsTrigger>
                <TabsTrigger value="completed">Terminées</TabsTrigger>
                <TabsTrigger value="all">Toutes</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type de tâche" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="call">Appel</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="reminder">Rappel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tâche</TableHead>
                <TableHead>Prospect</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Programmée</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{task.title}</div>
                      {task.description && (
                        <div className="text-sm text-muted-foreground">
                          {task.description}
                        </div>
                      )}
                      {task.auto_created && task.workflow && (
                        <div className="text-xs text-blue-600 mt-1">
                          📋 {task.workflow.name}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div>
                      <div className="font-medium">{task.prospect?.contact_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {task.prospect?.company_name} • {getProspectTypeLabel(task.prospect?.prospect_type || '')}
                      </div>
                      <div className="text-xs">
                        Score: {task.prospect?.qualification_score}/100
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTaskIcon(task.task_type)}
                      {getTaskTypeLabel(task.task_type)}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm">
                      {formatDateTime(task.scheduled_at)}
                    </div>
                  </TableCell>

                  <TableCell>
                    {getStatusBadge(task.status, task.scheduled_at)}
                  </TableCell>

                  <TableCell>
                    <div className="flex gap-1">
                      {task.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCompleteTask(task.id)}
                          >
                            <CheckSquare className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSkipTask(task.id)}
                          >
                            <SkipForward className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredTasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune tâche trouvée pour les critères sélectionnés</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}