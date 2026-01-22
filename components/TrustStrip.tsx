import React from 'react';
import { Shield, Users, TrendingUp } from 'lucide-react';

export const TrustStrip: React.FC = () => {
  return (
    <div className="w-full border-t border-bureau-border bg-bureau-surface/50 py-md px-lg">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
          <div className="flex items-center gap-2 text-bureau-slate/80">
            <Users className="w-4 h-4 text-bureau-signal" />
            <span className="text-sm font-medium">Join 500+ CMOs in early access</span>
          </div>

          <span className="hidden md:inline text-bureau-border">|</span>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-bureau-slate/80">
              <Shield className="w-4 h-4 text-bureau-signal" />
              <span className="text-sm font-medium">SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-bureau-slate/80">
              <TrendingUp className="w-4 h-4 text-bureau-signal" />
              <span className="text-sm font-medium">Real-time data</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
