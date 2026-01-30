import React, { useState } from 'react';
import { NavbarTerminal } from './components/NavbarTerminal';
import { HeroSearchTerminal } from './components/HeroSearchTerminal';
import { ValuePropositionTerminal } from './components/ValuePropositionTerminal';
import { DailyIntelligenceTerminal } from './components/DailyIntelligenceTerminal';
import { IntelligenceModalTerminal, IntelligencePayload } from './components/IntelligenceModalTerminal';
import { SignupModal } from './components/SignupModal';
import { ScanlineOverlay } from './components/TerminalAnimations';
import { useAudience } from './contexts/AudienceContext';
import { ENDPOINTS, fetchWithTimeout } from './src/config/api';

const AppTerminal: React.FC = () => {
  const { audience } = useAudience();

  // Intelligence Modal state
  const [intelligenceOpen, setIntelligenceOpen] = useState(false);
  const [intelligencePayload, setIntelligencePayload] = useState<IntelligencePayload | null>(null);
  const [isLoadingIntelligence, setIsLoadingIntelligence] = useState(false);

  // Signup Modal state
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  // Fetch intelligence and open modal
  const fetchIntelligence = async (query: string, displayQuery?: string) => {
    console.log('[AppTerminal] fetchIntelligence called with query:', query);

    setIntelligenceOpen(true);
    setIsLoadingIntelligence(true);
    setIntelligencePayload(null);

    try {
      const audienceFormatted = audience.replace(/_/g, ' ');
      console.log('[AppTerminal] Fetching intelligence from backend...');

      const res = await fetchWithTimeout(ENDPOINTS.chatIntel, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ query, audience: audienceFormatted }),
        timeout: 50000,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('[AppTerminal] Backend error response:', errorText);
        throw new Error(`Request failed: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      console.log('[AppTerminal] Backend data received:', data);

      if (!data.citations && data.raw?.citations) {
        data.citations = data.raw.citations;
      }

      const cleanQuery = displayQuery || query.split('. Include:')[0].replace(/^Provide a detailed financial impact analysis for "|^Analyze the competitive landscape for "|^Create a detailed implementation roadmap for "/g, '').replace(/"/g, '');

      const summaryText = data.implications?.join(' ') || 'No summary available.';
      const movesArray = data.actions || [];

      let signalsWithSources = data.signals || [];

      if (signalsWithSources.length > 0 && data.citations && Array.isArray(data.citations)) {
        signalsWithSources = signalsWithSources.map((signal: any, index: number) => {
          if (signal.sourceUrl && signal.sourceUrl !== '#') {
            return signal;
          }

          const citation = data.citations[index];
          if (citation) {
            try {
              const url = new URL(citation);
              return {
                ...signal,
                sourceUrl: citation,
                sourceName: signal.sourceName || url.hostname.replace('www.', '') || 'Source'
              };
            } catch (e) {
              return signal;
            }
          }

          return signal;
        });
      }

      const payload: IntelligencePayload = {
        query: cleanQuery,
        summary: summaryText,
        keySignals: signalsWithSources.map((s: any) => s.title || s.summary || s) || [],
        signals: signalsWithSources,
        movesForLeaders: movesArray,
        frameworks: data.frameworks,
        followUps: [],
        graphData: data.graphData
      };

      console.log('[AppTerminal] Setting intelligence payload:', payload);
      setIntelligencePayload(payload);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[AppTerminal] Intelligence fetch failed:', errorMessage);

      const errorPayload: IntelligencePayload = {
        query: displayQuery || query,
        summary: `**ERROR:** I had trouble getting that intelligence. Could you try again?\n\n**Details:** ${errorMessage}`,
        keySignals: [],
        movesForLeaders: [],
        signals: []
      };

      setIntelligencePayload(errorPayload);
    } finally {
      setIsLoadingIntelligence(false);
    }
  };

  const openSearch = (query: string) => {
    console.log('[AppTerminal] openSearch called with query:', query);
    fetchIntelligence(query);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      {/* Scanline overlay - CRT effect */}
      <ScanlineOverlay opacity={0.02} />

      {/* Grid overlay */}
      <div
        className="fixed inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #60A5FA 1px, transparent 1px),
            linear-gradient(to bottom, #60A5FA 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }}
      />

      <NavbarTerminal onSignupClick={() => setIsSignupModalOpen(true)} />

      <main className="relative w-full">
        {/* HERO SECTION */}
        <div className="py-16 md:py-24 border-b border-slate-800/50">
          <section className="max-w-[1400px] mx-auto w-full px-6">
            <HeroSearchTerminal onSearch={openSearch} />
          </section>
        </div>

        {/* VALUE PROPOSITION SECTION */}
        <div className="py-16 md:py-20 border-b border-slate-800/50">
          <section className="max-w-[1400px] mx-auto w-full px-6">
            <ValuePropositionTerminal />
          </section>
        </div>

        {/* DAILY INTELLIGENCE SECTION */}
        <div className="py-16 md:py-24">
          <section className="max-w-[1400px] mx-auto w-full px-6">
            {/* Section Header */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span className="font-mono text-[9px] font-bold text-purple-400 uppercase tracking-widest">
                    SECTION 01
                  </span>
                </div>
              </div>

              <h2 className="font-mono text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-3">
                DAILY INTELLIGENCE
              </h2>

              <p className="font-mono text-sm text-slate-500">
                AI-powered market analysis updated every morning at 6am ET
              </p>
            </div>

            <DailyIntelligenceTerminal />
          </section>
        </div>
      </main>

      {/* Intelligence Modal */}
      <IntelligenceModalTerminal
        open={intelligenceOpen}
        payload={intelligencePayload}
        onClose={() => setIntelligenceOpen(false)}
        isLoading={isLoadingIntelligence}
        onFollowUp={(question, displayQuery) => {
          fetchIntelligence(question, displayQuery);
        }}
      />

      {/* Signup Modal */}
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onSuccess={() => {
          setIsSignupModalOpen(false);
          console.log('Signup successful');
        }}
      />
    </div>
  );
};

export default AppTerminal;
