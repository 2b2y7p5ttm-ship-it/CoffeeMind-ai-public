import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { enTranslations, interpolate, ruTranslations, type TranslationKey, type TranslationVariables } from '@/lib/i18n';
import { dispatchLocalStorageChange, LOCAL_STORAGE_EVENT, type LocalStorageChangeDetail } from '@/lib/localStorageEvents';
import { LANGUAGE_STORAGE_KEY, PREFERENCES_UPDATED_AT_KEY } from '@/lib/cloudState';

export type LanguageMode = 'system' | 'ru' | 'en';
export type AppLanguage = 'ru' | 'en';

interface LanguageContextValue {
  mode: LanguageMode;
  language: AppLanguage;
  locale: 'ru-RU' | 'en-US';
  setMode: (mode: LanguageMode) => void;
  t: (key: TranslationKey, variables?: TranslationVariables) => string;
}

const STORAGE_KEY = LANGUAGE_STORAGE_KEY;

function systemLanguage(): AppLanguage {
  if (typeof navigator === 'undefined') return 'ru';
  return navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

function readMode(): LanguageMode {
  if (typeof window === 'undefined') return 'system';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === 'ru' || saved === 'en' || saved === 'system' ? saved : 'system';
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<LanguageMode>(readMode);
  const [detectedLanguage, setDetectedLanguage] = useState<AppLanguage>(systemLanguage);
  const language = mode === 'system' ? detectedLanguage : mode;

  useEffect(() => {
    const syncStoredLanguage = (event: Event) => {
      const detail = (event as CustomEvent<LocalStorageChangeDetail>).detail;
      if (detail?.key !== STORAGE_KEY) return;
      const nextMode = readMode();
      setModeState(nextMode);
    };
    window.addEventListener(LOCAL_STORAGE_EVENT, syncStoredLanguage);
    return () => window.removeEventListener(LOCAL_STORAGE_EVENT, syncStoredLanguage);
  }, []);
  const locale: 'ru-RU' | 'en-US' = language === 'ru' ? 'ru-RU' : 'en-US';

  useEffect(() => {
    const handleLanguageChange = () => setDetectedLanguage(systemLanguage());
    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = 'CoffeeMind';
  }, [language]);

  const setMode = useCallback((nextMode: LanguageMode) => {
    window.localStorage.setItem(STORAGE_KEY, nextMode);
    const updatedAt = new Date().toISOString();
    window.localStorage.setItem(PREFERENCES_UPDATED_AT_KEY, updatedAt);
    dispatchLocalStorageChange(STORAGE_KEY, nextMode);
    setModeState(nextMode);
  }, []);

  const t = useCallback((key: TranslationKey, variables?: TranslationVariables) => {
    const dictionary = language === 'ru' ? ruTranslations : enTranslations;
    return interpolate(dictionary[key] ?? ruTranslations[key] ?? key, variables);
  }, [language]);

  const value = useMemo(() => ({ mode, language, locale, setMode, t }), [language, locale, mode, setMode, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}
