import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { OnboardingStep } from '@/components/onboarding/OnboardingStep';
import { Step1BasicInfo } from '@/components/onboarding/Step1BasicInfo';
import { Step2ProfileSpecific } from '@/components/onboarding/Step2ProfileSpecific';
import { Step3Contact } from '@/components/onboarding/Step3Contact';
import { Step4Final } from '@/components/onboarding/Step4Final';

import { LoadingPage } from '@/components/LoadingStates';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Redirect if user is not authenticated or onboarding is already completed
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
      return;
    }

    if (!authLoading && profile) {
      // Check if onboarding is already completed
      const isCompleted = (profile as any).onboarding_completed;
      if (isCompleted) {
        navigate('/dashboard', { replace: true });
        return;
      }
    }
  }, [user, profile, authLoading, navigate]);

  const onboarding = useOnboarding(
    profile?.id || '', 
    profile?.profile_type || 'artist'
  );

  // Initialize form with existing profile data
  useEffect(() => {
    if (profile) {
      onboarding.updateData({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        genres: profile.genres || [],
        languages: (profile as any).languages || [],
        email: profile.email || '',
        phone: profile.phone || '',
        website: profile.website || '',
        instagram_url: profile.instagram_url || '',
        spotify_url: profile.spotify_url || '',
        soundcloud_url: profile.soundcloud_url || '',
        youtube_url: profile.youtube_url || '',
        tiktok_url: profile.tiktok_url || '',
        accepts_direct_contact: (profile as any).accepts_direct_contact ?? true,
        is_public: profile.is_public ?? true,
        experience: profile.experience || '',
        venue_category: (profile as any).venue_category || '',
        venue_capacity: (profile as any).venue_capacity || 0,
        talents: (profile as any).talents || []
      });

      if (profile.avatar_url) {
        setAvatarPreview(profile.avatar_url);
      }
    }
  }, [profile]);

  const canProceedToNext = () => {
    switch (onboarding.currentStep) {
      case 1:
        return onboarding.data.display_name && onboarding.data.bio && onboarding.data.location;
      case 2:
        if (profile?.profile_type === 'artist') {
          return onboarding.data.genres.length > 0;
        } else if (profile?.profile_type === 'lieu') {
          return onboarding.data.venue_category;
        } else {
          return onboarding.data.experience;
        }
      case 3:
        if (profile?.profile_type !== 'artist') {
          return onboarding.data.email;
        }
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleComplete = async () => {
    if (!user || !profile) return;

    try {
      await onboarding.completeOnboarding(user.id);
      
      toast({
        title: "Profil complété !",
        description: "Bienvenue dans la communauté Vybbi !",
      });

      // Navigate to dashboard for all profile types for consistency
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Erreur",
        description: "Impossible de finaliser votre profil. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const renderCurrentStep = () => {
    switch (onboarding.currentStep) {
      case 1:
        return (
          <Step1BasicInfo
            data={onboarding.data}
            updateData={onboarding.updateData}
            avatarPreview={avatarPreview}
            setAvatarPreview={setAvatarPreview}
          />
        );
      case 2:
        return (
          <Step2ProfileSpecific
            data={onboarding.data}
            updateData={onboarding.updateData}
            profileType={profile?.profile_type || 'artist'}
          />
        );
      case 3:
        return (
          <Step3Contact
            data={onboarding.data}
            updateData={onboarding.updateData}
            profileType={profile?.profile_type || 'artist'}
          />
        );
      case 4:
        return (
          <Step4Final
            data={onboarding.data}
            updateData={onboarding.updateData}
            avatarPreview={avatarPreview}
            profileType={profile?.profile_type || 'artist'}
          />
        );
      default:
        return null;
    }
  };

  if (authLoading || !profile) {
    return (
      <LoadingPage 
        title="Préparation de votre profil..."
        description="Nous configurons votre espace personnel"
      />
    );
  }

  return (
    <OnboardingStep
      title={onboarding.getStepTitle()}
      progress={onboarding.getProgressPercentage()}
    >
      {renderCurrentStep()}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={onboarding.previousStep}
          disabled={onboarding.currentStep === 1}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>

        <div className="flex gap-2">
          {onboarding.currentStep < 4 ? (
            <Button
              onClick={onboarding.nextStep}
              disabled={!canProceedToNext()}
              className="flex items-center gap-2"
            >
              Continuer
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={onboarding.loading || !canProceedToNext()}
              className="flex items-center gap-2"
            >
              {onboarding.loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Finaliser mon profil
            </Button>
          )}
        </div>
      </div>

      {/* Skip option for step 2, 3 (not for basic info and final) */}
      {(onboarding.currentStep === 2 || onboarding.currentStep === 3) && (
        <div className="text-center pt-2">
          <Button
            variant="ghost"
            onClick={onboarding.nextStep}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Passer cette étape
          </Button>
        </div>
      )}
    </OnboardingStep>
  );
}