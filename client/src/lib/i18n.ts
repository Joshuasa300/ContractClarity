import { useState, useEffect, createContext, useContext } from 'react';

export type Language = 'en' | 'es' | 'ar' | 'de' | 'fr';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Storage key for persisting language preference
const LANGUAGE_STORAGE_KEY = 'contractai-language';

export const getStoredLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && ['en', 'es', 'ar', 'de', 'fr'].includes(stored)) {
      return stored as Language;
    }
  }
  return 'en'; // Default to English
};

export const setStoredLanguage = (language: Language) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }
};

// Language metadata
export const languages = {
  en: { name: 'English', flag: '🇬🇧', dir: 'ltr' },
  es: { name: 'Español', flag: '🇪🇸', dir: 'ltr' },
  ar: { name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  de: { name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  fr: { name: 'Français', flag: '🇫🇷', dir: 'ltr' }
} as const;

// Helper function to get all translation keys from an object (nested)
export const getAllKeys = (obj: any, prefix = ''): string[] => {
  let keys: string[] = [];
  
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getAllKeys(obj[key], prefix ? `${prefix}.${key}` : key));
    } else {
      keys.push(prefix ? `${prefix}.${key}` : key);
    }
  }
  
  return keys;
};

// Helper function to find missing translation keys
export const findMissingKeys = (baseTranslations: any, targetTranslations: any): string[] => {
  const baseKeys = getAllKeys(baseTranslations);
  const targetKeys = getAllKeys(targetTranslations);
  
  return baseKeys.filter(key => !targetKeys.includes(key));
};

// Helper function to get value from nested object using dot notation
export const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current && current[key], obj);
};

// Development helper: Log missing translations (only in development)
export const validateTranslations = (translations: Record<string, any>) => {
  if (process.env.NODE_ENV === 'development') {
    const englishKeys = getAllKeys(translations.en);
    
    Object.keys(translations).forEach(lang => {
      if (lang !== 'en') {
        const missing = findMissingKeys(translations.en, translations[lang]);
        if (missing.length > 0) {
          console.warn(`Missing translations in ${lang}:`, missing);
        }
      }
    });
  }
};