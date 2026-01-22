
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
    <div className="min-h-screen flex flex-col font-sans selection:bg-bureau-signal/10 selection:text-bureau-ink">
      <Navbar onSignupClick={onSignupClick} />
      <div className="flex-grow w-full">
        {children}
      </div>
      <FloatingActionButton />
      <Footer />
    </div>
  );
};
