
import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { FloatingActionButton } from './FloatingActionButton';

interface LayoutProps {
  children: React.ReactNode;
  onSignupClick?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onSignupClick }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-bureau-signal/10 dark:selection:bg-bureau-signal/20 selection:text-bureau-ink dark:selection:text-dark-ink bg-white dark:bg-slate-900 transition-colors duration-200">
      <Navbar onSignupClick={onSignupClick} />
      <div className="flex-grow w-full bg-white dark:bg-slate-900 transition-colors duration-200">
        {children}
      </div>
      <FloatingActionButton />
      <Footer />
    </div>
  );
};
