
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'es' | 'ar' | 'de';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    localStorage.setItem('language', language);
    loadTranslations(language);
    
    // Handle RTL for Arabic
    if (language === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.classList.remove('rtl');
    }
  }, [language]);

  const loadTranslations = async (lang: Language) => {
    try {
      const module = await import(`../translations/${lang}.ts`);
      setTranslations(module.default);
    } catch (error) {
      console.error(`Failed to load translations for ${lang}:`, error);
      // Fallback to English if translation fails
      if (lang !== 'en') {
        const fallback = await import('../translations/en.ts');
        setTranslations(fallback.default);
      }
    }
  };

  const t = (key: string): string => {
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
