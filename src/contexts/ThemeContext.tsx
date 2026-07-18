import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { dispatchLocalStorageChange, LOCAL_STORAGE_EVENT, type LocalStorageChangeDetail } from '@/lib/localStorageEvents';
import { PREFERENCES_UPDATED_AT_KEY, THEME_STORAGE_KEY } from '@/lib/cloudState';

export type ThemeMode = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  mode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = THEME_STORAGE_KEY;

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
  });
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => getSystemTheme());

  useEffect(() => {
    const syncStoredTheme = (event: Event) => {
      const detail = (event as CustomEvent<LocalStorageChangeDetail>).detail;
      if (detail?.key !== STORAGE_KEY) return;
      const nextMode = localStorage.getItem(STORAGE_KEY);
      if (nextMode === 'light' || nextMode === 'dark' || nextMode === 'system') setModeState(nextMode);
    };
    window.addEventListener(LOCAL_STORAGE_EVENT, syncStoredTheme);
    return () => window.removeEventListener(LOCAL_STORAGE_EVENT, syncStoredTheme);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemTheme(media.matches ? 'dark' : 'light');
    media.addEventListener?.('change', onChange);
    return () => media.removeEventListener?.('change', onChange);
  }, []);

  const resolvedTheme = mode === 'system' ? systemTheme : mode;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('theme-transitioning');
    root.classList.toggle('dark', resolvedTheme === 'dark');
    root.classList.toggle('light', resolvedTheme === 'light');
    root.style.colorScheme = resolvedTheme;
    const storedMode = localStorage.getItem(STORAGE_KEY);
    localStorage.setItem(STORAGE_KEY, mode);
    if (storedMode !== mode) {
      const updatedAt = new Date().toISOString();
      localStorage.setItem(PREFERENCES_UPDATED_AT_KEY, updatedAt);
      dispatchLocalStorageChange(STORAGE_KEY, mode);
    }

    const timeout = window.setTimeout(() => root.classList.remove('theme-transitioning'), 460);
    return () => window.clearTimeout(timeout);
  }, [mode, resolvedTheme]);

  const value = useMemo<ThemeContextValue>(() => ({
    mode,
    resolvedTheme,
    setMode: setModeState,
    toggleTheme: () => setModeState(resolvedTheme === 'dark' ? 'light' : 'dark'),
  }), [mode, resolvedTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside ThemeProvider');
  return value;
}
