import { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from '@/integrations/supabase/client';

interface ReviewFormProps {
  artistId: string;
  onReviewSubmitted: () => void;
  existingReview?: boolean;
}

export default function ReviewForm({ artistId, onReviewSubmitted, existingReview = false }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Note requise",
        description: "Veuillez sélectionner une note entre 1 et 5 étoiles.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          reviewer_id: profile?.user_id!,
          reviewed_profile_id: artistId,
          rating,
          comment: comment.trim() || null
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Avis publié",
        description: "Votre avis a été publié avec succès.",
      });

      setRating(0);
      setComment('');
      onReviewSubmitted();
      
    } catch (error: any) {
      console.error('Error submitting review:', error);
      
      let errorMessage = "Une erreur est survenue lors de la publication de votre avis.";
      
      if (error.message?.includes('duplicate key value')) {
        errorMessage = "Vous avez déjà laissé un avis pour cet artiste.";
      } else if (error.message?.includes('row-level security')) {
        errorMessage = "Seuls les lieux, agents et managers peuvent laisser un avis.";
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (existingReview) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            Vous avez déjà laissé un avis pour cet artiste.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Laisser un avis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">Note *</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 hover:scale-110 transition-transform"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium mb-2">Commentaire (optionnel)</label>
            <Textarea
              placeholder="Partagez votre expérience avec cet artiste..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit" disabled={isSubmitting || rating === 0} className="w-full">
            {isSubmitting ? "Publication..." : "Publier l'avis"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}