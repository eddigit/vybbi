import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function useWelcomeModal() {
  const { profile, user, loading } = useAuth();
  const navigate = useNavigate();
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);

  useEffect(() => {
    // Only show modal if user is authenticated and profile is loaded
    if (loading || !user || !profile) {
      return;
    }

    // Get/increment login counter
    const loginCountKey = `login_count_${profile.id}`;
    const currentCount = parseInt(localStorage.getItem(loginCountKey) || '0');
    const newCount = currentCount + 1;
    localStorage.setItem(loginCountKey, newCount.toString());

    // Check if this is a new user (onboarding just completed)
    const isNewUser = profile.onboarding_completed && !localStorage.getItem(`welcome_shown_${profile.id}`);
    
    // Check if user manually dismissed the modal before
    const userDismissed = localStorage.getItem(`welcome_dismissed_${profile.id}`);
    
    // Only show within first 4 logins
    const withinLimit = newCount <= 4;
    
    // Show modal for new users who haven't dismissed it and within login limit
    if (isNewUser && !userDismissed && withinLimit) {
      // Small delay to ensure smooth transition from onboarding
      const timer = setTimeout(() => {
        setIsWelcomeModalOpen(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [profile, user, loading]);

  const closeWelcomeModal = () => {
    setIsWelcomeModalOpen(false);
    
    // Mark as shown for this user
    if (profile?.id) {
      localStorage.setItem(`welcome_shown_${profile.id}`, 'true');
      localStorage.setItem(`welcome_dismissed_${profile.id}`, 'true');
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return {
    isWelcomeModalOpen,
    closeWelcomeModal,
    handleNavigate,
    profile,
    profileId: profile?.id || ''
  };
}