'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TranslatedTextProps {
  text: string;
  fallback?: string;
}

export function TranslatedText({ text, fallback }: TranslatedTextProps) {
  const { translateText, language } = useLanguage();
  const [translatedText, setTranslatedText] = useState(text);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const translate = async () => {
      if (language === 'en') {
        setTranslatedText(text);
        return;
      }

      setIsLoading(true);
      try {
        const translated = await translateText(text);
        setTranslatedText(translated);
      } catch (error) {
        console.error('Translation error:', error);
        setTranslatedText(fallback || text);
      } finally {
        setIsLoading(false);
      }
    };

    translate();
  }, [text, language, translateText, fallback]);

  if (isLoading) {
    return <span className="animate-pulse">{text}</span>;
  }

  return <>{translatedText}</>;
}

interface TranslatedDateProps {
  date: Date;
  options?: Intl.DateTimeFormatOptions;
}

export function TranslatedDate({ date, options }: TranslatedDateProps) {
  const { language } = useLanguage();

  const localeMap = {
    en: 'en-US',
    nl: 'nl-NL',
    fr: 'fr-FR'
  };

  return <>{date.toLocaleDateString(localeMap[language], options)}</>;
}

interface TranslatedPresentProps {
  current: boolean;
}

export function TranslatedPresent({ current }: TranslatedPresentProps) {
  const { t } = useLanguage();

  if (!current) return null;

  return <>{t('common.present')}</>;
}
