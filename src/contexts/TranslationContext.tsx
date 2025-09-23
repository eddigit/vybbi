import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { LANGUAGES } from '@/lib/languages';
import { translationService } from '@/lib/translationService';

interface TranslationContextValue {
  currentLanguage: string;
  detectedLanguage: string;
  isAutoDetected: boolean;
  changeLanguage: (languageCode: string) => void;
  translate: (text: string, sourceLanguage?: string) => Promise<string>;
  translateBatch: (texts: string[], sourceLanguage?: string) => Promise<string[]>;
}

const TranslationContext = createContext<TranslationContextValue | undefined>(undefined);

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

interface TranslationProviderProps {
  children: React.ReactNode;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  const [detectedLanguage, setDetectedLanguage] = useState<string>('fr');
  const [userLanguage, setUserLanguage] = useState<string>('fr');
  const [isAutoDetected, setIsAutoDetected] = useState<boolean>(true);

  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem('vybbi-language');
      if (savedLanguage && LANGUAGES.some(lang => lang.code === savedLanguage)) {
        setUserLanguage(savedLanguage);
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
      setUserLanguage(detected);
      localStorage.setItem('vybbi-language', detected);
      setIsAutoDetected(true);
    } catch (e) {
      console.warn('Language detection failed:', e);
    }
  }, []);

  const changeLanguage = (languageCode: string) => {
    if (LANGUAGES.some(lang => lang.code === languageCode)) {
      setUserLanguage(languageCode);
      localStorage.setItem('vybbi-language', languageCode);
      setIsAutoDetected(false);
    }
  };

  const translate = async (text: string, sourceLanguage?: string): Promise<string> => {
    const result = await translationService.translate(text, userLanguage, sourceLanguage);
    return result;
  };

  const translateBatch = async (texts: string[], sourceLanguage?: string): Promise<string[]> => {
    return translationService.translateBatch(texts, userLanguage, sourceLanguage);
  };

  const contextValue: TranslationContextValue = {
    currentLanguage: userLanguage,
    detectedLanguage,
    isAutoDetected,
    changeLanguage,
    translate,
    translateBatch,
  };

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
};