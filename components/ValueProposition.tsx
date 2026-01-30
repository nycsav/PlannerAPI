import React from 'react';
import { Activity, TrendingUp, Target, Database } from 'lucide-react';

export const ValueProposition: React.FC = () => {
  const features = [
    {
      icon: <Activity className="w-5 h-5" />,
      title: 'Perplexity-Powered Search',
      description: 'Access real-time data from 1,000+ marketing and advertising sources. Ask any question about campaigns, trends, or strategies.',
      color: 'blue'
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Industry Signals & Trends',
      description: 'Every brief surfaces what brand marketers and ad strategists need to know—agency moves, brand shifts, platform changes.',
      color: 'purple'
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: 'Strategic Briefs, Not Just News',
      description: 'Get structured intelligence: key signals, implications for your brand, and actionable next steps—not just headlines.',
      color: 'orange'
    },
    {
      icon: <Database className="w-5 h-5" />,
      title: 'Updated Throughout the Day',
      description: 'Fresh briefings every morning at 6 AM ET, plus real-time search for breaking news. Never miss an industry shift.',
      color: 'emerald'
    }
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      border: 'border-blue-200 dark:border-blue-500/30',
      text: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-500/20'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-500/10',
      border: 'border-purple-200 dark:border-purple-500/30',
      text: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-100 dark:bg-purple-500/20'
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-500/10',
      border: 'border-orange-200 dark:border-orange-500/30',
      text: 'text-orange-600 dark:text-orange-400',
      iconBg: 'bg-orange-100 dark:bg-orange-500/20'
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      border: 'border-emerald-200 dark:border-emerald-500/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-100 dark:bg-emerald-500/20'
    }
  };

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="text-center mb-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg mb-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
          <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
            WHAT YOU'LL GET
          </span>
        </div>

        <h2 className="font-display text-3xl md:text-5xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight mb-sm" style={{ fontStyle: 'italic', fontWeight: 900 }}>
          INTELLIGENCE BUILT FOR
          <br />
          <span className="text-bureau-signal dark:text-planner-orange">MARKETING LEADERS</span>
        </h2>

        <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
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
              className={`relative p-6 ${colors.bg} border ${colors.border} rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 ${colors.iconBg} ${colors.border} border rounded-xl flex items-center justify-center shrink-0 ${colors.text} group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className={`text-base font-bold ${colors.text} uppercase tracking-wide mb-2`}>
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Use Case Examples */}
      <div className="mt-xl pt-lg border-t border-gray-200 dark:border-slate-700">
        <div className="text-center mb-md">
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Search in real-time for:</span>
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
              className="px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 font-medium uppercase tracking-wide hover:border-bureau-signal dark:hover:border-planner-orange hover:bg-bureau-signal/5 dark:hover:bg-planner-orange/5 transition-all cursor-default"
            >
              {useCase}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
