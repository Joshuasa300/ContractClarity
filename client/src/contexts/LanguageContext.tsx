import { useState, useEffect, ReactNode } from 'react';
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

  // Function to get translated text
  const t = (key: string): string => {
    const translation = translations[language];
    return (translation as any)[key] || key;
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