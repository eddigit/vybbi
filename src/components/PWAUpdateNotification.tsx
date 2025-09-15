import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Download, Clock, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PWAUpdateNotificationProps {
  needRefresh: boolean;
  updateSW: () => void;
  onDismiss: () => void;
}

export function PWAUpdateNotification({ needRefresh, updateSW, onDismiss }: PWAUpdateNotificationProps) {
  const [show, setShow] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (needRefresh) {
      setShow(true);
      // Also show a toast for immediate notification
      toast({
        title: "🚀 Mise à jour disponible",
        description: "Une nouvelle version de Vybbi est prête à être installée",
        duration: 5000,
      });
    }
  }, [needRefresh, toast]);

  const handleUpdate = () => {
    setShow(false);
    updateSW();
  };

  const handleDismiss = () => {
    setShow(false);
    onDismiss();
    // Show reminder after 30 minutes
    setTimeout(() => {
      if (needRefresh) {
        toast({
          title: "📱 Rappel de mise à jour",
          description: "N'oubliez pas de mettre à jour Vybbi pour profiter des dernières améliorations",
          duration: 8000,
        });
      }
    }, 30 * 60 * 1000); // 30 minutes
  };

  if (!show || !needRefresh) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-auto shadow-2xl border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Nouvelle version disponible</CardTitle>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <Download className="w-3 h-3 mr-1" />
              Prête
            </Badge>
          </div>
          <CardDescription>
            Une version améliorée de Vybbi est disponible avec de nouvelles fonctionnalités et corrections.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Clock className="w-4 h-4" />
              Installation rapide (quelques secondes)
            </div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Améliorations de performance</li>
              <li>• Corrections de bugs</li>
              <li>• Nouvelles fonctionnalités</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleUpdate}
              className="flex-1 bg-gradient-primary hover:opacity-90"
            >
              <Download className="w-4 h-4 mr-2" />
              Mettre à jour maintenant
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDismiss}
              className="px-3"
            >
              <Clock className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            L'application se relancera automatiquement après la mise à jour
          </p>
        </CardContent>
      </Card>
    </div>
  );
}