import { Mail, CheckCircle2, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EmailConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export function EmailConfirmationDialog({ isOpen, onClose, email }: EmailConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Vérifiez votre boîte email
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Nous venons d'envoyer un email de confirmation à
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="font-semibold text-foreground break-all">{email}</p>
          </div>

          <Alert className="bg-primary/5 border-primary/20">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              <strong>Important :</strong> Cliquez sur le lien dans l'email pour activer votre compte Vybbi.
            </AlertDescription>
          </Alert>

          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <span className="text-primary font-bold mt-0.5">1.</span>
              <span>Ouvrez votre boîte de réception email</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-primary font-bold mt-0.5">2.</span>
              <span>Cherchez l'email de <strong className="text-foreground">Vybbi</strong></span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-primary font-bold mt-0.5">3.</span>
              <span>Cliquez sur le lien de confirmation</span>
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground">
            <p className="flex items-center gap-2">
              💡 <span><strong>Astuce :</strong> Si vous ne voyez pas l'email, vérifiez vos dossiers <strong>Spam</strong> ou <strong>Promotions</strong></span>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={onClose} 
            className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
            size="lg"
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            J'ai compris, je vais vérifier mes emails
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="w-full text-xs"
          >
            Fermer et revenir à la connexion
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
