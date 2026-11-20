import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext(null);
const LANG_STORAGE_KEY = 'kes_lang';

function resolveNestedPath(obj, path) {
  if (!obj || !path) return undefined;
  return String(path)
    .split('.')
    .reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      return saved === 'kn' ? 'kn' : 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, language);
    } catch {
      // Ignore storage errors
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang === 'kn' ? 'kn' : 'en');
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === 'kn' ? 'en' : 'kn'));
  }, []);

  /**
   * Look up dot-notation key in translations[language], falling back to English or fallback string.
   */
  const t = useCallback(
    (key, fallback) => {
      const primary = resolveNestedPath(translations[language], key);
      if (primary !== undefined) return primary;

      const enFallback = resolveNestedPath(translations.en, key);
      if (enFallback !== undefined) return enFallback;

      return fallback !== undefined ? fallback : key;
    },
    [language]
  );

  /**
   * For dynamic MongoDB CMS records (SiteContent, Notices):
   * Returns doc[`${field}Kn`] when language === 'kn' and non-empty, else falls back to doc[field].
   */
  const tContent = useCallback(
    (doc, field) => {
      if (!doc || !field) return '';
      if (language === 'kn') {
        const knVal = doc[`${field}Kn`];
        if (knVal !== undefined && knVal !== null && String(knVal).trim() !== '') {
          return knVal;
        }
      }
      return doc[field] || '';
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        tContent,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
