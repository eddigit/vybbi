import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/contexts/I18nProvider';
import { LANGUAGES, getLanguageByCode } from '@/lib/languages';
import { Globe } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const { currentLanguage, changeLanguage, isAutoDetected } = useTranslation();
  
  const currentLangData = getLanguageByCode(currentLanguage);
  
  console.log('LanguageSelector - Current language:', currentLanguage, 'Data:', currentLangData);
  
  const handleLanguageChange = (languageCode: string) => {
    console.log('LanguageSelector - Changing language to:', languageCode);
    changeLanguage(languageCode);
  };
  
  return (
    <Select value={currentLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-auto min-w-[140px] gap-2">
        <Globe className="w-4 h-4" />
        <SelectValue>
          <span className="flex items-center gap-2">
            <span>{currentLangData?.flag}</span>
            <span className="hidden sm:inline">{currentLangData?.name}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            <span className="flex items-center gap-3">
              <span className="text-lg">{language.flag}</span>
              <span>{language.name}</span>
              {isAutoDetected && language.code === currentLanguage && (
                <span className="text-xs text-muted-foreground">(Auto)</span>
              )}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};