
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { IntelligenceCard } from './components/IntelligenceCard';
import { AISearchInterface } from './components/AISearchInterface';
import { EngineInstructions } from './components/EngineInstructions';
import { HeroSearch } from './components/HeroSearch';

const SectionHeader: React.FC<{ id: string; title: string; subtitle?: string }> = ({ id, title, subtitle }) => (
  <div className="mb-md border-b border-bureau-ink/10 pb-sm">
    <div className="flex items-center gap-sm">
      <span className="font-mono text-[10px] font-black text-white bg-bureau-ink px-2 py-0.5 rounded-sm">{id}</span>
      <h2 className="font-display text-display-md font-black text-bureau-ink uppercase italic tracking-tight">{title}</h2>
    </div>
    {subtitle && (
      <p className="font-mono text-[9px] font-bold text-bureau-slate uppercase tracking-widest mt-1 opacity-60">{subtitle}</p>
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

  // Example briefings for demonstration - covers both agency strategists & brand marketers
  const exampleBriefings = [
    {
      id: "LOG-104",
      date: "24.05.2024",
      title: "The Post-Cookie Attribution Pivot",
      description: "Executive Summary: As deterministic tracking reaches terminal decline, our logic engines identify a $4.2B redirection of spend toward high-fidelity contextual signals.",
      theme: "Strategy Cluster"
    },
    {
      id: "LOG-105",
      date: "23.05.2024",
      title: "AI SPO: Efficiency Benchmarks",
      description: "Technical Audit: Supply Path Optimization is now 92% automated across major holding groups. Average creative latency reduced by 400ms.",
      theme: "Workflow Engine"
    },
    {
      id: "LOG-106",
      date: "22.05.2024",
      title: "Retail Media: The New Walled Garden",
      description: "Market Analysis: Retail media networks now capture 18% of digital ad spend, with Amazon, Walmart, and Target leading consolidated shopper data strategies.",
      theme: "Brand Intelligence"
    },
    {
      id: "LOG-107",
      date: "21.05.2024",
      title: "CMO Tenure & AI Adoption Correlation",
      description: "Leadership Insights: Organizations with CMO tenure >3 years show 2.7x higher AI tool integration rates compared to high-turnover marketing leadership.",
      theme: "Client Strategy"
    },
    {
      id: "LOG-108",
      date: "20.05.2024",
      title: "Gen Z Brand Switching: AI-Driven Triggers",
      description: "Consumer Behavior: 62% of Gen Z consumers report switching brands based on AI-personalized competitor offers. Traditional brand loyalty metrics declining 14% YoY.",
      theme: "Brand Intelligence"
    },
    {
      id: "LOG-109",
      date: "19.05.2024",
      title: "DTC Revival Through First-Party Data",
      description: "E-commerce Trends: Direct-to-consumer brands implementing proprietary data platforms see 34% higher customer lifetime value vs. third-party data reliance.",
      theme: "Client Strategy"
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

        {/* INTELLIGENCE FEED - Example Content for Strategists & Brand Marketers */}
        <div className="section-zebra py-2xl bg-white">
          <section className="max-w-content mx-auto w-full app-padding-x">
            <SectionHeader 
              id="01" 
              title="Strategic Intelligence Examples" 
              subtitle="Sample briefings showing the depth of market analysis available"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-md">
              {exampleBriefings.map((item) => (
                <IntelligenceCard 
                  key={item.id}
                  id={item.id}
                  date={item.date}
                  title={item.title}
                  description={item.description}
                  tag={item.theme}
                  onDeepResearch={(q, source) => openSearch(q, source)}
                />
              ))}
            </div>
            <div className="mt-lg text-center">
              <p className="font-mono text-[10px] uppercase tracking-widest text-bureau-slate/60">
                Real-time intelligence updated daily via Perplexity AI + Claude synthesis
              </p>
            </div>
          </section>
        </div>

        {/* OPERATING SYSTEM - Workflow Examples for Agency Teams & Brands */}
        <div className="section-zebra py-2xl border-t border-bureau-border bg-bureau-surface">
          <section className="max-w-wide mx-auto w-full app-padding-x">
            <SectionHeader 
              id="02" 
              title="Operational Framework" 
              subtitle="Core workflows available for agency strategists and brand marketing teams"
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
