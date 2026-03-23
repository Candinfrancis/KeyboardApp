import React, { createContext, useContext, useMemo, useState } from 'react';
import { KeyboardTheme, ThemeName, themes } from './themes';

interface ThemeContextValue {
  theme: KeyboardTheme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: ThemeName;
}

export function ThemeProvider({
  children,
  initialTheme = 'light',
}: ThemeProviderProps) {
  const [themeName, setThemeName] = useState<ThemeName>(initialTheme);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: themes[themeName],
      themeName,
      setTheme: setThemeName,
      toggleTheme: () =>
        setThemeName(current => (current === 'light' ? 'dark' : 'light')),
    }),
    [themeName],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeManager(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeManager must be used within ThemeProvider');
  }

  return context;
}
