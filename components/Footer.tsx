
import React from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-gray-200/50 dark:border-slate-700/50 py-2xl app-padding-x">
      <div className="max-w-wide mx-auto">

        {/* Functional CTA Section */}
        <div className="mb-2xl flex justify-center">
          <button
            onClick={scrollToTop}
            className="group btn-primary p-lg hover:shadow-xl max-w-md w-full"
            aria-label="Scroll to top and try intelligence search"
          >
            <div className="flex items-center justify-between mb-md">
              <Search className="w-6 h-6" />
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-display text-lg font-black tracking-tight mb-2 leading-tight">Try Intelligence Search</h3>
            <p className="text-sm text-white/95 leading-relaxed">Ask any strategic question and get AI-powered insights</p>
          </button>
        </div>

        {/* Footer Links */}
        <div className="flex justify-center mb-xl">
          <div className="max-w-lg space-y-md">
            <Logo variant="terminal" className="h-8" />
            <p className="max-w-md text-base text-gray-700 dark:text-gray-200 leading-relaxed">
              AI-powered strategic intelligence for marketing leaders. Real-time insights, competitive analysis, and actionable data to drive revenue growth.
            </p>
          </div>


        </div>

        <div className="pt-8 border-t border-gray-200/50 dark:border-slate-700/50 flex flex-col md:flex-row justify-center items-center gap-4 text-sm text-gray-500 dark:text-gray-300">
          <div>&copy; {new Date().getFullYear()} signal2noise. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
};
