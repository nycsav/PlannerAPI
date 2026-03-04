import React from 'react';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { ValuePropositionCallout } from './ValuePropositionCallout';
import { StatCallout } from '../StatCallout';
import { RecentSignalsTab } from '../RecentSignalsTab';
import { SignalPulseChart } from '../SignalPulseChart';
import { SourceLogosMinimal } from '../SourceLogosMinimal';
import { HowItWorks3Column } from '../HowItWorks3Column';
import { ExampleCardPreview } from '../ExampleCardPreview';
import { AudienceGrid } from '../AudienceGrid';
import { FAQAccordion } from '../FAQAccordion';
import { Footer } from './Footer';

type SearchResult = { title: string; url: string; snippet: string; date?: string };

interface HomePageProps {
  onBriefClick?: (brief: any) => void;
  onSignupClick?: () => void;
  onSearch?: (query: string) => void;
  onInstantSearch?: (query: string) => void;
  searchResults?: SearchResult[];
  isInstantSearching?: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSignupClick,
  onSearch,
  onInstantSearch,
  searchResults,
  isInstantSearching,
}) => {
  return (
    <div style={{ backgroundColor: 'var(--navy)', minHeight: '100vh' }}>
      {/* 1. Navigation */}
      <Navbar onSignupClick={onSignupClick} />

      {/* 2. Hero */}
      <HeroSection
        onSearch={onSearch}
        onInstantSearch={onInstantSearch}
        onSignupClick={onSignupClick}
        searchResults={searchResults}
        isSearching={isInstantSearching}
      />

      {/* 3. Value Proposition Callout (preserved) */}
      <ValuePropositionCallout />

      {/* 4. Stat Callout — 160px after */}
      <div style={{ marginBottom: '160px' }}>
        <StatCallout />
      </div>

      {/* 5. Recent Signals — 120px after */}
      <div style={{ marginBottom: '120px' }}>
        <RecentSignalsTab
          onReadMore={(signal) => onSearch?.(signal.title)}
        />
      </div>

      {/* 5b. Signal Pulse Chart — live pillar distribution */}
      <div style={{ marginBottom: '80px' }}>
        <SignalPulseChart />
      </div>

      {/* 6. Source Logos Minimal — 80px after */}
      <div style={{ marginBottom: '80px' }}>
        <SourceLogosMinimal />
      </div>

      {/* 7. How It Works — 160px after */}
      <div style={{ marginBottom: '160px' }}>
        <HowItWorks3Column />
      </div>

      {/* 8. Example Card Preview — 120px after */}
      <div style={{ marginBottom: '120px' }}>
        <ExampleCardPreview
          onAskFollowUp={() => onSearch?.('What are the implementation costs for Anthropic Computer Use at mid-market scale?')}
        />
      </div>

      {/* 9. Audience Grid — 120px after */}
      <div style={{ marginBottom: '120px' }}>
        <AudienceGrid />
      </div>

      {/* 10. FAQ — 160px after */}
      <div style={{ marginBottom: '160px' }}>
        <FAQAccordion />
      </div>

      {/* 11. Footer */}
      <Footer />
    </div>
  );
};
