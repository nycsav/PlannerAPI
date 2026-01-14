
import React from 'react';
import { Github, Twitter, Linkedin, ArrowRight, Search, FileText, Cpu } from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t border-gray-200 py-2xl app-padding-x">
      <div className="max-w-wide mx-auto">

        {/* Functional CTA Section */}
        <div className="mb-2xl grid grid-cols-1 md:grid-cols-3 gap-md">
          <button
            onClick={scrollToTop}
            className="group bg-bureau-ink hover:bg-gray-800 text-white p-lg rounded-lg transition-all hover:shadow-lg border-2 border-bureau-ink hover:border-bureau-signal"
          >
            <div className="flex items-center justify-between mb-md">
              <Search className="w-6 h-6" />
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-display text-lg font-black italic mb-2">TRY INTELLIGENCE SEARCH</h3>
            <p className="text-sm text-gray-300">Ask any strategic question and get AI-powered insights</p>
          </button>

          <button
            onClick={() => {
              const section = document.querySelector('[class*="Intelligence Briefings"]')?.closest('section');
              section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="group bg-white hover:bg-gray-50 text-bureau-ink p-lg rounded-lg transition-all border-2 border-gray-200 hover:border-bureau-signal"
          >
            <div className="flex items-center justify-between mb-md">
              <FileText className="w-6 h-6" />
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-display text-lg font-black italic mb-2">EXPLORE BRIEFINGS</h3>
            <p className="text-sm text-gray-600">Review latest market intelligence and strategic analysis</p>
          </button>

          <button
            onClick={() => {
              const section = document.querySelector('[class*="Strategic Decision"]')?.closest('section');
              section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="group bg-white hover:bg-gray-50 text-bureau-ink p-lg rounded-lg transition-all border-2 border-gray-200 hover:border-bureau-signal"
          >
            <div className="flex items-center justify-between mb-md">
              <Cpu className="w-6 h-6" />
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-display text-lg font-black italic mb-2">SEE HOW IT WORKS</h3>
            <p className="text-sm text-gray-600">Learn about our AI-powered intelligence capabilities</p>
          </button>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-xl mb-xl">
          <div className="md:col-span-2 space-y-md">
            <Logo variant="terminal" className="h-8" />
            <p className="max-w-md text-base text-gray-600 leading-relaxed">
              AI-powered strategic intelligence for marketing leaders. Real-time insights, competitive analysis, and actionable data to drive revenue growth.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-3 bg-gray-100 hover:bg-bureau-signal hover:text-white rounded-lg transition-all"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="p-3 bg-gray-100 hover:bg-bureau-signal hover:text-white rounded-lg transition-all"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="p-3 bg-gray-100 hover:bg-bureau-signal hover:text-white rounded-lg transition-all"><Github className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-black text-gray-900 mb-4 italic">FOR CMOS</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><a href="#" className="hover:text-bureau-signal transition-colors">Strategic Planning</a></li>
              <li><a href="#" className="hover:text-bureau-signal transition-colors">Budget Optimization</a></li>
              <li><a href="#" className="hover:text-bureau-signal transition-colors">Board Reporting</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-black text-gray-900 mb-4 italic">FOR GROWTH TEAMS</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><a href="#" className="hover:text-bureau-signal transition-colors">Performance Tracking</a></li>
              <li><a href="#" className="hover:text-bureau-signal transition-colors">A/B Testing Insights</a></li>
              <li><a href="#" className="hover:text-bureau-signal transition-colors">Conversion Analytics</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div>&copy; {new Date().getFullYear()} plannerAPI. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-bureau-signal">Privacy Policy</a>
            <a href="#" className="hover:text-bureau-signal">Terms of Service</a>
            <a href="#" className="hover:text-bureau-signal">Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
