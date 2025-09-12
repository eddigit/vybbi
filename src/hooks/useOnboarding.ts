import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/lib/types';

export interface OnboardingData {
  // Step 1: Basic Info
  display_name: string;
  bio: string;
  location: string;
  avatar_file: File | null;
  
  // Step 2: Profile Specific
  genres: string[];
  talents: string[];
  languages: string[];
  
  // Step 3: Contact & Links
  email: string;
  phone: string;
  website: string;
  instagram_url: string;
  spotify_url: string;
  soundcloud_url: string;
  youtube_url: string;
  tiktok_url: string;
  
  // Step 4: Preferences
  accepts_direct_contact: boolean;
  is_public: boolean;
  
  // Artist specific
  experience: string;
  
  // Venue specific
  venue_category: string;
  venue_capacity: number;
}

export function useOnboarding(profileId: string, profileType: string) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    display_name: '',
    bio: '',
    location: '',
    avatar_file: null,
    genres: [],
    talents: [],
    languages: [],
    email: '',
    phone: '',
    website: '',
    instagram_url: '',
    spotify_url: '',
    soundcloud_url: '',
    youtube_url: '',
    tiktok_url: '',
    accepts_direct_contact: true,
    is_public: true,
    experience: '',
    venue_category: '',
    venue_capacity: 0
  });

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const previousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  };

  const completeOnboarding = async (userId: string) => {
    setLoading(true);
    try {
      let avatarUrl: string | null = null;
      
      // Upload avatar if provided
      if (data.avatar_file) {
        avatarUrl = await uploadAvatar(data.avatar_file, userId);
      }

      // Prepare profile data
      const profileData: any = {
        display_name: data.display_name,
        bio: data.bio,
        location: data.location,
        genres: data.genres.length > 0 ? data.genres : null,
        languages: data.languages.length > 0 ? data.languages : null,
        email: data.email || null,
        phone: data.phone || null,
        website: data.website || null,
        instagram_url: data.instagram_url || null,
        spotify_url: data.spotify_url || null,
        soundcloud_url: data.soundcloud_url || null,
        youtube_url: data.youtube_url || null,
        tiktok_url: data.tiktok_url || null,
        accepts_direct_contact: data.accepts_direct_contact,
        is_public: data.is_public,
        onboarding_completed: true
      };

      if (avatarUrl) {
        profileData.avatar_url = avatarUrl;
      }

      // Add profile type specific fields
      if (profileType === 'artist') {
        profileData.experience = data.experience;
        profileData.talents = data.talents.length > 0 ? data.talents : null;
      } else if (profileType === 'lieu') {
        profileData.venue_category = data.venue_category;
        profileData.venue_capacity = data.venue_capacity > 0 ? data.venue_capacity : null;
      }

      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', profileId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Informations de base';
      case 2: return profileType === 'artist' ? 'Votre univers artistique' : 
                   profileType === 'lieu' ? 'Votre établissement' : 'Votre activité';
      case 3: return 'Contact et liens';
      case 4: return 'Finaliser votre profil';
      default: return '';
    }
  };

  const getProgressPercentage = () => {
    return (currentStep / 4) * 100;
  };

  return {
    currentStep,
    data,
    loading,
    updateData,
    nextStep,
    previousStep,
    completeOnboarding,
    getStepTitle,
    getProgressPercentage
  };
}