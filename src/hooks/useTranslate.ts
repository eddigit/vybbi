import { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/I18nProvider';

export const useTranslate = (text: string, sourceLanguage: string = 'fr') => {
  const { translate, currentLanguage } = useTranslation();
  const [translatedText, setTranslatedText] = useState<string>(text);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Don't translate if target language is French (original) or text is empty
    if (currentLanguage === 'fr' || !text.trim()) {
      setTranslatedText(text);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);

    const translateText = async () => {
      try {
        const result = await translate(text, sourceLanguage);
        if (!isCancelled) {
          setTranslatedText(result);
        }
      } catch (error) {
        console.error('Translation failed:', error);
        if (!isCancelled) {
          setTranslatedText(text); // Fallback to original text
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    translateText();

    return () => {
      isCancelled = true;
    };
  }, [text, currentLanguage, sourceLanguage, translate]);

  return { translatedText, isLoading };
};