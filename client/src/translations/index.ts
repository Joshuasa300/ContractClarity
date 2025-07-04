import { en } from './en';
import { es } from './es';
import { ar } from './ar';
import { de } from './de';
import { fr } from './fr';

export const translations = {
  en,
  es,
  ar,
  de,
  fr
} as const;

export * from './en';
export * from './es';
export * from './ar';
export * from './de';
export * from './fr';