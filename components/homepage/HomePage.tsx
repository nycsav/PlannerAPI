import React from 'react';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { StatCallout } from '../StatCallout';
import { RecentSignalsTab } from '../RecentSignalsTab';
import { SourceLogosMinimal } from '../SourceLogosMinimal';
import { HowItWorks3Column } from '../HowItWorks3Column';
import { ExampleCardPreview } from '../ExampleCardPreview';
import { AudienceGrid } from '../AudienceGrid';
import { FAQAccordion } from '../FAQAccordion';
import { SignalDashboard } from '../SignalDashboard';
import { Footer } from './Footer';

type SearchResult = { title: string; url: string; snippet: string; date?: string };

interface HomePageProps {
  onBriefClick?: (brief: any) => void;
  onSignupClick?: () => void;
  onSearch?: (query: string) => void;
  onInstantSearch?: (query: string) => void;
  searchResults?: SearchResult[];
  isInstantSearching?: boolean;
  onSignalClick?: (topic: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSignupClick,
  onSearch,
  onInstantSearch,
  searchResults,
  isInstantSearching,
  onSignalClick,
}) => {
  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', transition: 'background-color 0.2s ease' }}>
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

      {/* 3. Stat Callout */}
      <StatCallout />

      {/* 4. Live Signal Dashboard */}
      <SignalDashboard onSignalClick={onSignalClick || onSearch} />

      {/* 5. Recent Signals */}
      <RecentSignalsTab
        onReadMore={(signal) => onSearch?.(signal.title)}
      />

      {/* 6. Source Logos Minimal */}
      <SourceLogosMinimal />

      {/* 6. How It Works */}
      <HowItWorks3Column />

      {/* 7. Example Card Preview */}
      <ExampleCardPreview
        onAskFollowUp={() => onSearch?.('What are the implementation costs for Anthropic Computer Use at mid-market scale?')}
      />

      {/* 8. Audience Grid */}
      <AudienceGrid />

      {/* 9. FAQ */}
      <FAQAccordion />

      {/* 10. Footer */}
      <Footer onSignupClick={onSignupClick} />
    </div>
  );
};
