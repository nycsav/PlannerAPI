
import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { FloatingActionButton } from './FloatingActionButton';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-bureau-signal/10 selection:text-bureau-ink">
      <Navbar />
      <div className="flex-grow w-full">
        {children}
      </div>
      <FloatingActionButton />
      <Footer />
    </div>
  );
};
