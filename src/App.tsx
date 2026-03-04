import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './utils/firebase';
import { Navbar }           from './components/Navbar';
import { HeroSection }      from './components/HeroSection';
import { StatCallout }      from './components/StatCallout';
import { RecentSignalsTab } from './components/RecentSignalsTab';
import { SourceLogos }      from './components/SourceLogos';
import { HowItWorks }       from './components/HowItWorks';
import { AudienceGrid }     from './components/AudienceGrid';
import { ExampleCard }      from './components/ExampleCard';
import { Footer }           from './components/Footer';
import type { SignalCard }  from './components/RecentSignalsTab';
import type { ExampleCardData } from './components/ExampleCard';
import { ENDPOINTS } from './config/api';

// ---------------------------------------------------------------------------
// TASK 3: StatCallout — permanent editorial decision
// ---------------------------------------------------------------------------
const STAT = {
  stat:    '78/6',
  label:   'The AI Maturity Gap',
  context: '78% of marketing orgs adopted AI tools in 2025. Only 6% achieved measurable AI maturity. The gap is where your clients are stuck — and where your positioning lives.',
  source:  'McKINSEY GLOBAL AI SURVEY 2025',
};

// ---------------------------------------------------------------------------

const App: React.FC = () => {
  const [signupOpen, setSignupOpen] = useState(false);

  // TASK 1: Live Firestore cards
  const [cards, setCards] = useState<SignalCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);

  // Trending topics — never blocks search on failure
  const [trendingTopics, setTrendingTopics] = useState<{ topic: string; description: string }[]>([]);

  useEffect(() => {
    fetch(`${ENDPOINTS.trendingTopics}?audience=CMO`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.topics) setTrendingTopics(data.topics);
      })
      .catch(() => {/* silent — search stays enabled */});
  }, []);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const q = query(
          collection(db, 'discover_cards'),
          orderBy('publishedAt', 'desc'),
          limit(50)
        );
        const snapshot = await getDocs(q);
        console.log(`[Firestore] discover_cards fetched: ${snapshot.docs.length} total cards`);
        const fetched: SignalCard[] = snapshot.docs.map(doc => {
          const data = doc.data();
          const ts = data.publishedAt;
          const dateObj: Date = ts?.toDate ? ts.toDate() : new Date();
          const date = dateObj
            .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            .toUpperCase(); // e.g. "FEB 18"
          return {
            id:      doc.id,
            date,
            pillar:  data.pillar  ?? '',
            title:   data.title   ?? '',
            summary: data.summary ?? '',
            source:  Array.isArray(data.sources) && data.sources[0]
              ? (data.sources[0].sourceName ?? data.sources[0].title ?? String(data.source ?? ''))
              : String(data.source ?? ''),
            signals: data.signals ?? [],
            moves:   data.moves   ?? [],
            sources: Array.isArray(data.sources)
              ? data.sources.map((s: any) => s.sourceName ?? s.title ?? '').filter(Boolean)
              : (data.source ? [String(data.source)] : []),
            images:    Array.isArray(data.images)    ? data.images    : [],
            citations: Array.isArray(data.citations) ? data.citations : [],
          };
        });
        setCards(fetched);
      } catch (err) {
        console.error('Firestore fetch error:', err);
      } finally {
        setCardsLoading(false);
      }
    };
    fetchCards();
  }, []);

  // TASK 2: Derive example card from highest-priority live card
  const exampleCard: ExampleCardData | null = (!cardsLoading && cards.length > 0)
    ? {
        title:    cards[0].title   ?? '',
        summary:  cards[0].summary ?? '',
        signals:  Array.isArray(cards[0].signals) ? cards[0].signals.slice(0, 3) : [],
        nextMove: Array.isArray(cards[0].moves)   ? cards[0].moves[0] ?? '' : '',
        sources:  Array.isArray(cards[0].sources) ? cards[0].sources : [cards[0].source ?? ''],
      }
    : null;

  return (
    <div className="min-h-screen bg-[#0A1128] w-full">
      <Navbar onSignupClick={() => setSignupOpen(true)} />
      <HeroSection
        onGetStarted={() => setSignupOpen(true)}
        onSeeExample={() => document.getElementById('example-card-section')?.scrollIntoView({ behavior: 'smooth' })}
        trendingTopics={trendingTopics}
      />
      <StatCallout {...STAT} />
      <RecentSignalsTab cards={cards} loading={cardsLoading} />
      <SourceLogos />
      <AudienceGrid />
      <HowItWorks />
      <div id="example-card-section">
        <ExampleCard card={exampleCard} />
      </div>
      <Footer onGetStarted={() => setSignupOpen(true)} />

      {/* Signup modal */}
      {signupOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setSignupOpen(false)}
        >
          <div
            className="bg-[#0D1631] border border-[#1E2A45] p-10 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-mono text-[11px] uppercase text-[#E67E22] tracking-widest mb-4">
              Get Daily Signals
            </p>
            <p className="font-sans text-[14px] text-[#7A8BA0] mb-6">
              Enter your email to receive 3 intelligence signals every morning.
            </p>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full bg-transparent border border-[#1E2A45] text-[#F5F5F5] font-mono text-[13px] px-4 py-3 mb-3 outline-none focus:border-[#E67E22] transition-colors"
            />
            <button
              type="button"
              className="w-full bg-[#E67E22] text-[#0A1128] font-mono font-bold text-[12px] uppercase tracking-wide py-3 border-none cursor-pointer hover:opacity-90 transition-opacity"
            >
              Get Access
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
