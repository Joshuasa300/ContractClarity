import { en } from './en';
import { es } from './es';
import { ar } from './ar';
import { de } from './de';
import { fr } from './fr';
import { validateTranslations } from '../lib/i18n';

export const translations = {
  en,
  es,
  ar,
  de,
  fr
} as const;

// Validate translations in development mode
validateTranslations(translations);

export * from './en';
export * from './es';
export * from './ar';
export * from './de';
export * from './fr';