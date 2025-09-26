import React, { createContext, useContext, useEffect, useState } from 'react';
import { LANGUAGES } from '@/lib/languages';
import { translationService } from '@/lib/translationService';
import { useLanguageDetection } from '@/hooks/useLanguageDetection';

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
  const { detectedLanguage, isAutoDetected, setIsAutoDetected } = useLanguageDetection();
  const [userLanguage, setUserLanguage] = useState<string>(detectedLanguage);

  useEffect(() => {
    setUserLanguage(detectedLanguage);
  }, [detectedLanguage]);

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