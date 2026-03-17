import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logEvent } from 'firebase/analytics';
import { analytics, db } from './utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { trackCardView } from './src/utils/tracking';
import { HomePage } from './components/homepage';
import { IntelligenceModal, IntelligencePayload } from './components/IntelligenceModal';
import { SignupModal } from './components/SignupModal';
import { PostSignupWelcome } from './components/PostSignupWelcome';
import { FeatureTour } from './components/FeatureTour';
import { useAuth } from './contexts/AuthContext';
import { markOnboardingCompleted, markTourCompleted } from './utils/userState';
import { ENDPOINTS, fetchWithTimeout } from './src/config/api';

type SearchResult = { title: string; url: string; snippet: string; date?: string };

export const TestNewHomepage: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [intelligenceOpen, setIntelligenceOpen] = useState(false);
  const [intelligencePayload, setIntelligencePayload] = useState<IntelligencePayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCardId, setCurrentCardId] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isInstantSearching, setIsInstantSearching] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [showPostSignupWelcome, setShowPostSignupWelcome] = useState(false);
  const [showFeatureTour, setShowFeatureTour] = useState(false);
  const [streamingText, setStreamingText] = useState('');

  // GA4 page view tracking
  useEffect(() => {
    if (analytics) {
      logEvent(analytics, 'page_view', {
        page_path: location.pathname,
        page_title: document.title,
        page_location: window.location.href,
      });
    }
  }, [location]);

  // On mount, check if URL is /brief/:cardId — load and open that card directly
  useEffect(() => {
    const pathMatch = location.pathname.match(/^\/brief\/([^/]+)$/);
    if (!pathMatch) return;
    const cardId = pathMatch[1];
    const fetchCardById = async () => {
      try {
        const docRef = doc(db, 'discover_cards', cardId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const d = docSnap.data();
          const keySignals: string[] = d.signals || [];
          const signalsWithSources = keySignals.map((signal: string, i: number) => {
            const firstSentence = signal.split(/[.!?]/)[0].trim();
            const title = firstSentence.length > 60 ? firstSentence.substring(0, 60) + '...' : firstSentence;
            return {
              id: `sig-${i}`,
              title: title || `Signal ${i + 1}`,
              summary: signal,
              sourceName: d.source || 'Source',
              sourceUrl: d.sourceUrl || '#',
            };
          });
          setCurrentCardId(cardId);
          setIntelligencePayload({
            query: d.title || '',
            summary: d.summary || '',
            keySignals,
            signals: signalsWithSources,
            movesForLeaders: d.moves || [],
            images: Array.isArray(d.images) ? d.images : [],
          });
          setIntelligenceOpen(true);
        }
      } catch (err) {
        console.error('[brief] fetch card error:', err);
      }
    };
    fetchCardById();
  }, [location.pathname]);

  const openModal = (payload: IntelligencePayload, cardId?: string) => {
    setIntelligencePayload(payload);
    setCurrentCardId(cardId || null);
    setIntelligenceOpen(true);
    if (cardId) {
      window.history.pushState({}, '', `/brief/${cardId}`);
    }
  };

  const closeModal = () => {
    setIntelligenceOpen(false);
    setCurrentCardId(null);
    // Restore URL to homepage if we navigated to a brief URL
    if (window.location.pathname.startsWith('/brief/')) {
      window.history.pushState({}, '', '/');
    }
  };

  const handleBriefClick = (brief: any) => {
    const keySignals = brief.signals || [];
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
      signalsWithSources = keySignals.map((signal: string, i: number) => {
        const firstSentence = signal.split(/[.!?]/)[0].trim();
        const title = firstSentence.length > 60 ? firstSentence.substring(0, 60) + '...' : firstSentence;
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
      keySignals,
      signals: signalsWithSources,
      movesForLeaders: brief.moves || [],
      images: Array.isArray(brief.images) ? brief.images : [],
    };
    openModal(payload, brief.id || undefined);
    trackCardView({ id: brief.id, title: brief.title || '', summary: brief.summary, pillar: brief.pillar });
  };

  const handleSignupClick = () => setIsSignupModalOpen(true);
  const handleSignupSuccess = () => { setShowPostSignupWelcome(true); markOnboardingCompleted(); };
  const handleStartTour = () => setShowFeatureTour(true);

  // Instant search: shows result list below search bar (unchanged)
  const handleInstantSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsInstantSearching(true);
    setSearchResults([]);
    try {
      const resp = await fetchWithTimeout(ENDPOINTS.perplexitySearchInstant, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        timeout: 15000,
      });
      if (resp.ok) {
        const data = await resp.json();
        setSearchResults(data.results || []);
      }
    } catch (err) {
      console.error('[instant search] failed:', err);
    } finally {
      setIsInstantSearching(false);
    }
  };

  // ASK button → try SSE streaming first, fall back to chatIntel if stream fails
  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setStreamingText('');
    setIntelligencePayload(null);
    setCurrentCardId(null);
    setIntelligenceOpen(true);
    setSearchResults([]);

    // Helper: try SSE streaming endpoint
    const tryStream = async (): Promise<boolean> => {
      try {
        const response = await fetch(ENDPOINTS.chatIntelStream, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
          signal: AbortSignal.timeout(60000),
        });

        if (!response.ok) return false;

        const reader = response.body?.getReader();
        if (!reader) return false;

        const decoder = new TextDecoder();
        let buffer = '';
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const dataStr = line.slice(6).trim();
            if (!dataStr) continue;

            try {
              const event = JSON.parse(dataStr);

              if (event.type === 'chunk' && event.content) {
                accumulated += event.content;
                setStreamingText(accumulated);
              } else if (event.type === 'done') {
                setIntelligencePayload({
                  query,
                  summary: event.executiveSummary || accumulated.split('\n')[0] || '',
                  keySignals: event.implications || [],
                  signals: event.signals || [],
                  movesForLeaders: event.actions?.length > 0 ? event.actions : [
                    'Within 30 days: Audit current AI tools and calculate cost-per-outcome.',
                    'Within 60 days: Run a pilot comparing shortlisted solutions on a real workflow.',
                    'Within 90 days: Present ROI findings to leadership with a structured vendor recommendation.',
                  ],
                  graphData: event.graphData,
                });
                return true;
              } else if (event.type === 'error') {
                return false;
              }
            } catch { /* ignore parse errors */ }
          }
        }

        if (accumulated) {
          setIntelligencePayload({ query, summary: accumulated, keySignals: [], movesForLeaders: [] });
          return true;
        }
        return false;
      } catch {
        return false;
      }
    };

    // Helper: non-streaming fallback
    const fallbackToNonStreaming = async () => {
      const response = await fetch(ENDPOINTS.chatIntel, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        signal: AbortSignal.timeout(35000),
      });

      if (!response.ok) throw new Error(`Backend error: ${response.status}`);
      const data = await response.json();

      setIntelligencePayload({
        query,
        summary: data.executiveSummary || data.signals?.[0]?.summary || data.implications?.[0] || '',
        keySignals: data.implications || [],
        signals: data.signals || [],
        movesForLeaders: data.actions?.length > 0 ? data.actions : [
          'Within 30 days: Audit current AI tools and calculate cost-per-outcome.',
          'Within 60 days: Run a pilot comparing shortlisted solutions on a real workflow.',
          'Within 90 days: Present ROI findings to leadership with a structured vendor recommendation.',
        ],
        graphData: data.graphData,
      });
    };

    try {
      const streamed = await tryStream();
      if (!streamed) {
        console.log('[handleSearch] SSE failed, falling back to chatIntel');
        await fallbackToNonStreaming();
      }
    } catch (error) {
      console.error('[handleSearch] error:', error);
      setIntelligencePayload({
        query,
        summary: 'Unable to retrieve intelligence right now. Please try again.',
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
        onInstantSearch={handleInstantSearch}
        searchResults={searchResults}
        isInstantSearching={isInstantSearching}
      />

      <IntelligenceModal
        open={intelligenceOpen}
        onClose={closeModal}
        payload={intelligencePayload}
        isLoading={isLoading}
        streamingText={streamingText}
        cardId={currentCardId || undefined}
        onFollowUp={(question) => handleSearch(question)}
      />

      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onSuccess={handleSignupSuccess}
      />

      {showPostSignupWelcome && (
        <PostSignupWelcome
          userName={user?.displayName}
          onClose={() => setShowPostSignupWelcome(false)}
          onStartTour={handleStartTour}
        />
      )}

      <FeatureTour
        isOpen={showFeatureTour}
        onComplete={() => { setShowFeatureTour(false); markTourCompleted(); }}
        onSkip={() => { setShowFeatureTour(false); markTourCompleted(); }}
      />
    </>
  );
};

export default TestNewHomepage;
