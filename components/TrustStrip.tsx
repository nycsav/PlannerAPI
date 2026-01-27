import React from 'react';
import { Shield, Users, TrendingUp } from 'lucide-react';

export const TrustStrip: React.FC = () => {
  return (
    <div className="w-full border-t border-gray-200/50 dark:border-slate-700/50 bg-transparent dark:bg-transparent py-md px-lg">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
            <Users className="w-4 h-4 text-bureau-signal dark:text-planner-orange" />
            <span className="text-sm font-medium">Join 500+ CMOs in early access</span>
          </div>

          <span className="hidden md:inline text-gray-300/50 dark:text-slate-500/50">|</span>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
              <Shield className="w-4 h-4 text-bureau-signal dark:text-planner-orange" />
              <span className="text-sm font-medium">SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
              <TrendingUp className="w-4 h-4 text-bureau-signal dark:text-planner-orange" />
              <span className="text-sm font-medium">Real-time data</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
