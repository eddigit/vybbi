import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';

export const TranslationTest: React.FC = () => {
  try {
    const { currentLanguage, changeLanguage } = useTranslation();
    
    console.log('TranslationTest - Current language:', currentLanguage);
    
    return (
      <div className="p-4 border rounded-lg bg-card">
        <h3 className="font-bold mb-2">Test de Traduction</h3>
        <p>Langue actuelle: {currentLanguage}</p>
        <div className="flex gap-2 mt-2">
          <button 
            onClick={() => changeLanguage('en')} 
            className="px-3 py-1 bg-primary text-white rounded"
          >
            English
          </button>
          <button 
            onClick={() => changeLanguage('es')} 
            className="px-3 py-1 bg-primary text-white rounded"
          >
            Español
          </button>
          <button 
            onClick={() => changeLanguage('fr')} 
            className="px-3 py-1 bg-primary text-white rounded"
          >
            Français
          </button>
        </div>
      </div>
    );
  } catch (error) {
    console.error('TranslationTest error:', error);
    return (
      <div className="p-4 border rounded-lg bg-red-100">
        <p className="text-red-600">Erreur du système de traduction: {error.message}</p>
      </div>
    );
  }
};