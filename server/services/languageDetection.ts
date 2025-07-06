import { franc } from 'franc';

// Supported languages in our application
export type SupportedLanguage = 'en' | 'es' | 'ar' | 'de' | 'fr';

// Language mapping from franc codes to our supported languages
const LANGUAGE_MAPPING: Record<string, SupportedLanguage> = {
  'eng': 'en', // English
  'spa': 'es', // Spanish
  'arb': 'ar', // Arabic
  'deu': 'de', // German
  'fra': 'fr', // French
  // Additional common variations
  'ger': 'de', // German alternative
  'fre': 'fr', // French alternative
};

// Confidence threshold for language detection
const CONFIDENCE_THRESHOLD = 0.6;

export interface LanguageDetectionResult {
  detectedLanguage: SupportedLanguage;
  confidence: number;
  francCode?: string;
  fallbackUsed: boolean;
}

/**
 * Detect the language of contract text
 * @param text - The contract text to analyze
 * @returns Language detection result with confidence score
 */
export function detectContractLanguage(text: string): LanguageDetectionResult {
  try {
    // Clean the text - remove excessive whitespace and special characters
    const cleanText = text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, ' ')
      .trim();

    // Require minimum text length for reliable detection
    if (cleanText.length < 50) {
      return {
        detectedLanguage: 'en',
        confidence: 0,
        fallbackUsed: true,
      };
    }

    // Use franc for language detection
    const francResult = franc(cleanText, { minLength: 3 });
    
    // If franc returns 'und' (undetermined), fall back to English
    if (francResult === 'und') {
      return {
        detectedLanguage: 'en',
        confidence: 0,
        francCode: francResult,
        fallbackUsed: true,
      };
    }

    // Map franc code to our supported language
    const mappedLanguage = LANGUAGE_MAPPING[francResult];
    
    if (!mappedLanguage) {
      // Language not supported, fall back to English
      return {
        detectedLanguage: 'en',
        confidence: 0,
        francCode: francResult,
        fallbackUsed: true,
      };
    }

    // Calculate confidence based on text characteristics
    const confidence = calculateConfidence(cleanText, francResult);

    // If confidence is too low, fall back to English
    if (confidence < CONFIDENCE_THRESHOLD) {
      return {
        detectedLanguage: 'en',
        confidence,
        francCode: francResult,
        fallbackUsed: true,
      };
    }

    return {
      detectedLanguage: mappedLanguage,
      confidence,
      francCode: francResult,
      fallbackUsed: false,
    };

  } catch (error) {
    console.error('Language detection error:', error);
    // Fallback to English on any error
    return {
      detectedLanguage: 'en',
      confidence: 0,
      fallbackUsed: true,
    };
  }
}

/**
 * Calculate confidence score for language detection
 * @param text - The cleaned text
 * @param francCode - The franc language code
 * @returns Confidence score between 0 and 1
 */
function calculateConfidence(text: string, francCode: string): number {
  let confidence = 0.5; // Base confidence

  // Text length bonus (longer text = more reliable)
  const textLength = text.length;
  if (textLength > 500) confidence += 0.2;
  else if (textLength > 200) confidence += 0.1;

  // Language-specific indicators
  switch (francCode) {
    case 'eng':
      // Look for common English legal terms
      if (/\b(agreement|contract|party|whereas|hereby|thereof)\b/i.test(text)) {
        confidence += 0.2;
      }
      break;
    case 'spa':
      // Look for Spanish legal indicators
      if (/\b(acuerdo|contrato|parte|considerando|por tanto)\b/i.test(text)) {
        confidence += 0.2;
      }
      break;
    case 'fra':
      // Look for French legal indicators
      if (/\b(accord|contrat|partie|considérant|par conséquent)\b/i.test(text)) {
        confidence += 0.2;
      }
      break;
    case 'deu':
      // Look for German legal indicators
      if (/\b(vereinbarung|vertrag|partei|hiermit|daher)\b/i.test(text)) {
        confidence += 0.2;
      }
      break;
    case 'arb':
      // Look for Arabic script
      if (/[\u0600-\u06FF]/.test(text)) {
        confidence += 0.3;
      }
      break;
  }

  return Math.min(confidence, 1.0);
}

/**
 * Get language name for display purposes
 * @param language - The language code
 * @returns Human-readable language name
 */
export function getLanguageName(language: SupportedLanguage): string {
  const names: Record<SupportedLanguage, string> = {
    'en': 'English',
    'es': 'Spanish',
    'ar': 'Arabic',
    'de': 'German',
    'fr': 'French',
  };
  return names[language];
}