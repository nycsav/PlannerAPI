
import React from 'react';
import { Activity, Flame, Share2, TrendingUp, Search } from 'lucide-react';

interface MarketPulseProps {
  onAnalyze?: (query: string) => void;
}

export const MarketPulse: React.FC<MarketPulseProps> = ({ onAnalyze }) => {
  const cards = [
    {
      title: "Ad-Load Density",
      status: "Heatmap: High",
      icon: <Flame className="w-3.5 h-3.5 text-scandi-sienna" />,
      viz: (
        <div className="grid grid-cols-6 gap-[2px]">
          {Array.from({ length: 24 }).map((_, i) => (
            <div 
              key={i} 
              className={`aspect-square rounded-[1px] transition-all duration-700 ${
                i % 5 === 0 ? 'bg-scandi-sienna opacity-80' : 
                i % 3 === 0 ? 'bg-scandi-sienna opacity-40' : 
                'bg-scandi-navy/5'
              }`}
            />
          ))}
        </div>
      ),
      query: "Analyze current ad-load density trends on TikTok v. Meta"
    },
    {
      title: "Market Sentiment",
      status: "78% Bullish",
      icon: <Activity className="w-3.5 h-3.5 text-green-500" />,
      viz: (
        <div className="relative h-12 flex items-center justify-center">
          <svg className="w-12 h-12 -rotate-90">
            <circle cx="24" cy="24" r="20" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-scandi-navy/5" />
            <circle cx="24" cy="24" r="20" fill="transparent" stroke="currentColor" strokeWidth="4" strokeDasharray="125.6" strokeDashoffset="30" className="text-green-500 animate-draw-bar" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-[8px] font-bold">+2.4</span>
          </div>
        </div>
      ),
      query: "Explain why market sentiment is bullish despite cookie deprecation"
    },
    {
      title: "Volatility Index",
      status: "VIX: Stable",
      icon: <TrendingUp className="w-3.5 h-3.5 text-scandi-blue" />,
      viz: (
        <div className="h-12 w-full flex items-end">
          <svg className="w-full h-full" preserveAspectRatio="none">
            <path 
              d="M0 40 L10 35 L20 42 L30 20 L40 25 L50 10 L60 30 L70 20 L80 35 L90 5 L100 40" 
              fill="transparent" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              className="text-scandi-blue/40"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      ),
      query: "Predict volatility for Q4 retail media networks"
    },
    {
      title: "Vertical Spend",
      status: "Retail Surge",
      icon: <Share2 className="w-3.5 h-3.5 text-scandi-navy/20" />,
      viz: (
        <div className="flex items-end gap-[3px] h-12">
          {[20, 45, 30, 80, 50, 65, 40].map((h, i) => (
            <div key={i} className="flex-1 bg-scandi-navy/5 rounded-t-[1px] relative overflow-hidden h-full">
              <div 
                className={`absolute bottom-0 w-full bg-scandi-navy/20 group-hover:bg-scandi-navy/60 transition-all origin-bottom animate-draw-bar ${i === 3 ? 'bg-scandi-sienna/60 group-hover:bg-scandi-sienna' : ''}`}
                style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }}
              />
            </div>
          ))}
        </div>
      ),
      query: "Break down the retail media spend surge by product vertical"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white border border-scandi-navy/10 p-5 rounded-sm hover:shadow-card-hover transition-all group relative">
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col">
              <span className="font-mono text-[9px] uppercase text-scandi-navy/40 tracking-widest-plus">{card.title}</span>
              <span className="text-sm font-bold text-scandi-navy">{card.status}</span>
            </div>
            {card.icon}
          </div>
          {card.viz}
          
          {/* Analyze Hover Trigger */}
          <button 
            onClick={() => onAnalyze?.(card.query)}
            className="absolute inset-0 bg-scandi-blue/95 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-300 rounded-sm"
          >
            <Search className="w-5 h-5 mb-2" />
            <span className="font-mono text-[10px] uppercase font-bold tracking-widest">Analyze with AI</span>
          </button>
        </div>
      ))}
    </div>
  );
};
