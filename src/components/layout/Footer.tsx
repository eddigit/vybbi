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
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border">
      <div className="px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>© {currentYear} Vybbi</span>
          <div className="hidden sm:flex items-center gap-2">
            {Object.entries(socialIcons).map(([platform, Icon]) => (
              <Button
                key={platform}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                asChild
              >
                <a
                  href={VYBBI_SOCIAL_LINKS[platform as keyof typeof VYBBI_SOCIAL_LINKS]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Vybbi sur ${platform}`}
                >
                  <Icon className="h-3 w-3" />
                </a>
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span>{version}</span>
          <span className="hidden sm:inline">Créé par Gilles Korzec</span>
        </div>
      </div>
    </footer>
  );
}