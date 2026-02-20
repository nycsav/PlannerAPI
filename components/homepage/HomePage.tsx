import React from 'react';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { ValuePropositionCallout } from './ValuePropositionCallout';
import { StatCallout } from '../StatCallout';
import { RecentSignalsTab } from '../RecentSignalsTab';
import { SourceLogosMinimal } from '../SourceLogosMinimal';
import { HowItWorks3Column } from '../HowItWorks3Column';
import { ExampleCardPreview } from '../ExampleCardPreview';
import { AudienceGrid } from '../AudienceGrid';
import { FAQAccordion } from '../FAQAccordion';
import { Footer } from './Footer';

interface HomePageProps {
  onBriefClick?: (brief: any) => void;
  onSignupClick?: () => void;
  onSearch?: (query: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSignupClick, onSearch }) => {
  return (
    <div style={{ backgroundColor: 'var(--navy)', minHeight: '100vh' }}>
      {/* 1. Navigation */}
      <Navbar onSignupClick={onSignupClick} />

      {/* 2. Hero */}
      <HeroSection onSearch={onSearch} onSignupClick={onSignupClick} />

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
