import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Shield, Zap, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface SystemHealthProps {
  health: {
    database: 'ok' | 'warning' | 'error';
    security: 'ok' | 'warning' | 'error';
    performance: 'ok' | 'warning' | 'error';
  };
}

export function SystemHealthCard({ health }: SystemHealthProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ok':
        return <Badge variant="secondary" className="bg-success/10 text-success border-success/20">Optimal</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">Attention</Badge>;
      case 'error':
        return <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">Critique</Badge>;
      default:
        return <Badge variant="secondary" className="bg-muted text-muted-foreground">Inconnu</Badge>;
    }
  };

  const systemItems = [
    {
      title: "Base de données",
      status: health.database,
      icon: Database,
      description: health.database === 'ok' 
        ? "Toutes les connexions sont fonctionnelles" 
        : "Performances à surveiller"
    },
    {
      title: "Sécurité",
      status: health.security,
      icon: Shield,
      description: health.security === 'warning'
        ? "2 alertes de sécurité à traiter"
        : "Tous les contrôles de sécurité sont passés"
    },
    {
      title: "Performance",
      status: health.performance,
      icon: Zap,
      description: health.performance === 'warning'
        ? "Optimisations recommandées"
        : "Temps de réponse optimal"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          État du Système
        </CardTitle>
        <CardDescription>
          Surveillance en temps réel de la santé de la plateforme
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {systemItems.map((item) => (
          <div 
            key={item.title}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              item.status === 'ok' 
                ? 'border-success/20 bg-success/5' 
                : item.status === 'warning'
                ? 'border-warning/20 bg-warning/5'
                : 'border-destructive/20 bg-destructive/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className={`h-5 w-5 ${
                item.status === 'ok' 
                  ? 'text-success' 
                  : item.status === 'warning'
                  ? 'text-warning'
                  : 'text-destructive'
              }`} />
              <div>
                <h4 className={`font-medium ${
                  item.status === 'ok' 
                    ? 'text-success' 
                    : item.status === 'warning'
                    ? 'text-warning'
                    : 'text-destructive'
                }`}>
                  {item.title}
                </h4>
                <p className={`text-sm ${
                  item.status === 'ok' 
                    ? 'text-success/80' 
                    : item.status === 'warning'
                    ? 'text-warning/80'
                    : 'text-destructive/80'
                }`}>
                  {item.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(item.status)}
              {getStatusBadge(item.status)}
            </div>
          </div>
        ))}
        
        <div className="pt-3 border-t">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              Diagnostiquer
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              Optimiser
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}