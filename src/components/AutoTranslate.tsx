import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/I18nProvider';

interface AutoTranslateProps {
  text: string;
  sourceLanguage?: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  fallback?: React.ReactNode;
}

export const AutoTranslate: React.FC<AutoTranslateProps> = ({ 
  text, 
  sourceLanguage = 'fr',
  className,
  as: Component = 'span',
  fallback
}) => {
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

  if (isLoading && fallback) {
    return <>{fallback}</>;
  }

  return (
    <Component className={className}>
      {translatedText}
    </Component>
  );
};