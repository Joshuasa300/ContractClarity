#!/usr/bin/env node

/**
 * Translation Helper Tool
 * 
 * This script helps manage translations across all languages by:
 * 1. Finding missing translation keys in each language
 * 2. Showing which keys need translation when English is updated
 * 3. Generating template structures for missing translations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read translation files
const readTranslation = (lang) => {
  try {
    const filePath = path.join(__dirname, 'client/src/translations', `${lang}.ts`);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract the export object (simple regex parsing for our structure)
    const match = content.match(/export const \w+ = ({[\s\S]*});/);
    if (match) {
      // Convert to JSON-like structure for parsing
      const objStr = match[1]
        .replace(/(\w+):/g, '"$1":')  // Quote keys
        .replace(/'/g, '"')           // Single to double quotes
        .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
      
      try {
        return JSON.parse(objStr);
      } catch (e) {
        console.warn(`Could not parse ${lang}.ts automatically. Manual check needed.`);
        return null;
      }
    }
  } catch (error) {
    console.error(`Error reading ${lang}.ts:`, error.message);
    return null;
  }
};

// Get all nested keys from an object
const getAllKeys = (obj, prefix = '') => {
  let keys = [];
  
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getAllKeys(obj[key], prefix ? `${prefix}.${key}` : key));
    } else {
      keys.push(prefix ? `${prefix}.${key}` : key);
    }
  }
  
  return keys;
};

// Find missing keys
const findMissingKeys = (baseKeys, targetKeys) => {
  return baseKeys.filter(key => !targetKeys.includes(key));
};

// Main function
const analyzeTranslations = () => {
  console.log('🌍 Translation Analysis Report\n');
  
  const languages = ['en', 'es', 'ar', 'de', 'fr'];
  const translations = {};
  
  // Load all translations
  languages.forEach(lang => {
    translations[lang] = readTranslation(lang);
  });
  
  if (!translations.en) {
    console.error('❌ Could not load English translations (base)');
    return;
  }
  
  const englishKeys = getAllKeys(translations.en);
  console.log(`📝 English has ${englishKeys.length} translation keys\n`);
  
  // Check each language
  languages.slice(1).forEach(lang => {
    if (!translations[lang]) {
      console.log(`❌ ${lang.toUpperCase()}: Could not load file\n`);
      return;
    }
    
    const langKeys = getAllKeys(translations[lang]);
    const missing = findMissingKeys(englishKeys, langKeys);
    
    if (missing.length === 0) {
      console.log(`✅ ${lang.toUpperCase()}: Complete (${langKeys.length} keys)\n`);
    } else {
      console.log(`⚠️  ${lang.toUpperCase()}: Missing ${missing.length} keys:`);
      missing.forEach(key => console.log(`   - ${key}`));
      console.log('');
    }
  });
  
  console.log('💡 Tips:');
  console.log('- When you add English text, check this report to see what needs translation');
  console.log('- Keep the nested structure consistent across all language files');
  console.log('- Use the same key paths in all language files\n');
};

// Run the analysis
analyzeTranslations();