import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Zap, 
  Calendar, 
  MessageSquare, 
  Mail,
  BarChart3,
  Upload,
  Download
} from 'lucide-react';
import { IntegrationsCenter } from '@/components/prospecting/IntegrationsCenter';
import { BookingScheduler } from '@/components/prospecting/BookingScheduler';
import { MultiChannelAutomation } from '@/components/prospecting/MultiChannelAutomation';
import { AutoReportGenerator } from '@/components/prospecting/AutoReportGenerator';

const AdminBusinessIntegrations: React.FC = () => {
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);

  // Mock prospect for demo
  const mockProspect = {
    id: 'demo-prospect',
    contact_name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    company_name: 'Example Corp',
    phone: '+33123456789'
  };

  const handleTestBooking = () => {
    setSelectedProspect(mockProspect);
    setShowBookingDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Intégrations Business</h1>
          <p className="text-muted-foreground">
            Configurez et gérez toutes vos intégrations CRM et automatisations.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Config
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Config
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-muted-foreground">Intégrations configurées</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">8</div>
                <div className="text-sm text-muted-foreground">Automatisations actives</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">94%</div>
                <div className="text-sm text-muted-foreground">Taux de livraison</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">1,247</div>
                <div className="text-sm text-muted-foreground">Messages envoyés</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="integrations">
            <Settings className="h-4 w-4 mr-2" />
            Centre d'Intégrations
          </TabsTrigger>
          <TabsTrigger value="automations">
            <Zap className="h-4 w-4 mr-2" />
            Automatisations
          </TabsTrigger>
          <TabsTrigger value="booking">
            <Calendar className="h-4 w-4 mr-2" />
            Planification
          </TabsTrigger>
          <TabsTrigger value="reports">
            <BarChart3 className="h-4 w-4 mr-2" />
            Rapports Auto
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-6">
          <IntegrationsCenter />
        </TabsContent>

        <TabsContent value="automations" className="space-y-6">
          <MultiChannelAutomation />
        </TabsContent>

        <TabsContent value="booking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Gestionnaire de Rendez-vous
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Planifiez automatiquement des rendez-vous avec vos prospects les plus qualifiés.
              </p>
              
              <div className="flex gap-2">
                <Button onClick={handleTestBooking}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Tester la Planification
                </Button>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configuration Calendly
                </Button>
              </div>

              {/* Demo Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-green-500" />
                      <Badge variant="secondary">WhatsApp</Badge>
                    </div>
                    <h4 className="font-medium">Confirmation automatique</h4>
                    <p className="text-sm text-muted-foreground">
                      Envoi automatique de confirmation par WhatsApp
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <Badge variant="secondary">Email</Badge>
                    </div>
                    <h4 className="font-medium">Rappels intelligents</h4>
                    <p className="text-sm text-muted-foreground">
                      Rappels 24h et 1h avant le rendez-vous
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      <Badge variant="secondary">Calendly</Badge>
                    </div>
                    <h4 className="font-medium">Sync calendriers</h4>
                    <p className="text-sm text-muted-foreground">
                      Synchronisation bidirectionnelle automatique
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <AutoReportGenerator />
        </TabsContent>
      </Tabs>

      {/* Booking Dialog */}
      <BookingScheduler
        isOpen={showBookingDialog}
        onClose={() => setShowBookingDialog(false)}
        selectedProspect={selectedProspect}
        onBookingScheduled={() => setShowBookingDialog(false)}
      />
    </div>
  );
};

export default AdminBusinessIntegrations;