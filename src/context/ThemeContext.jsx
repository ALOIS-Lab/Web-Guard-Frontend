import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'webguard_theme';
const ThemeContext = createContext(null);

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(preference) {
  if (preference === 'system') return getSystemTheme();
  return preference;
}

function applyTheme(resolved) {
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'system';
    } catch {
      return 'system';
    }
  });

  const theme = useMemo(() => resolveTheme(preference), [preference]);

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      /* ignore */
    }
  }, [preference, theme]);

  useEffect(() => {
    if (preference !== 'system') return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme(getSystemTheme());
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [preference]);

  const setPreference = useCallback((next) => {
    setPreferenceState(next);
  }, []);

  const toggle = useCallback(() => {
    setPreferenceState((prev) => {
      const current = resolveTheme(prev);
      return current === 'dark' ? 'light' : 'dark';
    });
  }, []);

  const value = useMemo(
    () => ({ preference, theme, setPreference, toggle, isDark: theme === 'dark' }),
    [preference, theme, setPreference, toggle]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
