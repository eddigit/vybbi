import React, { createContext, useContext, useEffect, useState } from 'react';
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

// Fixed TranslationProvider without phantom hooks
export function TranslationProvider({ children }: TranslationProviderProps) {
  const [detectedLanguage, setDetectedLanguage] = useState<string>('fr');
  const [userLanguage, setUserLanguage] = useState<string>('fr');
  const [isAutoDetected, setIsAutoDetected] = useState<boolean>(true);

  // Language detection effect
  useEffect(() => {
    try {
      // Check for saved language preference
      const savedLanguage = localStorage.getItem('vybbi-language');
      if (savedLanguage && LANGUAGES.some(lang => lang.code === savedLanguage)) {
        setUserLanguage(savedLanguage);
        setDetectedLanguage(savedLanguage);
        setIsAutoDetected(false);
        console.log('TranslationProvider - Saved language loaded:', savedLanguage);
        return;
      }

      // Detect browser language
      const browserLanguages = navigator.languages || [navigator.language];
      let detected = 'fr'; // Default fallback

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
      console.log(`TranslationProvider - Detected: ${detected} User: ${detected} Auto: true`);
    } catch (error) {
      console.warn('Language detection failed, using default (fr):', error);
      setDetectedLanguage('fr');
      setUserLanguage('fr');
      setIsAutoDetected(true);
    }
  }, []);

  const changeLanguage = (languageCode: string) => {
    if (LANGUAGES.some(lang => lang.code === languageCode)) {
      setUserLanguage(languageCode);
      localStorage.setItem('vybbi-language', languageCode);
      setIsAutoDetected(false);
      console.log('TranslationProvider - Language changed to:', languageCode);
    }
  };

  const translate = async (text: string, sourceLanguage?: string): Promise<string> => {
    try {
      const result = await translationService.translate(text, userLanguage, sourceLanguage);
      return result;
    } catch (error) {
      console.warn('Translation failed:', error);
      return text; // Return original text as fallback
    }
  };

  const translateBatch = async (texts: string[], sourceLanguage?: string): Promise<string[]> => {
    try {
      return await translationService.translateBatch(texts, userLanguage, sourceLanguage);
    } catch (error) {
      console.warn('Batch translation failed:', error);
      return texts; // Return original texts as fallback
    }
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
}