import { useState } from 'react';
import { MessageCircle, Calendar, Phone, Mail, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Profile } from '@/lib/types';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ProfileCTAProps {
  artist: Profile;
  preferredContact?: Profile | null;
  className?: string;
}

export function ProfileCTA({ artist, preferredContact, className = '' }: ProfileCTAProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStartConversation = async () => {
    if (!user || !artist.user_id) return;

    setLoading(true);
    try {
      // If artist has preferred contact, start conversation with them instead
      const targetUserId = preferredContact?.user_id || artist.user_id;
      
      const { data, error } = await supabase.rpc('start_direct_conversation', {
        target_user_id: targetUserId
      });

      if (error) throw error;

      // Navigate to the conversation
      window.location.href = `/messages?conversation=${data}`;
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la conversation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const contactEmail = preferredContact?.email || artist.email;
  const contactPhone = preferredContact?.phone || artist.phone;
  const contactName = preferredContact?.display_name || artist.display_name;
  const isExclusiveContact = preferredContact && !artist.accepts_direct_contact;

  return (
    <Card className={`border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 ${className}`}>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          {/* Main CTA */}
          <div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Réserver {artist.display_name}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {isExclusiveContact 
                ? `Contact exclusif via ${contactName}` 
                : "Contactez directement pour vos événements"}
            </p>
          </div>

          {/* Contact Badges */}
          <div className="flex justify-center gap-2 flex-wrap">
            {artist.genres?.slice(0, 3).map((genre) => (
              <Badge key={genre} variant="secondary" className="text-xs">
                {genre}
              </Badge>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Primary CTA - Message */}
            {user ? (
              <Button 
                onClick={handleStartConversation}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {loading ? 'Connexion...' : `Contacter ${isExclusiveContact ? contactName : artist.display_name}`}
              </Button>
            ) : (
              <Button asChild className="w-full bg-primary hover:bg-primary/90" size="lg">
                <Link to="/auth">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Se connecter pour contacter
                </Link>
              </Button>
            )}

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-2">
              {contactEmail && (
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                >
                  <a href={`mailto:${contactEmail}`}>
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </a>
                </Button>
              )}
              
              {contactPhone && (
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                >
                  <a href={`tel:${contactPhone}`}>
                    <Phone className="h-4 w-4 mr-1" />
                    Appel
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Professional Info */}
          <div className="pt-4 border-t border-border/50">
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              {artist.experience && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  <span>{artist.experience}</span>
                </div>
              )}
              {artist.location && (
                <span>{artist.location}</span>
              )}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Profil vérifié Vybbi</span>
            </div>
            {isExclusiveContact && (
              <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Représentation professionnelle</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}