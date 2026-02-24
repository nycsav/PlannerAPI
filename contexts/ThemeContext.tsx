import React, { createContext, useContext, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/** Site is always dark; no light theme or prefers-color-scheme. */
const FORCED_THEME: Theme = 'dark';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(FORCED_THEME);
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(FORCED_THEME);
    document.body.style.backgroundColor = '#0d1117';
    root.style.colorScheme = 'dark';
    localStorage.setItem('theme', FORCED_THEME);
  }, []);

  const toggleTheme = () => {
    /* No-op: site is always dark. Kept for API compatibility. */
  };

  const setTheme = (_newTheme: Theme) => {
    /* Ignore: site is always dark. Kept for API compatibility. */
  };

  return (
    <ThemeContext.Provider value={{ theme: FORCED_THEME, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
