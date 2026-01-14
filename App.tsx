
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { IntelligenceCard } from './components/IntelligenceCard';
import { AISearchInterface } from './components/AISearchInterface';
import { EngineInstructions } from './components/EngineInstructions';
import { HeroSearch } from './components/HeroSearch';

const SectionHeader: React.FC<{ id: string; title: string; subtitle?: string }> = ({ id, title, subtitle }) => (
  <div className="mb-xl border-b border-bureau-ink/10 pb-md">
    <div className="flex items-center gap-md">
      <h2 className="font-display text-3xl md:text-4xl font-black text-bureau-ink italic uppercase tracking-tight">{title}</h2>
    </div>
    {subtitle && (
      <p className="text-base text-bureau-slate/70 mt-2">{subtitle}</p>
    )}
  </div>
);

const App: React.FC = () => {
  const [searchState, setSearchState] = useState<{ 
    isOpen: boolean; 
    query: string; 
    source: 'Claude' | 'Perplexity' | 'Gemini';
    data?: any;
  }>({
    isOpen: false,
    query: '',
    source: 'Perplexity',
    data: null
  });

  // Example briefings - business impact focus for C-suite marketing leaders
  const exampleBriefings = [
    {
      id: "LOG-104",
      date: "24.05.2024",
      title: "Post-Cookie Attribution: $4.2B Market Shift",
      description: "Privacy-first tracking drives major budget reallocation. CMOs reallocating $4.2B toward contextual and first-party data strategies as third-party cookies decline. Early movers gaining 23% competitive advantage in attribution accuracy.",
      theme: "AI Strategy"
    },
    {
      id: "LOG-105",
      date: "23.05.2024",
      title: "AI-Powered Supply Path: 92% Automation Achieved",
      description: "Marketing operations efficiency breakthrough. Leading brands achieve 92% automation in media buying workflows, reducing costs 34% while improving campaign performance. Average time-to-market decreased from 5 days to 8 hours.",
      theme: "Revenue Growth"
    },
    {
      id: "LOG-106",
      date: "22.05.2024",
      title: "Retail Media Networks Capture 18% of Digital Spend",
      description: "New competitive landscape for brand visibility. Amazon, Walmart, and Target retail media networks now command $42B annually, forcing strategic shifts in brand allocation. First-party shopper data creates measurable ROAS advantages.",
      theme: "Market Trends"
    },
    {
      id: "LOG-107",
      date: "21.05.2024",
      title: "CMO Tenure Drives AI ROI: 2.7x Higher Returns",
      description: "Leadership stability correlates with technology adoption success. Organizations with CMO tenure exceeding 3 years demonstrate 2.7x higher AI tool integration rates and 41% better marketing ROI. Board-level implications for succession planning.",
      theme: "Competitive Analysis"
    },
    {
      id: "LOG-108",
      date: "20.05.2024",
      title: "Gen Z Brand Loyalty Down 14% YoY: AI Personalization Impact",
      description: "Competitive threats from AI-driven targeting. 62% of Gen Z consumers switching brands based on personalized AI offers. Traditional loyalty programs losing effectiveness. Market share vulnerability for established brands without AI capabilities.",
      theme: "Brand Intelligence"
    },
    {
      id: "LOG-109",
      date: "19.05.2024",
      title: "First-Party Data Strategy: 34% LTV Increase",
      description: "Direct-to-consumer brands prove proprietary data advantage. Companies building first-party data platforms achieve 34% higher customer lifetime value versus third-party reliance. Strategic imperative for sustainable competitive positioning.",
      theme: "Customer Retention"
    }
  ];

  const openSearch = (query: string, source: 'Claude' | 'Perplexity' | 'Gemini' = 'Perplexity', data?: any) => {
    setSearchState({ isOpen: true, query, source, data });
  };

  return (
    <Layout>
      <main className="w-full">
        
        {/* HERO SECTION */}
        <div className="section-zebra py-2xl border-b border-bureau-border bg-bureau-surface">
          <section className="max-w-hero mx-auto w-full app-padding-x">
            <HeroSearch onSearch={(q, data) => openSearch(q, 'Perplexity', data)} />
          </section>
        </div>

        {/* INTELLIGENCE BRIEFINGS - Executive Content */}
        <div className="section-zebra py-2xl bg-white">
          <section className="max-w-content mx-auto w-full app-padding-x">
            <SectionHeader
              id="01"
              title="Executive Intelligence Briefings"
              subtitle="Data-driven market analysis for strategic decision-making"
            />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-md auto-rows-auto">
              {/* Featured card - spans 2 columns */}
              <div className="md:col-span-2 md:row-span-2">
                <IntelligenceCard
                  key={exampleBriefings[0].id}
                  id={exampleBriefings[0].id}
                  date={exampleBriefings[0].date}
                  title={exampleBriefings[0].title}
                  description={exampleBriefings[0].description}
                  tag={exampleBriefings[0].theme}
                  onDeepResearch={(q, source) => openSearch(q, source)}
                />
              </div>

              {/* Standard cards */}
              {exampleBriefings.slice(1, 3).map((item) => (
                <div key={item.id} className="md:col-span-2">
                  <IntelligenceCard
                    id={item.id}
                    date={item.date}
                    title={item.title}
                    description={item.description}
                    tag={item.theme}
                    onDeepResearch={(q, source) => openSearch(q, source)}
                  />
                </div>
              ))}

              {/* Bottom row - varied layout */}
              {exampleBriefings.slice(3).map((item, idx) => (
                <div key={item.id} className={idx === 0 ? "md:col-span-3" : "md:col-span-2"}>
                  <IntelligenceCard
                    id={item.id}
                    date={item.date}
                    title={item.title}
                    description={item.description}
                    tag={item.theme}
                    onDeepResearch={(q, source) => openSearch(q, source)}
                  />
                </div>
              ))}
            </div>
            <div className="mt-lg text-center">
              <p className="text-sm text-bureau-slate/60">
                Intelligence updated daily • Powered by advanced AI analysis
              </p>
            </div>
          </section>
        </div>

        {/* STRATEGIC FRAMEWORKS - Decision Support Tools */}
        <div className="section-zebra py-2xl border-t border-bureau-border bg-bureau-surface">
          <section className="max-w-wide mx-auto w-full app-padding-x">
            <SectionHeader
              id="02"
              title="Strategic Decision Frameworks"
              subtitle="Tools and methodologies for marketing leadership teams"
            />
            <EngineInstructions />
          </section>
        </div>
      </main>

      <AISearchInterface 
        isOpen={searchState.isOpen} 
        onClose={() => setSearchState({ ...searchState, isOpen: false })} 
        initialQuery={searchState.query}
        sourceType={searchState.source}
        data={searchState.data}
      />
    </Layout>
  );
};

export default App;
