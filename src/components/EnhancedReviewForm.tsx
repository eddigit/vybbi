import { useState } from 'react';
import { Star, MessageSquare, User, Briefcase, Heart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from '@/integrations/supabase/client';
import { sendReviewNotification } from '@/lib/emailService';

interface EnhancedReviewFormProps {
  artistId: string;
  onReviewSubmitted: () => void;
  existingReview?: boolean;
}

export default function EnhancedReviewForm({ artistId, onReviewSubmitted, existingReview = false }: EnhancedReviewFormProps) {
  const [talentScore, setTalentScore] = useState(0);
  const [professionalismScore, setProfessionalismScore] = useState(0);
  const [communicationScore, setCommunicationScore] = useState(0);
  const [hoveredCriteria, setHoveredCriteria] = useState<{[key: string]: number}>({});
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();

  const criteria = [
    {
      key: 'talent',
      title: 'Talent Artistique',
      description: 'Qualité technique, créativité, performance scénique',
      icon: Star,
      score: talentScore,
      setScore: setTalentScore
    },
    {
      key: 'professionalism',
      title: 'Professionnalisme',
      description: 'Ponctualité, respect des engagements, préparation',
      icon: Briefcase,
      score: professionalismScore,
      setScore: setProfessionalismScore
    },
    {
      key: 'communication',
      title: 'Relationnel',
      description: 'Communication, collaboration, attitude professionnelle',
      icon: Heart,
      score: communicationScore,
      setScore: setCommunicationScore
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (talentScore === 0 || professionalismScore === 0 || communicationScore === 0) {
      toast({
        title: "Notes requises",
        description: "Veuillez évaluer tous les critères (1 à 5 étoiles).",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('detailed_reviews')
        .insert({
          reviewer_id: profile?.user_id!,
          reviewed_profile_id: artistId,
          talent_score: talentScore,
          professionalism_score: professionalismScore,
          communication_score: communicationScore,
          comment: comment.trim() || null
        });

      if (error) {
        throw error;
      }

      // Send email notification
      const { data: artistProfile } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', artistId)
        .maybeSingle();

      const { data: reviewerProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', profile?.id)
        .maybeSingle();

      if (artistProfile?.email && reviewerProfile?.display_name) {
        setTimeout(async () => {
          try {
            const avgScore = (talentScore + professionalismScore + communicationScore) / 3;
            await sendReviewNotification(
              artistProfile.email,
              artistProfile.display_name,
              artistId,
              reviewerProfile.display_name,
              Math.round(avgScore),
              comment.trim() || undefined
            );
          } catch (emailError) {
            console.error('Erreur lors de l\'envoi de la notification email:', emailError);
          }
        }, 1000);
      }

      toast({
        title: "Avis détaillé publié",
        description: "Votre évaluation complète a été publiée avec succès.",
      });

      setTalentScore(0);
      setProfessionalismScore(0);
      setCommunicationScore(0);
      setComment('');
      onReviewSubmitted();
      
    } catch (error: any) {
      console.error('Error submitting detailed review:', error);
      
      let errorMessage = "Une erreur est survenue lors de la publication de votre avis.";
      
      if (error.message?.includes('duplicate key value')) {
        errorMessage = "Vous avez déjà laissé un avis détaillé pour cet artiste.";
      } else if (error.message?.includes('row-level security')) {
        errorMessage = "Seuls les organisateurs, agents et managers peuvent laisser un avis.";
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
            Vous avez déjà laissé un avis détaillé pour cet artiste.
          </p>
        </CardContent>
      </Card>
    );
  }

  const StarRating = ({ critKey, score, setScore, Icon }: any) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <label className="text-sm font-medium">{criteria.find(c => c.key === critKey)?.title}</label>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {criteria.find(c => c.key === critKey)?.description}
      </p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="p-1 hover:scale-110 transition-transform"
            onMouseEnter={() => setHoveredCriteria({...hoveredCriteria, [critKey]: star})}
            onMouseLeave={() => setHoveredCriteria({...hoveredCriteria, [critKey]: 0})}
            onClick={() => setScore(star)}
          >
            <Star
              className={`h-5 w-5 ${
                star <= (hoveredCriteria[critKey] || score)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground'
              } transition-colors`}
            />
          </button>
        ))}
        <span className="text-sm text-muted-foreground ml-2">
          {score > 0 ? `${score}/5` : 'Non évalué'}
        </span>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Évaluation Détaillée
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Évaluez cet artiste selon 3 critères professionnels
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Criteria */}
          <div className="grid gap-4">
            {criteria.map((criterion) => (
              <div key={criterion.key} className="p-4 border rounded-lg bg-muted/20">
                <StarRating 
                  critKey={criterion.key}
                  score={criterion.score}
                  setScore={criterion.setScore}
                  Icon={criterion.icon}
                />
              </div>
            ))}
          </div>

          {/* Overall Preview */}
          {(talentScore > 0 && professionalismScore > 0 && communicationScore > 0) && (
            <div className="p-3 bg-primary/10 rounded-lg">
              <div className="text-sm font-medium mb-1">Note moyenne</div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-lg font-bold">
                  {((talentScore + professionalismScore + communicationScore) / 3).toFixed(1)}/5
                </span>
              </div>
            </div>
          )}

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium mb-2">Commentaire détaillé (optionnel)</label>
            <Textarea
              placeholder="Décrivez votre expérience avec cet artiste, ses points forts, axes d'amélioration..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="min-h-[100px]"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || talentScore === 0 || professionalismScore === 0 || communicationScore === 0} 
            className="w-full"
          >
            {isSubmitting ? "Publication..." : "Publier l'évaluation complète"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}