import OpenAI from 'openai';
import * as fs from 'fs/promises';
import * as path from 'path';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface TranslationFile {
  language: string;
  path: string;
  content: Record<string, any>;
}

interface SyncReport {
  language: string;
  missingKeys: string[];
  outdatedKeys: string[];
  newTranslations: Record<string, string>;
}

export class TranslationSyncService {
  private readonly translationsDir = path.join(process.cwd(), 'client/src/translations');
  private readonly languages = ['es', 'ar', 'de', 'fr'];

  async detectOutOfSyncTranslations(): Promise<SyncReport[]> {
    const englishContent = await this.loadTranslationFile('en');
    const reports: SyncReport[] = [];

    for (const lang of this.languages) {
      try {
        const langContent = await this.loadTranslationFile(lang);
        const report = await this.compareTranslations(englishContent, langContent, lang);
        reports.push(report);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error processing ${lang}:`, errorMessage);
      }
    }

    return reports;
  }

  async autoSyncAllLanguages(): Promise<{ success: boolean; reports: SyncReport[] }> {
    try {
      const reports = await this.detectOutOfSyncTranslations();
      
      for (const report of reports) {
        if (report.missingKeys.length > 0 || report.outdatedKeys.length > 0) {
          await this.updateLanguageFile(report);
        }
      }

      return { success: true, reports };
    } catch (error) {
      console.error('Auto-sync failed:', error);
      return { success: false, reports: [] };
    }
  }

  private async loadTranslationFile(language: string): Promise<Record<string, any>> {
    const filePath = path.join(this.translationsDir, `${language}.ts`);
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Extract the export object using regex (simplified parsing)
    const match = content.match(/export const \w+ = ({[\s\S]*});/);
    if (!match) {
      throw new Error(`Could not parse ${language}.ts`);
    }

    // Use Function constructor to safely evaluate the object
    const objectStr = match[1];
    try {
      // Convert TS object notation to JSON-like format
      const jsonStr = this.convertTsObjectToJson(objectStr);
      return JSON.parse(jsonStr);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
      throw new Error(`Could not parse object in ${language}.ts: ${errorMessage}`);
    }
  }

  private convertTsObjectToJson(tsObject: string): string {
    return tsObject
      .replace(/(\w+):/g, '"$1":')     // Quote property names
      .replace(/'/g, '"')              // Convert single quotes to double
      .replace(/,(\s*[}\]])/g, '$1');  // Remove trailing commas
  }

  private async compareTranslations(
    englishContent: Record<string, any>, 
    langContent: Record<string, any>, 
    language: string
  ): Promise<SyncReport> {
    const englishKeys = this.getAllKeys(englishContent);
    const langKeys = this.getAllKeys(langContent);
    
    const missingKeys = englishKeys.filter(key => !langKeys.includes(key));
    
    // For now, we'll focus on missing keys. Detecting "outdated" keys would require
    // tracking modification times or content hashes, which is more complex.
    const outdatedKeys: string[] = [];

    const newTranslations: Record<string, string> = {};
    
    if (missingKeys.length > 0) {
      // Translate missing keys
      for (const key of missingKeys) {
        const englishValue = this.getNestedValue(englishContent, key);
        if (typeof englishValue === 'string') {
          try {
            const translation = await this.translateSingleText(englishValue, language, key);
            newTranslations[key] = translation;
          } catch (error) {
            console.error(`Failed to translate ${key} to ${language}:`, error);
          }
        }
      }
    }

    return {
      language,
      missingKeys,
      outdatedKeys,
      newTranslations
    };
  }

  private async translateSingleText(text: string, targetLanguage: string, context: string): Promise<string> {
    const languageMap: Record<string, string> = {
      es: 'Spanish',
      ar: 'Arabic',
      de: 'German',
      fr: 'French'
    };

    const targetLanguageName = languageMap[targetLanguage];
    
    const prompt = `You are a professional translator for a legal contract analysis application called "ContractAI".

Translate this English text to ${targetLanguageName}:
"${text}"

Context: ${context}

Requirements:
- Maintain professional tone suitable for legal/business interface
- Keep brand names unchanged
- Use standard legal terminology in target language
- Be concise and clear

Return only the translation, no explanations.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 200
    });

    return response.choices[0].message.content?.trim() || text;
  }

  private async updateLanguageFile(report: SyncReport): Promise<void> {
    const filePath = path.join(this.translationsDir, `${report.language}.ts`);
    let content = await fs.readFile(filePath, 'utf-8');

    // For each missing key, add it to the file
    for (const [key, translation] of Object.entries(report.newTranslations)) {
      content = this.insertTranslationIntoFile(content, key, translation);
    }

    await fs.writeFile(filePath, content, 'utf-8');
    console.log(`Updated ${report.language}.ts with ${Object.keys(report.newTranslations).length} new translations`);
  }

  private insertTranslationIntoFile(content: string, key: string, translation: string): string {
    const keyParts = key.split('.');
    
    if (keyParts.length === 1) {
      // Top-level key
      const insertPoint = content.lastIndexOf('};');
      const newEntry = `  '${key}': '${translation.replace(/'/g, "\\'")}',\n`;
      return content.slice(0, insertPoint) + newEntry + content.slice(insertPoint);
    } else {
      // Nested key - this is more complex, for now we'll add as flat key
      const insertPoint = content.lastIndexOf('};');
      const newEntry = `  '${key}': '${translation.replace(/'/g, "\\'")}',\n`;
      return content.slice(0, insertPoint) + newEntry + content.slice(insertPoint);
    }
  }

  private getAllKeys(obj: any, prefix = ''): string[] {
    let keys: string[] = [];
    
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        keys = keys.concat(this.getAllKeys(obj[key], prefix ? `${prefix}.${key}` : key));
      } else {
        keys.push(prefix ? `${prefix}.${key}` : key);
      }
    }
    
    return keys;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }
}

export const translationSyncService = new TranslationSyncService();