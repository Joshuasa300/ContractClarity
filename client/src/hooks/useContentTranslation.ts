import { useState, useEffect } from 'react';
import { useLanguage } from '../lib/i18n';

interface TranslationCache {
  [key: string]: {
    [language: string]: string;
  };
}

// Cache for translated content
const translationCache: TranslationCache = {};

export function useContentTranslation() {
  const { language } = useLanguage();
  const [isTranslating, setIsTranslating] = useState(false);

  const translateContent = async (content: string, context?: string): Promise<string> => {
    // Return original content if English
    if (language === 'en') {
      return content;
    }

    // Check cache first
    const cacheKey = `${content}_${context || 'general'}`;
    if (translationCache[cacheKey]?.[language]) {
      return translationCache[cacheKey][language];
    }

    setIsTranslating(true);
    
    try {
      const response = await fetch('/api/translate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: content,
          targetLanguage: language,
          context: context || 'legal/business content'
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      const translatedText = data.translatedText;

      // Cache the translation
      if (!translationCache[cacheKey]) {
        translationCache[cacheKey] = {};
      }
      translationCache[cacheKey][language] = translatedText;

      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return content; // Return original on error
    } finally {
      setIsTranslating(false);
    }
  };

  const translateArray = async (items: Array<{ [key: string]: any }>, fields: string[], context?: string) => {
    if (language === 'en') {
      return items;
    }

    const translatedItems = await Promise.all(
      items.map(async (item) => {
        const translatedItem = { ...item };
        
        for (const field of fields) {
          if (item[field]) {
            translatedItem[field] = await translateContent(item[field], context);
          }
        }
        
        return translatedItem;
      })
    );

    return translatedItems;
  };

  return {
    translateContent,
    translateArray,
    isTranslating,
    language
  };
}