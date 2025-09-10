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
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ok':
        return <Badge className="bg-green-100 text-green-800">Optimal</Badge>;
      case 'warning':
        return <Badge className="bg-orange-100 text-orange-800">Attention</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Critique</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Inconnu</Badge>;
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
                ? 'border-green-200 bg-green-50' 
                : item.status === 'warning'
                ? 'border-orange-200 bg-orange-50'
                : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className={`h-5 w-5 ${
                item.status === 'ok' 
                  ? 'text-green-600' 
                  : item.status === 'warning'
                  ? 'text-orange-600'
                  : 'text-red-600'
              }`} />
              <div>
                <h4 className={`font-medium ${
                  item.status === 'ok' 
                    ? 'text-green-800' 
                    : item.status === 'warning'
                    ? 'text-orange-800'
                    : 'text-red-800'
                }`}>
                  {item.title}
                </h4>
                <p className={`text-sm ${
                  item.status === 'ok' 
                    ? 'text-green-600' 
                    : item.status === 'warning'
                    ? 'text-orange-600'
                    : 'text-red-600'
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