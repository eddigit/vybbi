import { useState } from 'react';
import { X, Ban, Archive, Pin, PinOff, ArchiveRestore, ExternalLink, Phone, Mail, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ConversationWithDetails } from '@/hooks/useConversations';

interface RightInfoPanelProps {
  conversation: ConversationWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onBlockUser: () => void;
  onPinConversation: () => void;
  onUnpinConversation: () => void;
  onArchiveConversation: () => void;
  onUnarchiveConversation: () => void;
}

export default function RightInfoPanel({
  conversation,
  isOpen,
  onClose,
  onBlockUser,
  onPinConversation,
  onUnpinConversation,
  onArchiveConversation,
  onUnarchiveConversation,
}: RightInfoPanelProps) {
  const [muteNotifications, setMuteNotifications] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);

  // Show default "Page Messages" style panel when no conversation is selected
  if (!conversation) {
    return (
      <div className="w-full h-full border-l bg-background flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <h3 className="font-medium text-center">Messageries de l'espace</h3>
        </div>

        {/* Content for no conversation selected */}
        <div className="flex-1 p-4">
          <div className="text-center py-8">
            <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h4 className="font-medium mb-2">Gérez vos conversations</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Restez connecté avec votre réseau professionnel. Sélectionnez une conversation pour voir les détails du contact.
            </p>
          </div>
          
          <Separator className="my-6" />
          
          {/* Quick Actions */}
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-muted-foreground">Actions rapides</h5>
            <Button variant="ghost" className="w-full justify-start text-sm">
              <Mail className="mr-2 h-4 w-4" />
              Nouveau message
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm">
              <Archive className="mr-2 h-4 w-4" />
              Messages archivés
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t mt-auto">
          <div className="text-xs text-muted-foreground">
            <p className="mb-2">
              Messagerie sécurisée et chiffrée pour vos échanges professionnels.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const displayName = conversation.peer_display_name || 'Utilisateur inconnu';
  const profileType = conversation.peer_profile_type;

  const getProfileTypeLabel = (type: string | null) => {
    switch (type) {
      case 'artist': return 'Artiste';
      case 'agent': return 'Agent';
      case 'manager': return 'Manager';
      case 'lieu': return 'Lieu & Événement';
      default: return 'Utilisateur';
    }
  };

  return (
    <div className="w-80 border-l bg-background flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-medium text-center">Informations du contact</h3>
      </div>

      {/* Contact Info */}
      <div className="p-4 text-center">
        <Avatar className="h-24 w-24 mx-auto mb-4">
          <AvatarImage src={conversation.peer_avatar_url || ''} alt={displayName} />
          <AvatarFallback className="text-xl">
            {displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <h2 className="text-lg font-semibold mb-1">{displayName}</h2>
        <p className="text-sm text-muted-foreground mb-3">
          {getProfileTypeLabel(profileType)}
        </p>

        <div className="flex gap-2 justify-center">
          <Button variant="outline" size="sm" className="p-2">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="p-2">
            <Mail className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="p-2">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Actions */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Notifications</span>
          <Switch
            checked={!muteNotifications}
            onCheckedChange={(checked) => setMuteNotifications(!checked)}
          />
        </div>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={conversation.is_pinned ? onUnpinConversation : onPinConversation}
        >
          {conversation.is_pinned ? (
            <>
              <PinOff className="mr-2 h-4 w-4" />
              Désépingler
            </>
          ) : (
            <>
              <Pin className="mr-2 h-4 w-4" />
              Épingler
            </>
          )}
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={conversation.is_archived ? onUnarchiveConversation : onArchiveConversation}
        >
          {conversation.is_archived ? (
            <>
              <ArchiveRestore className="mr-2 h-4 w-4" />
              Désarchiver
            </>
          ) : (
            <>
              <Archive className="mr-2 h-4 w-4" />
              Archiver
            </>
          )}
        </Button>

        <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
              <Ban className="mr-2 h-4 w-4" />
              Bloquer l'utilisateur
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bloquer cet utilisateur ?</AlertDialogTitle>
              <AlertDialogDescription>
                Vous ne pourrez plus recevoir de messages de {displayName} et ne pourrez plus lui en envoyer.
                Cette action peut être annulée plus tard.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  onBlockUser();
                  setShowBlockDialog(false);
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Bloquer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Separator />

      {/* Media placeholder */}
      <div className="p-4">
        <h4 className="text-sm font-medium mb-3">Médias partagés</h4>
        <div className="grid grid-cols-3 gap-2">
          {/* Placeholder for shared media */}
          <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Photo</span>
          </div>
          <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Photo</span>
          </div>
          <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Photo</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Legal info */}
      <div className="p-4 mt-auto">
        <div className="text-xs text-muted-foreground">
          <h4 className="font-medium mb-2">À propos de la messagerie</h4>
          <p className="mb-2">
            Cette messagerie conserve toutes les conversations de manière sécurisée et chiffrée.
          </p>
          <p>
            En cas de litige contractuel, ces conversations peuvent être utilisées comme preuves
            et consultées par les parties concernées et les autorités compétentes si nécessaire.
          </p>
        </div>
      </div>
    </div>
  );
}