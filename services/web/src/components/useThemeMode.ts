import { useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const storageKey = 'app-theme';

function readThemeMode(): ThemeMode {
  const value = window.localStorage.getItem(storageKey);
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode !== 'system') return mode;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useThemeMode() {
  const [mode, setMode] = useState<ThemeMode>(readThemeMode);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(mode));

  useEffect(() => {
    window.localStorage.setItem(storageKey, mode);
    setResolvedTheme(resolveTheme(mode));
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemTheme = (event: MediaQueryListEvent) => {
      if (mode === 'system') setResolvedTheme(event.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', updateSystemTheme);
    return () => mediaQuery.removeEventListener('change', updateSystemTheme);
  }, [mode]);

  const cycleMode = () => setMode((current) => current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system');
  return { mode, resolvedTheme, cycleMode };
}