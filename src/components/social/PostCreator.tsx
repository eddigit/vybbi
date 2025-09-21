import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSocialActions } from "@/hooks/useSocialActions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageIcon, Music, Video, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function PostCreator() {
  const { user, profile } = useAuth();
  const { createPost } = useSocialActions();
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
      toast.error("Erreur lors de la création de la publication");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
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
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="flex items-start space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback>
                {profile.display_name?.charAt(0) || user.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={getPlaceholder()}
                className="min-h-[100px] resize-none border-0 p-0 focus:ring-0 text-base"
                maxLength={1000}
              />
              
              {/* Post Type Selector */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant={postType === "text" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPostType("text")}
                  >
                    Texte
                  </Button>
                  <Button
                    type="button"
                    variant={postType === "image" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setPostType("image");
                      handleFileSelect();
                    }}
                  >
                    <ImageIcon className="w-4 h-4 mr-1" />
                    Photo
                  </Button>
                  <Button
                    type="button"
                    variant={postType === "video" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setPostType("video");
                      handleFileSelect();
                    }}
                  >
                    <Video className="w-4 h-4 mr-1" />
                    Vidéo
                  </Button>
                  <Button
                    type="button"
                    variant={postType === "music" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPostType("music")}
                  >
                    <Music className="w-4 h-4 mr-1" />
                    Musique
                  </Button>
                  <Button
                    type="button"
                    variant={postType === "event" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPostType("event")}
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Événement
                  </Button>
                </div>

                <Button
                  type="submit"
                  disabled={!content.trim() || isSubmitting}
                  className="ml-4"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
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