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

  // Fix 3: On mount, check if URL is /brief/:cardId — load and open that card
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
          });
          setIntelligenceOpen(true);
        }
      } catch (err) {
        console.error('[brief] fetch card error:', err);
      }
    };
    fetchCardById();
  }, []); // intentionally run once on mount

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

  // Fix 2: ASK button now calls /chat-intel → opens modal immediately with structured response
  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setIntelligencePayload(null);
    setCurrentCardId(null);
    setIntelligenceOpen(true);
    setSearchResults([]);

    try {
      const resp = await fetchWithTimeout(ENDPOINTS.chatIntelSearch, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, audience: 'CMO' }),
        timeout: 30000,
      });

      if (!resp.ok) throw new Error(`Backend error: ${resp.status}`);
      const data = await resp.json();

      // /chat-intel returns { signals: IntelligenceSignal[], implications: string[], actions: string[] }
      const payload: IntelligencePayload = {
        query,
        summary: (data.signals?.[0]?.summary) || (data.implications?.[0]) || '',
        keySignals: data.implications || [],
        signals: data.signals || [],
        movesForLeaders: data.actions?.length > 0 ? data.actions : [
          'Review the key signals and assess impact on your current strategy',
          'Identify quick-win opportunities to implement within 30 days',
          'Establish measurement framework to track progress',
        ],
      };
      setIntelligencePayload(payload);
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
