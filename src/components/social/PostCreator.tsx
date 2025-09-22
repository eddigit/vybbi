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
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50 shadow-lg">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="flex items-start space-x-3">
            <Avatar className="w-10 h-10 ring-2 ring-primary/20">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {profile.display_name?.charAt(0) || user.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={getPlaceholder()}
                className="min-h-[80px] resize-none border-0 p-3 bg-muted/30 rounded-xl focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-muted-foreground/60 transition-all"
                maxLength={1000}
              />
              
              {/* Post Type Selector */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1">
                  <Button
                    type="button"
                    variant={postType === "text" ? "default" : "secondary"}
                    size="xs"
                    onClick={() => setPostType("text")}
                    className="rounded-full transition-all hover:scale-105"
                  >
                    ✏️ Texte
                  </Button>
                  <Button
                    type="button"
                    variant={postType === "image" ? "default" : "secondary"}
                    size="xs"
                    onClick={() => {
                      setPostType("image");
                      handleFileSelect();
                    }}
                    className="rounded-full transition-all hover:scale-105"
                  >
                    <ImageIcon className="w-3 h-3 mr-1" />
                    Photo
                  </Button>
                  <Button
                    type="button"
                    variant={postType === "video" ? "default" : "secondary"}
                    size="xs"
                    onClick={() => {
                      setPostType("video");
                      handleFileSelect();
                    }}
                    className="rounded-full transition-all hover:scale-105"
                  >
                    <Video className="w-3 h-3 mr-1" />
                    Vidéo
                  </Button>
                  <Button
                    type="button"
                    variant={postType === "music" ? "default" : "secondary"}
                    size="xs"
                    onClick={() => setPostType("music")}
                    className="rounded-full transition-all hover:scale-105"
                  >
                    <Music className="w-3 h-3 mr-1" />
                    Musique
                  </Button>
                  <Button
                    type="button"
                    variant={postType === "event" ? "default" : "secondary"}
                    size="xs"
                    onClick={() => setPostType("event")}
                    className="rounded-full transition-all hover:scale-105"
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    Événement
                  </Button>
                  <ServiceRequestDialog 
                    onSubmit={handleServiceRequest}
                    isSubmitting={isSubmitting}
                  >
                    <Button
                      type="button"
                      variant="secondary"
                      size="xs"
                      className="rounded-full transition-all hover:scale-105 bg-orange-500/10 hover:bg-orange-500/20 text-orange-700 border-orange-200"
                    >
                      <Handshake className="w-3 h-3 mr-1" />
                      Prestation
                    </Button>
                  </ServiceRequestDialog>
                </div>

                <Button
                  type="submit"
                  disabled={!content.trim() || isSubmitting}
                  size="sm"
                  className="rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all hover:scale-105 font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin mr-2" />
                      Publication...
                    </>
                  ) : (
                    "Publier"
                  )}
                </Button>
              </div>
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