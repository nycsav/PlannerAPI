import React from 'react';
import { SignalIcon, DataIcon, ActionArrowIcon, RadarIcon } from './GeometricIcons';

export const ValuePropositionTerminal: React.FC = () => {
  const features = [
    {
      icon: <RadarIcon size={20} />,
      title: 'Perplexity-Powered Search',
      description: 'Access real-time data from 1,000+ marketing and advertising sources. Ask any question about campaigns, trends, or strategies.',
      color: 'blue'
    },
    {
      icon: <SignalIcon size={20} />,
      title: 'Industry Signals & Trends',
      description: 'Every brief surfaces what brand marketers and ad strategists need to know—agency moves, brand shifts, platform changes.',
      color: 'purple'
    },
    {
      icon: <ActionArrowIcon size={20} />,
      title: 'Strategic Briefs, Not Just News',
      description: 'Get structured intelligence: key signals, implications for your brand, and actionable next steps—not just headlines.',
      color: 'orange'
    },
    {
      icon: <DataIcon size={20} />,
      title: 'Updated Throughout the Day',
      description: 'Fresh briefings every morning at 6 AM ET, plus real-time search for breaking news. Never miss an industry shift.',
      color: 'emerald'
    }
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      dot: 'bg-blue-400'
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      text: 'text-purple-400',
      dot: 'bg-purple-400'
    },
    orange: {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      text: 'text-orange-400',
      dot: 'bg-orange-400'
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      dot: 'bg-emerald-400'
    }
  };

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
          <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            WHAT YOU'LL GET
          </span>
        </div>

        <h2 className="font-mono text-2xl md:text-4xl font-black text-white uppercase tracking-tight mb-3">
          INTELLIGENCE BUILT FOR
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            MARKETING LEADERS
          </span>
        </h2>

        <p className="font-mono text-sm text-slate-500 max-w-2xl mx-auto">
          Perplexity's live data + AI analysis = instant answers with actionable insights. Built for brand marketers and advertising strategists.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature, index) => {
          const colors = colorClasses[feature.color as keyof typeof colorClasses];

          return (
            <div
              key={index}
              className={`relative p-6 ${colors.bg} border ${colors.border} rounded transition-all duration-300 hover:border-opacity-50 group`}
            >
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-current opacity-30" style={{ color: feature.color === 'blue' ? '#60A5FA' : feature.color === 'purple' ? '#A78BFA' : feature.color === 'orange' ? '#FB923C' : '#34D399' }} />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-current opacity-30" style={{ color: feature.color === 'blue' ? '#60A5FA' : feature.color === 'purple' ? '#A78BFA' : feature.color === 'orange' ? '#FB923C' : '#34D399' }} />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-current opacity-30" style={{ color: feature.color === 'blue' ? '#60A5FA' : feature.color === 'purple' ? '#A78BFA' : feature.color === 'orange' ? '#FB923C' : '#34D399' }} />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-current opacity-30" style={{ color: feature.color === 'blue' ? '#60A5FA' : feature.color === 'purple' ? '#A78BFA' : feature.color === 'orange' ? '#FB923C' : '#34D399' }} />

              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 ${colors.bg} border ${colors.border} rounded flex items-center justify-center shrink-0 ${colors.text} group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`font-mono text-sm font-bold ${colors.text} uppercase tracking-wider`}>
                      {feature.title}
                    </h3>
                  </div>
                  <p className="font-mono text-xs text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Use Case Examples */}
      <div className="mt-12 pt-8 border-t border-slate-800/50">
        <div className="text-center mb-6">
          <span className="font-mono text-[10px] text-slate-600 uppercase tracking-widest">Search in real-time for:</span>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            'Agency News',
            'Brand Campaigns',
            'Platform Updates',
            'Media Trends',
            'Creative Strategy',
            'Ad Tech Changes',
            'Pitch Prep',
            'Client Briefings'
          ].map((useCase, index) => (
            <div
              key={index}
              className="px-4 py-2 bg-slate-900/50 border border-slate-800/50 rounded font-mono text-xs text-slate-400 uppercase tracking-wider hover:border-blue-500/30 hover:bg-blue-500/5 transition-all"
            >
              {useCase}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
