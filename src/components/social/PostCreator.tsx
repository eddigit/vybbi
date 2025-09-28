import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSocialActions } from "@/hooks/useSocialActions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageIcon, Music, Video, Calendar, Loader2, Handshake } from "lucide-react";
import { toast } from "sonner";
import { ServiceRequestDialog } from "./ServiceRequestDialog";
import { CreateServiceRequestData } from "@/types/social";

export function PostCreator() {
  const { user, profile } = useAuth();
  const { createPost, createServiceRequest } = useSocialActions();
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<"text" | "image" | "video" | "music" | "event">("text");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await createPost({
        content: content.trim(),
        post_type: postType,
        visibility: "public"
      });
      setContent("");
      setPostType("text");
      toast.success("Publication créée avec succès!");
    } catch (error) {
      console.error("Error creating post:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      if (errorMessage.includes("violates row-level security")) {
        toast.error("Vous n'avez pas les permissions pour créer cette publication");
      } else if (errorMessage.includes("not authenticated")) {
        toast.error("Vous devez être connecté pour publier");
      } else {
        toast.error(`Erreur lors de la création: ${errorMessage}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleServiceRequest = async (serviceData: CreateServiceRequestData) => {
    setIsSubmitting(true);
    try {
      await createServiceRequest(serviceData);
      toast.success("Prestation créée avec succès!");
    } catch (error) {
      console.error("Error creating service request:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      toast.error(`Erreur lors de la création: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPlaceholder = () => {
    switch (postType) {
      case "music":
        return "Partagez votre nouvelle création musicale...";
      case "event":
        return "Annoncez votre prochain événement...";
      case "image":
      case "video":
        return "Partagez vos moments...";
      default:
        return "Quoi de neuf dans l'industrie nocturne ?";
    }
  };

  if (!user || !profile) return null;

  return (
    <Card className="mobile-card bg-card/95 backdrop-blur-sm border-border/30 shadow-sm">
      <CardContent className="p-3 sm:p-4">
        <form onSubmit={handleSubmit}>
          {/* Mobile-first compact design */}
          <div className="space-y-3">
            {/* Top row: Avatar + Textarea */}
            <div className="flex items-start space-x-3">
              <Avatar className="w-10 h-10 ring-2 ring-primary/20 flex-shrink-0">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {profile.display_name?.charAt(0) || user.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={getPlaceholder()}
                className="flex-1 min-h-[60px] sm:min-h-[80px] resize-none border-0 p-3 bg-muted/20 rounded-xl focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-muted-foreground/60 transition-all"
                maxLength={1000}
              />
            </div>

            {/* Bottom row: Action buttons - Mobile optimized horizontal scroll */}
            <div className="flex items-center justify-between gap-3">
              {/* Post type buttons - Horizontal scroll on mobile */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide min-w-0 flex-1">
                <Button
                  type="button"
                  variant={postType === "text" ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setPostType("text")}
                  className="rounded-full transition-all hover:scale-105 text-xs px-3 flex-shrink-0"
                >
                  📝
                  <span className="ml-1 hidden sm:inline">Texte</span>
                </Button>
                
                <Button
                  type="button"
                  variant={postType === "image" ? "default" : "secondary"}
                  size="sm"
                  onClick={() => {
                    setPostType("image");
                    handleFileSelect();
                  }}
                  className="rounded-full transition-all hover:scale-105 text-xs px-3 flex-shrink-0"
                >
                  <ImageIcon className="w-3 h-3" />
                  <span className="ml-1 hidden sm:inline">Photo</span>
                </Button>
                
                <Button
                  type="button"
                  variant={postType === "video" ? "default" : "secondary"}
                  size="sm"
                  onClick={() => {
                    setPostType("video");
                    handleFileSelect();
                  }}
                  className="rounded-full transition-all hover:scale-105 text-xs px-3 flex-shrink-0"
                >
                  <Video className="w-3 h-3" />
                  <span className="ml-1 hidden sm:inline">Vidéo</span>
                </Button>
                
                <Button
                  type="button"
                  variant={postType === "music" ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setPostType("music")}
                  className="rounded-full transition-all hover:scale-105 text-xs px-3 flex-shrink-0"
                >
                  <Music className="w-3 h-3" />
                  <span className="ml-1 hidden sm:inline">Musique</span>
                </Button>
                
                <Button
                  type="button"
                  variant={postType === "event" ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setPostType("event")}
                  className="rounded-full transition-all hover:scale-105 text-xs px-3 flex-shrink-0"
                >
                  <Calendar className="w-3 h-3" />
                  <span className="ml-1 hidden sm:inline">Événement</span>
                </Button>
                
                <ServiceRequestDialog 
                  onSubmit={handleServiceRequest}
                  isSubmitting={isSubmitting}
                >
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="rounded-full transition-all hover:scale-105 bg-orange-500/10 hover:bg-orange-500/20 text-orange-700 border-orange-200 text-xs px-3 flex-shrink-0"
                  >
                    <Handshake className="w-3 h-3" />
                    <span className="ml-1 hidden sm:inline">Prestation</span>
                  </Button>
                </ServiceRequestDialog>
              </div>

              {/* Publish button - Always visible */}
              <Button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                size="sm"
                className="rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all hover:scale-105 font-semibold text-xs px-4 flex-shrink-0"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span className="ml-2 hidden sm:inline">Publication...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Publier</span>
                    <span className="sm:hidden">📤</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        <input
          ref={fileInputRef}
          type="file"
          accept={postType === "image" ? "image/*" : postType === "video" ? "video/*" : "*"}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              // TODO: Handle file upload
              console.log("File selected:", file);
            }
          }}
        />
      </CardContent>
    </Card>
  );
}