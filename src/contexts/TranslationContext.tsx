import React, { createContext, useContext } from 'react';
import { useLanguageDetection } from '@/hooks/useLanguageDetection';
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
  const { detectedLanguage, userLanguage, changeLanguage, isAutoDetected } = useLanguageDetection();

  console.log('TranslationProvider - Detected:', detectedLanguage, 'User:', userLanguage, 'Auto:', isAutoDetected);

  const translate = async (text: string, sourceLanguage?: string): Promise<string> => {
    console.log('TranslationProvider - Translating:', text.substring(0, 50), 'to:', userLanguage);
    const result = await translationService.translate(text, userLanguage, sourceLanguage);
    console.log('TranslationProvider - Translation result:', result.substring(0, 50));
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