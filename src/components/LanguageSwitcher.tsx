'use client';

import { useState } from 'react';
import { FiChevronDown, FiGlobe } from 'react-icons/fi';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const languages = [
  { code: 'en' as const, name: 'English' },
  { code: 'nl' as const, name: 'Nederlands' },
  { code: 'fr' as const, name: 'Français' },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (languageCode: 'en' | 'nl' | 'fr') => {
    setLanguage(languageCode);
    setIsOpen(false);
  };

  const currentLang = languages.find(lang => lang.code === language) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex h-9 items-center justify-center gap-1 md:gap-2 rounded-md border border-input bg-background px-2 md:px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        aria-label="Select language"
      >
        <FiGlobe className="h-4 w-4" />
        <span className="hidden lg:inline">{currentLang.code.toUpperCase()}</span>
        <FiChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-md border border-border bg-background shadow-lg">
            <div className="py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                    language === lang.code && "bg-primary/10 text-primary"
                  )}
                >
                  <span className="font-medium">{lang.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {lang.code.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
