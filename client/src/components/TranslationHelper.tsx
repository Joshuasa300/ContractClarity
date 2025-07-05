import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Copy, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface TranslationResult {
  en: string;
  es: string;
  ar: string;
  de: string;
  fr: string;
}

const languageNames = {
  en: 'English',
  es: 'Español',
  ar: 'العربية',
  de: 'Deutsch',
  fr: 'Français'
};

const languageFlags = {
  en: '🇺🇸',
  es: '🇪🇸', 
  ar: '🇸🇦',
  de: '🇩🇪',
  fr: '🇫🇷'
};

export default function TranslationHelper() {
  const [text, setText] = useState('');
  const [context, setContext] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translations, setTranslations] = useState<TranslationResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { toast } = useToast();

  const translateText = async () => {
    if (!text.trim()) {
      toast({ 
        title: 'Error', 
        description: 'Please enter text to translate',
        variant: 'destructive'
      });
      return;
    }

    setIsTranslating(true);
    try {
      const response = await fetch('/api/translate/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), context: context.trim() || undefined })
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const result = await response.json();
      setTranslations(result);
      
      toast({
        title: 'Success',
        description: 'Text translated to all languages!'
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to translate text. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const copyToClipboard = async (text: string, lang: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(lang);
      setTimeout(() => setCopiedKey(null), 2000);
      
      toast({
        title: 'Copied',
        description: `${languageNames[lang as keyof typeof languageNames]} text copied to clipboard`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive'
      });
    }
  };

  const generateTranslationCode = () => {
    if (!translations) return '';
    
    return Object.entries(translations)
      .map(([lang, text]) => `${lang}: '${text.replace(/'/g, "\\'")}',`)
      .join('\n');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🌍 Automatic Translation Helper
            <Badge variant="secondary">AI-Powered</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              English Text to Translate
            </label>
            <Textarea
              placeholder="Enter English text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Context (Optional)
            </label>
            <Input
              placeholder="e.g., navigation menu, landing page hero, button text..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>

          <Button 
            onClick={translateText} 
            disabled={isTranslating || !text.trim()}
            className="w-full"
          >
            {isTranslating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Translating...
              </>
            ) : (
              'Translate to All Languages'
            )}
          </Button>
        </CardContent>
      </Card>

      {translations && (
        <Card>
          <CardHeader>
            <CardTitle>Translation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {Object.entries(translations).map(([lang, translatedText]) => (
                <div key={lang} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{languageFlags[lang as keyof typeof languageFlags]}</span>
                      <span className="font-medium">
                        {languageNames[lang as keyof typeof languageNames]}
                      </span>
                      {lang === 'en' && <Badge variant="outline">Original</Badge>}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(translatedText, lang)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedKey === lang ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p 
                    className={`text-sm bg-gray-50 p-3 rounded ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                    dir={lang === 'ar' ? 'rtl' : 'ltr'}
                  >
                    {translatedText}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">Ready-to-use Translation Code:</h4>
              <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                <code>{generateTranslationCode()}</code>
              </pre>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(generateTranslationCode(), 'code')}
                className="mt-2"
              >
                Copy Code
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>How to use:</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Enter your English text above</li>
              <li>Add context if needed (helps with accuracy)</li>
              <li>Click translate - AI will generate all 5 languages</li>
              <li>Copy the generated code and paste into your translation files</li>
              <li>The system automatically detects missing translations in development</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}