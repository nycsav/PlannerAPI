
import React from 'react';
import { Github, Twitter, Linkedin, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-bureau-ink/5 text-bureau-ink/40 py-2xl app-padding-x">
      <div className="max-w-wide mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-xl mb-xl">
          <div className="md:col-span-2 space-y-md">
            <Logo variant="terminal" className="h-6" />
            <p className="max-w-sm text-sm font-sans font-medium leading-impeccable">
              The high-fidelity intelligence console for advertising strategists. Built to navigate market volatility with algorithmic precision.
            </p>
            <div className="flex gap-sm">
              <a href="#" className="p-xs bg-bureau-ink/5 hover:bg-bureau-ink hover:text-white rounded-lg transition-all"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="p-xs bg-bureau-ink/5 hover:bg-bureau-ink hover:text-white rounded-lg transition-all"><Linkedin className="w-4 h-4" /></a>
              <a href="#" className="p-xs bg-bureau-ink/5 hover:bg-bureau-ink hover:text-white rounded-lg transition-all"><Github className="w-4 h-4" /></a>
            </div>
          </div>
          
          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-bureau-ink font-bold mb-lg">Intelligence</h4>
            <ul className="space-y-sm text-xs font-mono uppercase tracking-tight font-bold">
              <li><a href="#" className="hover:text-bureau-signal transition-colors italic">Daily Dossier</a></li>
              <li><a href="#" className="hover:text-bureau-signal transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-bureau-signal transition-colors">Node Status</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-bureau-ink font-bold mb-lg">Security</h4>
            <ul className="space-y-sm text-xs font-mono uppercase tracking-tight font-bold">
              <li><a href="#" className="hover:text-bureau-signal transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-bureau-signal transition-colors">Audit Logs</a></li>
              <li className="flex items-center gap-xs text-bureau-nominal">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Encrypted Sync</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-lg border-t border-bureau-ink/5 flex flex-col md:flex-row justify-between items-center gap-md font-mono text-[9px] uppercase tracking-[0.3em] font-bold">
          <div>&copy; {new Date().getFullYear()} PLANNERAPI BUREAU _ ALL RIGHTS RESERVED</div>
          <div className="flex gap-lg">
            <span className="text-bureau-signal">SIGNAL STATUS: OPTIMAL</span>
            <span className="text-bureau-ink/20">V0.8.4_LTS</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
