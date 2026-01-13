
import React from 'react';
import { Search, AlertTriangle, TrendingUp, ArrowUpRight, Activity } from 'lucide-react';

// This component now primarily serves as a data provider for the compact ticker
// but can still be used for a full signal index view if needed in the future.

export const todaySignalData = [
  {
    id: "SIG-01A",
    title: "Retail Media CPM",
    value: "VOLATILE",
    subtitle: "+18.4% Delta",
    interpretation: "Significant buy-side pressure detected across Amazon & Walmart. Predictive yield is tightening in H2.",
    urgency: "critical",
    sources: ["Perplexity", "Gemini"]
  },
  {
    id: "SIG-02B",
    title: "Attention Yield",
    value: "92.4%",
    subtitle: "Stable Peak",
    interpretation: "Video retention indexing higher than 30-day averages in EMEA. Creative fatigue remains low.",
    urgency: "stable",
    sources: ["Claude"]
  }
];

export const TodaySignals: React.FC<{ onSearch: (q: string) => void }> = ({ onSearch }) => {
  // Keeping this for backward compatibility if needed, but the UI is now ticker-led.
  return null; 
};
