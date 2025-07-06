import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/lib/i18n";

interface LanguageIndicatorProps {
  detectedLanguage?: string;
  confidence?: number;
  className?: string;
}

const LANGUAGE_NAMES = {
  'en': 'English',
  'es': 'Español',
  'fr': 'Français', 
  'de': 'Deutsch',
  'ar': 'العربية',
};

const LANGUAGE_FLAGS = {
  'en': '🇺🇸',
  'es': '🇪🇸',
  'fr': '🇫🇷',
  'de': '🇩🇪',
  'ar': '🇸🇦',
};

export function LanguageIndicator({ 
  detectedLanguage = 'en', 
  confidence = 0,
  className = "" 
}: LanguageIndicatorProps) {
  const { t } = useLanguage();
  
  const languageName = LANGUAGE_NAMES[detectedLanguage as keyof typeof LANGUAGE_NAMES] || 'Unknown';
  const flag = LANGUAGE_FLAGS[detectedLanguage as keyof typeof LANGUAGE_FLAGS] || '🌐';
  
  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'bg-green-100 text-green-800 border-green-300';
    if (conf >= 0.6) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getConfidenceText = (conf: number) => {
    if (conf >= 0.8) return t('language.highConfidence') || 'High confidence';
    if (conf >= 0.6) return t('language.mediumConfidence') || 'Medium confidence';
    return t('language.lowConfidence') || 'Low confidence';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`${getConfidenceColor(confidence)} ${className}`}
          >
            <span className="mr-1">{flag}</span>
            {languageName}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <div>{t('language.detected') || 'Detected Language'}: {languageName}</div>
            <div>{t('language.confidence') || 'Confidence'}: {Math.round(confidence * 100)}%</div>
            <div className="text-xs text-gray-500 mt-1">
              {getConfidenceText(confidence)}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}