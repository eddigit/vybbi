import { useState, useEffect } from 'react';
import { LANGUAGES } from '@/lib/languages';

export const useLanguageDetection = () => {
  const [detectedLanguage, setDetectedLanguage] = useState<string>('fr');
  const [isAutoDetected, setIsAutoDetected] = useState<boolean>(true);

  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem('vybbi-language');
      if (savedLanguage && LANGUAGES.some(lang => lang.code === savedLanguage)) {
        setDetectedLanguage(savedLanguage);
        setIsAutoDetected(false);
        return;
      }

      const browserLanguages = navigator.languages || [navigator.language];
      let detected = 'fr';

      for (const browserLang of browserLanguages) {
        const langCode = browserLang.split('-')[0].toLowerCase();
        const supportedLang = LANGUAGES.find(lang => lang.code === langCode);
        if (supportedLang) {
          detected = supportedLang.code;
          break;
        }
      }

      setDetectedLanguage(detected);
      localStorage.setItem('vybbi-language', detected);
      setIsAutoDetected(true);
    } catch (e) {
      console.warn('Language detection failed:', e);
      setDetectedLanguage('fr');
      setIsAutoDetected(true);
    }
  }, []);

  return {
    detectedLanguage,
    isAutoDetected,
    setIsAutoDetected
  };
};