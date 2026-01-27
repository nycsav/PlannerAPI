import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleTheme();
  };

  if (!mounted) {
    // Return a placeholder with the same dimensions to prevent layout shift
    return (
      <div className="relative w-12 h-6 rounded-full bg-gray-300">
        <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md" />
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="relative w-12 h-6 rounded-full bg-gray-300 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-bureau-signal focus:ring-offset-2 dark:focus:ring-offset-gray-800 cursor-pointer"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      type="button"
    >
      <div
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white dark:bg-gray-900 shadow-md transform transition-transform duration-200 ${
          theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
        }`}
      >
        <div className="flex items-center justify-center h-full">
          {theme === 'light' ? (
            <Sun className="w-3 h-3 text-yellow-500" />
          ) : (
            <Moon className="w-3 h-3 text-blue-400" />
          )}
        </div>
      </div>
    </button>
  );
};
