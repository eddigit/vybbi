import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Share2, 
  Copy, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Mail,
  MessageCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileShareButtonProps {
  profileUrl: string;
  profileName: string;
  profileType: string;
  className?: string;
}

export const ProfileShareButton: React.FC<ProfileShareButtonProps> = ({
  profileUrl,
  profileName,
  profileType,
  className = ""
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const shareText = `Découvrez le profil de ${profileName}, ${profileType} sur Vybbi`;
  const fullUrl = `${window.location.origin}${profileUrl}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast({
        title: "Lien copié !",
        description: "Le lien du profil a été copié dans le presse-papiers",
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareToSocial = (platform: string) => {
    const encodedUrl = encodeURIComponent(fullUrl);
    const encodedText = encodeURIComponent(shareText);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodedText}&body=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText} ${encodedUrl}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      setIsOpen(false);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={`transition-all duration-200 hover:scale-105 ${className}`}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Partager
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 animate-fade-in"
      >
        <DropdownMenuItem 
          onClick={copyToClipboard}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copier le lien
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => shareToSocial('facebook')}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
        >
          <Facebook className="h-4 w-4 mr-2" />
          Facebook
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => shareToSocial('twitter')}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
        >
          <Twitter className="h-4 w-4 mr-2" />
          Twitter
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => shareToSocial('linkedin')}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
        >
          <Linkedin className="h-4 w-4 mr-2" />
          LinkedIn
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => shareToSocial('whatsapp')}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          WhatsApp
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => shareToSocial('email')}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
        >
          <Mail className="h-4 w-4 mr-2" />
          Email
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};