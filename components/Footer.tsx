
import React from 'react';
import { Github, Twitter, Linkedin, ArrowRight, Search, FileText, Cpu } from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-gray-200/50 dark:border-slate-700/50 py-2xl app-padding-x">
      <div className="max-w-wide mx-auto">

        {/* Functional CTA Section */}
        <div className="mb-2xl grid grid-cols-1 md:grid-cols-3 gap-md">
          <button
            onClick={scrollToTop}
            className="group bg-bureau-ink dark:bg-planner-orange hover:bg-gray-800 dark:hover:bg-planner-orange/90 text-white p-lg rounded-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] border-2 border-bureau-ink dark:border-planner-orange hover:border-bureau-signal dark:hover:border-planner-orange focus:outline-none focus:ring-2 focus:ring-bureau-signal dark:focus:ring-planner-orange focus:ring-offset-2"
            aria-label="Scroll to top and try intelligence search"
          >
            <div className="flex items-center justify-between mb-md">
              <Search className="w-6 h-6" />
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-display text-lg font-black italic mb-2">TRY INTELLIGENCE SEARCH</h3>
            <p className="text-sm text-gray-200 dark:text-gray-200">Ask any strategic question and get AI-powered insights</p>
          </button>

          <button
            onClick={() => {
              // Find Daily Intelligence section by ID
              const section = document.querySelector('#01');
              if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="group bg-white dark:bg-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-700/80 text-bureau-ink dark:text-gray-100 p-lg rounded-2xl transition-all duration-200 hover:shadow-lg dark:hover:shadow-planner-orange/10 hover:scale-[1.02] active:scale-[0.98] border border-gray-200/60 dark:border-slate-700/50 hover:border-bureau-signal/60 dark:hover:border-planner-orange/60 focus:outline-none focus:ring-2 focus:ring-bureau-signal dark:focus:ring-planner-orange focus:ring-offset-2"
            aria-label="Explore briefings"
          >
            <div className="flex items-center justify-between mb-md">
              <FileText className="w-6 h-6 text-bureau-ink dark:text-gray-100" />
              <ArrowRight className="w-5 h-5 text-bureau-ink dark:text-gray-100 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-display text-lg font-black italic mb-2 text-bureau-ink dark:text-gray-100">EXPLORE BRIEFINGS</h3>
            <p className="text-sm text-gray-600 dark:text-gray-200">Review latest market intelligence and strategic analysis</p>
          </button>

          <button
            onClick={() => {
              // Find Strategic Frameworks section by ID
              const section = document.querySelector('#02');
              if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="group bg-white dark:bg-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-700/80 text-bureau-ink dark:text-gray-100 p-lg rounded-2xl transition-all duration-200 hover:shadow-lg dark:hover:shadow-planner-orange/10 hover:scale-[1.02] active:scale-[0.98] border border-gray-200/60 dark:border-slate-700/50 hover:border-bureau-signal/60 dark:hover:border-planner-orange/60 focus:outline-none focus:ring-2 focus:ring-bureau-signal dark:focus:ring-planner-orange focus:ring-offset-2"
            aria-label="See how it works"
          >
            <div className="flex items-center justify-between mb-md">
              <Cpu className="w-6 h-6 text-bureau-ink dark:text-gray-100" />
              <ArrowRight className="w-5 h-5 text-bureau-ink dark:text-gray-100 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-display text-lg font-black italic mb-2 text-bureau-ink dark:text-gray-100">SEE HOW IT WORKS</h3>
            <p className="text-sm text-gray-600 dark:text-gray-200">Learn about our AI-powered intelligence capabilities</p>
          </button>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-xl mb-xl">
          <div className="md:col-span-2 space-y-md">
            <Logo variant="terminal" className="h-8" />
            <p className="max-w-md text-base text-gray-600 dark:text-gray-200 leading-relaxed">
              AI-powered strategic intelligence for marketing leaders. Real-time insights, competitive analysis, and actionable data to drive revenue growth.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-3 bg-gray-100 dark:bg-slate-800/50 hover:bg-bureau-signal dark:hover:bg-planner-orange hover:text-white rounded-xl transition-all border border-gray-200/30 dark:border-slate-700/30"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="p-3 bg-gray-100 dark:bg-slate-800/50 hover:bg-bureau-signal dark:hover:bg-planner-orange hover:text-white rounded-xl transition-all border border-gray-200/30 dark:border-slate-700/30"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="p-3 bg-gray-100 dark:bg-slate-800/50 hover:bg-bureau-signal dark:hover:bg-planner-orange hover:text-white rounded-xl transition-all border border-gray-200/30 dark:border-slate-700/30"><Github className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-black text-gray-900 dark:text-slate-100 mb-4 italic">FOR CMOS</h4>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-200">
              <li><a href="#" className="hover:text-bureau-signal dark:hover:text-planner-orange transition-colors">Strategic Planning</a></li>
              <li><a href="#" className="hover:text-bureau-signal dark:hover:text-planner-orange transition-colors">Budget Optimization</a></li>
              <li><a href="#" className="hover:text-bureau-signal dark:hover:text-planner-orange transition-colors">Board Reporting</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-black text-gray-900 dark:text-slate-100 mb-4 italic">FOR GROWTH TEAMS</h4>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-200">
              <li><a href="#" className="hover:text-bureau-signal dark:hover:text-planner-orange transition-colors">Performance Tracking</a></li>
              <li><a href="#" className="hover:text-bureau-signal dark:hover:text-planner-orange transition-colors">A/B Testing Insights</a></li>
              <li><a href="#" className="hover:text-bureau-signal dark:hover:text-planner-orange transition-colors">Conversion Analytics</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200/50 dark:border-slate-700/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-300">
          <div>&copy; {new Date().getFullYear()} plannerAPI. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-bureau-signal dark:hover:text-planner-orange transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-bureau-signal dark:hover:text-planner-orange transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-bureau-signal dark:hover:text-planner-orange transition-colors">Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
