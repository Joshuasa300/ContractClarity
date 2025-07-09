import OpenAI from 'openai';
import { storage } from '../storage';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface TranslationRequest {
  text: string;
  targetLanguage: 'es' | 'ar' | 'de' | 'fr';
  context?: string;
  userId?: string;
}

export interface TranslationResponse {
  translatedText: string;
  language: string;
}

const languageMap = {
  es: 'Spanish',
  ar: 'Arabic', 
  de: 'German',
  fr: 'French'
};

export async function translateText({ text, targetLanguage, context, userId }: TranslationRequest): Promise<TranslationResponse> {
  try {
    // Check usage limits before making API call
    if (userId) {
      const usageCheck = await storage.checkUsageLimit(userId, 'translation');
      if (!usageCheck.allowed) {
        throw new Error(`Translation usage limit exceeded. Daily limit: ${usageCheck.limit}, Current usage: ${usageCheck.current}`);
      }
    }

    const targetLanguageName = languageMap[targetLanguage];
    
    const prompt = `You are a professional translator specializing in legal and business terminology. 
    
Context: This is for a contract analysis application called "ContractAI" that helps users understand legal documents.

Translate the following English text to ${targetLanguageName}:

"${text}"

Requirements:
- Maintain professional, clear tone suitable for legal/business context
- Keep any brand names (like "ContractAI") unchanged
- Ensure the translation is natural and culturally appropriate
- For legal terminology, use standard legal translations in the target language
${context ? `- Additional context: ${context}` : ''}

Return only the translated text, no explanations or quotes.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent translations
      max_tokens: 500
    });

    // Track token usage
    if (userId && response.usage) {
      await storage.recordTokenUsage({
        userId,
        operation: 'translation',
        tokensUsed: response.usage.total_tokens,
        inputTokens: response.usage.prompt_tokens,
        outputTokens: response.usage.completion_tokens,
        model: 'gpt-4o',
        cost: calculateCost(response.usage.total_tokens)
      });
    }

    const translatedText = response.choices[0].message.content?.trim() || text;

    return {
      translatedText,
      language: targetLanguage
    };
  } catch (error) {
    console.error(`Translation error for ${targetLanguage}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to translate to ${targetLanguage}: ${errorMessage}`);
  }
}

// Calculate cost for translation tokens
function calculateCost(tokens: number): number {
  const costPerToken = 0.0000025; // Average cost per token
  return tokens * costPerToken;
}

export async function translateToAllLanguages(text: string, context?: string): Promise<Record<string, string>> {
  const languages: Array<'es' | 'ar' | 'de' | 'fr'> = ['es', 'ar', 'de', 'fr'];
  const translations: Record<string, string> = { en: text }; // Include original English

  try {
    // Translate to all languages in parallel for efficiency
    const translationPromises = languages.map(async (lang) => {
      const result = await translateText({ text, targetLanguage: lang, context });
      return { language: lang, translation: result.translatedText };
    });

    const results = await Promise.all(translationPromises);
    
    results.forEach(({ language, translation }) => {
      translations[language] = translation;
    });

    return translations;
  } catch (error) {
    console.error('Batch translation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to translate to all languages: ${errorMessage}`);
  }
}

export async function translateObjectToAllLanguages(
  englishObject: Record<string, any>, 
  context?: string
): Promise<Record<string, Record<string, any>>> {
  const result: Record<string, Record<string, any>> = {
    en: englishObject
  };

  const languages: Array<'es' | 'ar' | 'de' | 'fr'> = ['es', 'ar', 'de', 'fr'];

  for (const lang of languages) {
    result[lang] = await translateObjectStructure(englishObject, lang, context);
  }

  return result;
}

async function translateObjectStructure(
  obj: Record<string, any>, 
  targetLanguage: 'es' | 'ar' | 'de' | 'fr',
  context?: string
): Promise<Record<string, any>> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      const translation = await translateText({ 
        text: value, 
        targetLanguage, 
        context: `${context} - Key: ${key}` 
      });
      result[key] = translation.translatedText;
    } else if (typeof value === 'object' && value !== null) {
      result[key] = await translateObjectStructure(value, targetLanguage, context);
    } else {
      result[key] = value; // Keep non-string values as-is
    }
  }

  return result;
}