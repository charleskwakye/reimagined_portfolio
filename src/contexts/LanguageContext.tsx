'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'nl' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translateText: (text: string) => Promise<string>;
  translateContent: (content: any, fields: string[]) => Promise<any>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Basic translations object
const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.resume': 'Resume',
    'nav.projects': 'Projects',
    'nav.internship': 'Internship',
    'nav.contact': 'Contact',
    'nav.cv': 'CV',

    // Resume page
    'resume.title': 'Resume',
    'resume.download': 'Download CV',
    'resume.coming_soon': 'CV PDF coming soon',
    'resume.education': 'Education',
    'resume.experience': 'Professional Experience',
    'resume.certifications': 'Certifications',

    // Footer
    'footer.portfolio': 'Portfolio',
    'footer.portfolio_desc': 'A showcase of my skills, projects, and professional experience.',
    'footer.quick_links': 'Quick Links',
    'footer.connect': 'Connect',
    'footer.rights': 'All rights reserved.',

    // Common terms
    'common.present': 'Present',
    'common.loading': 'Loading...',
  },
  nl: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'Over Mij',
    'nav.resume': 'CV',
    'nav.projects': 'Projecten',
    'nav.internship': 'Stage',
    'nav.contact': 'Contact',
    'nav.cv': 'CV',

    // Resume page
    'resume.title': 'Curriculum Vitae',
    'resume.download': 'CV Downloaden',
    'resume.coming_soon': 'CV PDF komt binnenkort',
    'resume.education': 'Opleiding',
    'resume.experience': 'Werkervaring',
    'resume.certifications': 'Certificaten',

    // Footer
    'footer.portfolio': 'Portfolio',
    'footer.portfolio_desc': 'Een showcase van mijn vaardigheden, projecten en professionele ervaring.',
    'footer.quick_links': 'Snelle Links',
    'footer.connect': 'Verbinden',
    'footer.rights': 'Alle rechten voorbehouden.',

    // Common terms
    'common.present': 'Huidig',
    'common.loading': 'Laden...',
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.about': 'À Propos',
    'nav.resume': 'CV',
    'nav.projects': 'Projets',
    'nav.internship': 'Stage',
    'nav.contact': 'Contact',
    'nav.cv': 'CV',

    // Resume page
    'resume.title': 'Curriculum Vitae',
    'resume.download': 'Télécharger CV',
    'resume.coming_soon': 'PDF CV à venir',
    'resume.education': 'Formation',
    'resume.experience': 'Expérience Professionnelle',
    'resume.certifications': 'Certifications',

    // Footer
    'footer.portfolio': 'Portfolio',
    'footer.portfolio_desc': 'Une vitrine de mes compétences, projets et expérience professionnelle.',
    'footer.quick_links': 'Liens Rapides',
    'footer.connect': 'Se Connecter',
    'footer.rights': 'Tous droits réservés.',

    // Common terms
    'common.present': 'Présent',
    'common.loading': 'Chargement...',
  },
};

// Simple translation mappings for common database content
const contentTranslations = {
  // Education degrees
  'Bachelor of Science in Computer Science': {
    nl: 'Bachelor of Science in Informatica',
    fr: 'Licence en Sciences Informatiques'
  },
  'Master of Science in Software Engineering': {
    nl: 'Master of Science in Software Engineering',
    fr: 'Master en Génie Logiciel'
  },

  // Common job titles
  'Senior Frontend Developer': {
    nl: 'Senior Frontend Ontwikkelaar',
    fr: 'Développeur Frontend Senior'
  },
  'Software Engineer': {
    nl: 'Software Engineer',
    fr: 'Ingénieur Logiciel'
  },
  'Full Stack Developer': {
    nl: 'Full Stack Ontwikkelaar',
    fr: 'Développeur Full Stack'
  },
  'Data Analyst': {
    nl: 'Data Analist',
    fr: 'Analyste de Données'
  },

  // Common terms
  'Present': {
    nl: 'Huidig',
    fr: 'Présent'
  },
  'Current': {
    nl: 'Huidig',
    fr: 'Actuel'
  },

  // Common locations
  'San Francisco, CA': {
    nl: 'San Francisco, CA',
    fr: 'San Francisco, CA'
  },
  'New York, NY': {
    nl: 'New York, NY',
    fr: 'New York, NY'
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['en', 'nl', 'fr'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  // Function to translate text content
  const translateText = async (text: string): Promise<string> => {
    if (language === 'en') return text;

    // Check if we have a predefined translation
    const translation = contentTranslations[text as keyof typeof contentTranslations];
    if (translation && translation[language]) {
      return translation[language];
    }

    // For now, return original text if no translation found
    // In a real app, you could integrate with Google Translate API or similar
    return text;
  };

  // Function to translate object content
  const translateContent = async (content: any, fields: string[]): Promise<any> => {
    if (language === 'en') return content;

    const translatedContent = { ...content };

    for (const field of fields) {
      if (translatedContent[field]) {
        translatedContent[field] = await translateText(translatedContent[field]);
      }
    }

    return translatedContent;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateText, translateContent }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
