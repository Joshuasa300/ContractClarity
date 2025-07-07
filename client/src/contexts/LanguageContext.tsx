import { useState, useEffect, useContext, ReactNode } from 'react';
import { 
  Language, 
  LanguageContext, 
  getStoredLanguage, 
  setStoredLanguage, 
  type LanguageContextType 
} from '@/lib/i18n';
import { translations } from '@/translations';

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(getStoredLanguage());

  // Function to get translated text with English fallback
  const t = (key: string): string => {
    const translation = translations[language];
    
    // First try to get the key directly (for flat dot-notation keys)
    if (key in translation) {
      const directResult = translation[key];
      return typeof directResult === 'string' ? directResult : key;
    }
    
    // Handle nested keys like 'nav.signIn'
    const keys = key.split('.');
    let result: any = translation;
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        // Fallback to English if not found in current language
        if (language !== 'en') {
          const englishTranslation = translations.en;
          
          // Try direct key first in English
          if (key in englishTranslation) {
            const directEnglishResult = englishTranslation[key];
            return typeof directEnglishResult === 'string' ? directEnglishResult : key;
          }
          
          // Try nested approach in English
          let englishResult: any = englishTranslation;
          for (const k of keys) {
            if (englishResult && typeof englishResult === 'object' && k in englishResult) {
              englishResult = englishResult[k];
            } else {
              return key; // Return the key if not found in English either
            }
          }
          
          return typeof englishResult === 'string' ? englishResult : key;
        }
        return key; // Return the key itself if not found and already in English
      }
    }
    
    return typeof result === 'string' ? result : key;
  };

  // Handle language change
  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setStoredLanguage(newLanguage);
    
    // Update document direction for RTL languages
    if (typeof document !== 'undefined') {
      const isRTL = newLanguage === 'ar';
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = newLanguage;
    }
  };

  // Set initial document properties
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const isRTL = language === 'ar';
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
  }, [language]);

  const contextValue: LanguageContextType = {
    language,
    setLanguage: handleLanguageChange,
    t,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}