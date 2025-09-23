import { useState, useEffect } from 'react';
import { LANGUAGES } from '@/lib/languages';

export const useLanguageDetection = () => {
  const [detectedLanguage, setDetectedLanguage] = useState<string>('fr');
  const [userLanguage, setUserLanguage] = useState<string>('fr');

  useEffect(() => {
    // Check localStorage first
    const savedLanguage = localStorage.getItem('vybbi-language');
    if (savedLanguage && LANGUAGES.some(lang => lang.code === savedLanguage)) {
      setUserLanguage(savedLanguage);
      return;
    }

    // Detect browser language
    const browserLanguages = navigator.languages || [navigator.language];
    let detected = 'fr'; // Default fallback

    for (const browserLang of browserLanguages) {
      // Extract language code (remove region)
      const langCode = browserLang.split('-')[0].toLowerCase();
      
      // Check if we support this language
      const supportedLang = LANGUAGES.find(lang => lang.code === langCode);
      if (supportedLang) {
        detected = supportedLang.code;
        break;
      }
    }

    setDetectedLanguage(detected);
    setUserLanguage(detected);
    localStorage.setItem('vybbi-language', detected);
  }, []);

  const changeLanguage = (languageCode: string) => {
    if (LANGUAGES.some(lang => lang.code === languageCode)) {
      setUserLanguage(languageCode);
      localStorage.setItem('vybbi-language', languageCode);
    }
  };

  return {
    detectedLanguage,
    userLanguage,
    changeLanguage,
    isAutoDetected: !localStorage.getItem('vybbi-language')
  };
};