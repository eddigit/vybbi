import React, { useState, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

// État global pour la visibilité du lecteur radio sur mobile
let globalRadioVisible = false;
const listeners: Set<() => void> = new Set();

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

export const useRadioPlayerVisibility = () => {
  const isMobile = useIsMobile();
  const [, forceUpdate] = useState({});

  // S'abonner aux changements d'état
  const subscribe = useCallback(() => {
    const listener = () => forceUpdate({});
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  // Utiliser l'effet pour s'abonner
  React.useEffect(() => {
    const unsubscribe = subscribe();
    return unsubscribe;
  }, [subscribe]);

  const toggleRadioVisibility = useCallback(() => {
    if (isMobile) {
      globalRadioVisible = !globalRadioVisible;
      notifyListeners();
    }
  }, [isMobile]);

  const showRadio = useCallback(() => {
    if (isMobile) {
      globalRadioVisible = true;
      notifyListeners();
    }
  }, [isMobile]);

  const hideRadio = useCallback(() => {
    if (isMobile) {
      globalRadioVisible = false;
      notifyListeners();
    }
  }, [isMobile]);

  return {
    isRadioVisible: isMobile ? globalRadioVisible : true, // Toujours visible sur desktop
    toggleRadioVisibility,
    showRadio,
    hideRadio,
    isMobile
  };
};