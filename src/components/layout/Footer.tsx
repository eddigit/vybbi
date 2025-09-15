import { Button } from "@/components/ui/button";
import { VYBBI_SOCIAL_LINKS } from "@/lib/socialLinks";
import { Instagram, Music, Headphones, Youtube, Linkedin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const version = "v1.2.0"; // Update this version number for important changes

  const socialIcons = {
    instagram: Instagram,
    spotify: Music,
    soundcloud: Headphones,
    youtube: Youtube,
    linkedin: Linkedin,
  };

  return (
    <footer className="bg-card/95 backdrop-blur-sm border-t border-border">
      <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
        {/* Mobile-first layout */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <span className="text-xs text-muted-foreground">© {currentYear} Vybbi</span>
          <div className="flex items-center gap-2 sm:gap-3">
            {Object.entries(socialIcons).map(([platform, Icon]) => (
              <Button
                key={platform}
                variant="ghost"
                size="sm"
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors touch-target"
                asChild
              >
                <a
                  href={VYBBI_SOCIAL_LINKS[platform as keyof typeof VYBBI_SOCIAL_LINKS]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Vybbi sur ${platform}`}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </a>
              </Button>
            ))}
          </div>
        </div>
        
        {/* Version and credits */}
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 text-xs text-muted-foreground">
          <span className="sm:hidden">{version}</span>
          <span className="hidden sm:inline">{version}</span>
          <span className="hidden lg:inline">Créé par Gilles Korzec</span>
        </div>
      </div>
    </footer>
  );
}