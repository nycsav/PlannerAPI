import React, { useState } from 'react';
import { HomePage } from './components/homepage';
import { IntelligenceModal, IntelligencePayload } from './components/IntelligenceModal';
import { ENDPOINTS, fetchWithTimeout } from './src/config/api';

type RawBrief = {
  id?: string;
  title?: string;
  summary?: string;
  signals?: string[];
  moves?: string[];
  source?: string;
  sourceUrl?: string;
  sources?: Array<{
    sourceName: string;
    sourceUrl: string;
    snippet?: string;
    title?: string;
  }>;
};

export const TestNewHomepage: React.FC = () => {
  const [intelligenceOpen, setIntelligenceOpen] = useState(false);
  const [intelligencePayload, setIntelligencePayload] = useState<IntelligencePayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleBriefClick = (brief: any) => {
    // Use actual signals array directly
    const keySignals = brief.signals || [];

    // Build signals with proper source information
    // If brief has 'sources' array (from Firestore), use it
    // Otherwise, create signal objects from the signals text
    let signalsWithSources = [];
    if (brief.sources && Array.isArray(brief.sources)) {
      signalsWithSources = brief.sources.map((src: any, i: number) => ({
        id: `source-${i}`,
        title: src.title || src.sourceName || `Source ${i + 1}`,
        summary: src.snippet || '',
        sourceName: src.sourceName || src.title || brief.source || 'Source',
        sourceUrl: src.sourceUrl || '#',
      }));
    } else {
      // Fallback: create signal objects from signals array
      signalsWithSources = keySignals.map((signal: string, i: number) => {
        // Extract first sentence or first 60 chars as title
        const firstSentence = signal.split(/[.!?]/)[0].trim();
        const title = firstSentence.length > 60
          ? firstSentence.substring(0, 60) + '...'
          : firstSentence;

        return {
          id: `sig-${i}`,
          title: title || `Signal ${i + 1}`,
          summary: signal,
          sourceName: brief.source || 'Source',
          sourceUrl: brief.sourceUrl || '#',
        };
      });
    }

    const payload: IntelligencePayload = {
      query: brief.title || '',
      summary: brief.summary || '',
      keySignals: keySignals,
      signals: signalsWithSources,
      movesForLeaders: brief.moves || [],
    };

    setIntelligencePayload(payload);
    setIntelligenceOpen(true);
  };

  const handleSignupClick = () => {
    alert('Signup modal will be integrated after you approve the design!');
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    // Open modal immediately with loading state
    setIsLoading(true);
    setIntelligenceOpen(true);
    setIntelligencePayload(null);

    try {
      const resp = await fetchWithTimeout(
        ENDPOINTS.perplexitySearch,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
          timeout: 40000,
        }
      );

      if (!resp.ok) throw new Error(`Backend error: ${resp.status}`);
      const data = await resp.json();

      // Parse response sections
      const sections = data.answer?.split('##') || [];

      // Extract Summary (first section after title)
      let summary = '';
      if (sections.length > 1) {
        summary = sections[1].split('\n').filter((l: string) => l.trim() && !l.includes('##')).join(' ').trim();
      } else {
        summary = data.answer || '';
      }

      // Extract Moves for Leaders first (look for action-oriented section)
      const movesForLeaders: string[] = [];
      const movesSection = sections.find((s: string) =>
        s.toLowerCase().includes('action') ||
        s.toLowerCase().includes('move') ||
        s.toLowerCase().includes('recommend')
      );
      if (movesSection) {
        const moveRegex = /^[-*•]\s+(.+)$/gm;
        let moveMatch;
        while ((moveMatch = moveRegex.exec(movesSection)) !== null) {
          movesForLeaders.push(moveMatch[1].trim());
        }
      }

      // Extract Key Signals (bullet points from non-moves sections)
      const keySignals: string[] = [];
      const nonMovesSections = sections.filter((s: string) => s !== movesSection);
      const nonMovesText = nonMovesSections.join('\n');
      const bulletRegex = /^[-*•]\s+(.+)$/gm;
      let match;
      while ((match = bulletRegex.exec(nonMovesText)) !== null) {
        const signal = match[1].trim();
        // Avoid duplicates
        if (!keySignals.includes(signal) && !movesForLeaders.includes(signal)) {
          keySignals.push(signal);
        }
      }

      // Extract sources from citations
      const citations = data.raw?.citations || [];
      const signals = citations.map((citation: any, i: number) => ({
        id: `source-${i}`,
        title: citation.title || `Source ${i + 1}`,
        summary: citation.snippet || '',
        sourceName: citation.source || citation.title || `Source ${i + 1}`,
        sourceUrl: citation.url || '#',
      }));

      const payload: IntelligencePayload = {
        query,
        summary: summary.substring(0, 800),
        keySignals: keySignals.slice(0, 5),
        signals,
        movesForLeaders: movesForLeaders.length > 0 ? movesForLeaders.slice(0, 3) : [
          'Review the key signals and assess impact on your current strategy',
          'Identify quick-win opportunities to implement within 30 days',
          'Establish measurement framework to track progress'
        ],
      };

      setIntelligencePayload(payload);
    } catch (error) {
      console.error('Search error:', error);
      setIntelligencePayload({
        query,
        summary: "I had trouble getting that intelligence. Please try again or contact support.",
        keySignals: [],
        movesForLeaders: [],
      });
    } finally {
      setIsLoading(false);
    }
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
        isLoading={isLoading}
        onFollowUp={(question) => {
          console.log('[TestNewHomepage] Follow-up question:', question);
          // Trigger a new search with the follow-up question
          handleSearch(question);
        }}
      />
    </>
  );
};

export default TestNewHomepage;
