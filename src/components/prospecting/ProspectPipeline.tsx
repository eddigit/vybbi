import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { useProspects } from '@/hooks/useProspects';
import { addHapticFeedback } from '@/utils/mobileHelpers';
import { 
  LayoutGrid, 
  BarChart3, 
  Users, 
  Plus,
  Filter,
  Download,
  Settings,
  Zap,
  Smartphone
} from 'lucide-react';
import ProspectKanbanBoard from './ProspectKanbanBoard';
import MobileKanbanView from './MobileKanbanView';
import CommercialDashboard from './CommercialDashboard';
import ProspectDialog from './ProspectDialog';
import ProspectingEmailSender from './ProspectingEmailSender';
import WhatsAppSender from './WhatsAppSender';
import TaskManager from './TaskManager';
import HotProspectsDetector from './HotProspectsDetector';
import OfflineSyncProvider from './OfflineSyncProvider';
import PullToRefresh from './PullToRefresh';
import MobileTouchOptimizer from './MobileTouchOptimizer';

// Import from centralized types
import { SupabaseProspect } from '@/hooks/useProspects';

interface Prospect extends SupabaseProspect {
  // Keep backward compatibility with old interface
}

export default function ProspectPipeline() {
  const isMobile = useIsMobile();
  const { prospects, loading, refetch } = useProspects();
  const [selectedView, setSelectedView] = useState('kanban');
  const [prospectDialogOpen, setProspectDialogOpen] = useState(false);
  const [selectedProspectId, setSelectedProspectId] = useState<string | undefined>();
  const [emailSenderOpen, setEmailSenderOpen] = useState(false);
  const [whatsappSenderOpen, setWhatsappSenderOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | undefined>();

  const handleProspectSelect = (prospect: Prospect) => {
    setSelectedProspectId(prospect.id);
    setProspectDialogOpen(true);
  };

  const handleEmailProspect = (prospect: Prospect) => {
    if (!prospect.email) return;
    
    setSelectedProspect(prospect);
    setEmailSenderOpen(true);
  };

  const handleWhatsAppProspect = (prospect: Prospect) => {
    if (!prospect.whatsapp_number && !prospect.phone) return;
    
    setSelectedProspect(prospect as any);
    setWhatsappSenderOpen(true);
  };

  const handleProspectUpdated = () => {
    refetch();
  };

  const handleRefresh = async () => {
    addHapticFeedback('light');
    await refetch();
  };

  const handleArchiveProspect = (prospect: Prospect) => {
    // Archive prospect logic
    addHapticFeedback('medium');
    console.log('Archiving prospect:', prospect.id);
  };

  const handleRejectProspect = (prospect: Prospect) => {
    // Reject prospect logic  
    addHapticFeedback('heavy');
    console.log('Rejecting prospect:', prospect.id);
  };

  return (
    <OfflineSyncProvider>
      <MobileTouchOptimizer>
        <PullToRefresh onRefresh={handleRefresh} disabled={loading}>
          <div className="container mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">CRM Vybbi - Pipeline Commercial</h1>
          <p className="text-muted-foreground">
            Gestion visuelle et intelligente de la prospection
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => {
              setSelectedProspectId(undefined);
              setProspectDialogOpen(true);
            }}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Prospect
          </Button>
          
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtres
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Stats Bar - Mobile Optimized */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold text-primary">142</div>
              <div className="text-xs md:text-sm text-muted-foreground">Prospects Actifs</div>
            </div>
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold text-green-600">€47.2K</div>
              <div className="text-xs md:text-sm text-muted-foreground">Pipeline Valeur</div>
            </div>
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold text-orange-600">23</div>
              <div className="text-xs md:text-sm text-muted-foreground">Conversions</div>
            </div>
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold text-blue-600">68%</div>
              <div className="text-xs md:text-sm text-muted-foreground">Taux Succès</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={selectedView} onValueChange={setSelectedView}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
          <TabsTrigger 
            value="kanban" 
            className="flex items-center justify-center gap-2 p-2 md:p-3"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Pipeline</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="dashboard" 
            className="flex items-center justify-center gap-2 p-2 md:p-3"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="tasks" 
            className="flex items-center justify-center gap-2 p-2 md:p-3"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Tâches</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="hot" 
            className="flex items-center justify-center gap-2 p-2 md:p-3"
          >
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Prospects 🔥</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="settings" 
            className="flex items-center justify-center gap-2 p-2 md:p-3"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Config</span>
          </TabsTrigger>
        </TabsList>

        {/* Kanban Pipeline View */}
        <TabsContent value="kanban" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isMobile ? <Smartphone className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
                  Pipeline Visuel {isMobile && '(Mobile)'}
                </div>
                <Badge variant="outline" className="hidden md:inline-flex">
                  {isMobile ? 'Swipe Gestures' : 'Drag & Drop'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 md:p-6">
              {isMobile ? (
                <MobileKanbanView
                  prospects={prospects}
                  onProspectSelect={handleProspectSelect}
                  onEmailProspect={handleEmailProspect}
                  onWhatsAppProspect={handleWhatsAppProspect}
                  onArchiveProspect={handleArchiveProspect}
                  onRejectProspect={handleRejectProspect}
                />
              ) : (
                <ProspectKanbanBoard
                  onProspectSelect={handleProspectSelect}
                  onEmailProspect={handleEmailProspect}
                  onWhatsAppProspect={handleWhatsAppProspect}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commercial Dashboard */}
        <TabsContent value="dashboard" className="space-y-4">
          <CommercialDashboard />
        </TabsContent>

        {/* Task Management */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestion des Tâches & Follow-ups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TaskManager />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hot Prospects */}
        <TabsContent value="hot" className="space-y-4">
          <HotProspectsDetector />
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration CRM
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Automatisation</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Auto-assignment prospects</span>
                      <Badge variant="secondary">Activé</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Notifications push</span>
                      <Badge variant="secondary">Activé</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Relances automatiques</span>
                      <Badge variant="outline">Configuré</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Intégrations</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Email (Brevo)</span>
                      <Badge variant="secondary">Connecté</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">WhatsApp Business</span>
                      <Badge variant="secondary">Connecté</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Calendly</span>
                      <Badge variant="outline">À configurer</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {prospectDialogOpen && (
        <ProspectDialog
          open={prospectDialogOpen}
          onOpenChange={setProspectDialogOpen}
          prospectId={selectedProspectId}
          onProspectUpdated={handleProspectUpdated}
        />
      )}

      {emailSenderOpen && selectedProspect && (
        <ProspectingEmailSender
          isOpen={emailSenderOpen}
          onClose={() => setEmailSenderOpen(false)}
          selectedProspect={selectedProspect}
          onEmailSent={handleProspectUpdated}
        />
      )}

      {whatsappSenderOpen && selectedProspect && (
        <WhatsAppSender
          isOpen={whatsappSenderOpen}
          onClose={() => setWhatsappSenderOpen(false)}
          selectedProspect={selectedProspect}
          onMessageSent={handleProspectUpdated}
        />
      )}
          </div>
        </PullToRefresh>
      </MobileTouchOptimizer>
    </OfflineSyncProvider>
  );
}