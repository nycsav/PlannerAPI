import React, { useState } from 'react';
import { HomePage } from './components/homepage';
import { IntelligenceModal, IntelligencePayload } from './components/IntelligenceModal';

type RawBrief = { id?: string; title?: string; summary?: string; signals?: string[]; moves?: string[]; source?: string };

export const TestNewHomepage: React.FC = () => {
  const [intelligenceOpen, setIntelligenceOpen] = useState(false);
  const [intelligencePayload, setIntelligencePayload] = useState<IntelligencePayload | null>(null);

  const handleBriefClick = (brief: RawBrief) => {
    const payload: IntelligencePayload = {
      query: brief.title || '',
      summary: brief.summary || '',
      keySignals: (brief.signals || []).map((_, i) => `Signal ${i + 1}`),
      signals: (brief.signals || []).map((s, i) => ({
        id: `sig-${i}`,
        title: `Signal ${i + 1}`,
        summary: s,
        sourceName: brief.source || 'Source',
        sourceUrl: '#',
      })),
      movesForLeaders: brief.moves || [],
    };
    
    setIntelligencePayload(payload);
    setIntelligenceOpen(true);
  };

  const handleSignupClick = () => {
    alert('Signup modal will be integrated after you approve the design!');
  };

  const handleSearch = (query: string) => {
    alert(`Search: "${query}"`);
  };

  return (
    <>
      <HomePage
        onBriefClick={handleBriefClick}
        onSignupClick={handleSignupClick}
        onSearch={handleSearch}
      />

      <IntelligenceModal
        open={intelligenceOpen}
        onClose={() => setIntelligenceOpen(false)}
        payload={intelligencePayload}
        isLoading={false}
      />
    </>
  );
};

export default TestNewHomepage;
