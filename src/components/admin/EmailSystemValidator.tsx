import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { EmailNotificationType } from "@/lib/emailService";

// Types d'emails requis dans l'application
const REQUIRED_EMAIL_TYPES: { type: EmailNotificationType; description: string; priority: 'high' | 'medium' | 'low' }[] = [
  { type: 'user_registration', description: 'Email de bienvenue après inscription', priority: 'high' },
  { type: 'admin_notification', description: 'Notification admin nouvelle inscription', priority: 'high' },
  { type: 'review_notification', description: 'Notification nouvel avis', priority: 'medium' },
  { type: 'contact_message', description: 'Messages de contact', priority: 'medium' },
  { type: 'booking_proposed', description: 'Demande de booking reçue', priority: 'high' },
  { type: 'booking_status_changed', description: 'Changement statut booking', priority: 'high' },
  { type: 'message_received', description: 'Nouveau message privé', priority: 'medium' },
  { type: 'prospect_follow_up', description: 'Suivi de prospection', priority: 'low' },
];

// Variables communes utilisées dans les templates
const COMMON_VARIABLES = [
  'userName', 'userEmail', 'profileType', 'dashboardUrl', 'unsubscribeUrl'
];

export default function EmailSystemValidator() {
  const { data: templates, isLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Validation du système email</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  const existingTypes = templates?.map(t => t.type) || [];
  const missingTypes = REQUIRED_EMAIL_TYPES.filter(req => !existingTypes.includes(req.type));
  const unusedTypes = existingTypes.filter(type => !REQUIRED_EMAIL_TYPES.some(req => req.type === type));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (missing: boolean) => {
    return missing ? (
      <XCircle className="w-4 h-4 text-destructive" />
    ) : (
      <CheckCircle className="w-4 h-4 text-success" />
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {missingTypes.length === 0 ? (
              <CheckCircle className="w-5 h-5 text-success" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-warning" />
            )}
            Validation du système email
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Vérification de la couverture des templates email requis
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{existingTypes.length}</div>
              <div className="text-sm text-muted-foreground">Templates actifs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{missingTypes.length}</div>
              <div className="text-sm text-muted-foreground">Templates manquants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{unusedTypes.length}</div>
              <div className="text-sm text-muted-foreground">Templates non utilisés</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status des templates requis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {REQUIRED_EMAIL_TYPES.map((req) => {
              const exists = existingTypes.includes(req.type);
              const template = templates?.find(t => t.type === req.type);
              
              return (
                <div key={req.type} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(!exists)}
                    <div>
                      <div className="font-medium">{req.type}</div>
                      <div className="text-sm text-muted-foreground">{req.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(req.priority)}>
                      {req.priority}
                    </Badge>
                    {template && (
                      <Badge variant="outline">
                        {Array.isArray(template.variables) ? template.variables.length : 0} variables
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {unusedTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Templates non utilisés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unusedTypes.map((type) => (
                <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="font-medium">{type}</div>
                  <Badge variant="outline">Non utilisé</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Variables communes recommandées</CardTitle>
          <p className="text-sm text-muted-foreground">
            Variables que tous les templates devraient inclure pour une expérience cohérente
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {COMMON_VARIABLES.map((variable) => (
              <Badge key={variable} variant="secondary">
                {`{{${variable}}}`}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}