import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize theme from localStorage or system preference
  const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return 'light';
    
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  };

  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [mounted, setMounted] = useState(false);

  // Apply theme to document on mount and when theme changes
  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    
    // Remove any existing theme classes first
    root.classList.remove('light', 'dark');
    
    // Add the current theme class
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.add('light');
    }
    
    // Also ensure body gets the class for CSS variable updates
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
    
    // Debug log (remove in production)
    console.log('[ThemeContext] Theme set to:', theme, 'HTML classes:', root.className);
  }, [theme]);

  // Listen for system theme changes (only if no manual preference)
  useEffect(() => {
    if (!mounted) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem('theme')) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    // Use addListener for older browsers, addEventListener for modern
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [mounted]);

  const toggleTheme = () => {
    setThemeState(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      // Apply immediately for instant feedback
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(newTheme);
      
      // Also update body class
      document.body.classList.remove('light', 'dark');
      document.body.classList.add(newTheme);
      
      // Force style update to ensure CSS applies
      if (newTheme === 'dark') {
        root.style.colorScheme = 'dark';
        document.body.style.backgroundColor = '#0F172A';
      } else {
        root.style.colorScheme = 'light';
        document.body.style.backgroundColor = '#FFFFFF';
      }
      
      localStorage.setItem('theme', newTheme);
      console.log('[ThemeContext] Theme toggled to:', newTheme, 'HTML class:', root.className);
      return newTheme;
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
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
