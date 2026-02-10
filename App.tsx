import React, { useEffect, useMemo, useState } from 'react';
import { LayoutGrid, Newspaper, MessageSquareText, Radar, Clock3 } from 'lucide-react';
import { HeroSearch } from './components/HeroSearch';
import { DailyBriefPreview } from './components/DailyBriefPreview';
import { ExecutiveStrategyChat } from './components/ExecutiveStrategyChat';
import { DashboardSection } from './components/DashboardSection';
import { IntelligenceModal, IntelligencePayload } from './components/IntelligenceModal';
import { SignupModal } from './components/SignupModal';
import { PostSignupWelcome } from './components/PostSignupWelcome';
import { FeatureTour } from './components/FeatureTour';
import { WelcomeTooltip } from './components/WelcomeTooltip';
import { NewContentBadge } from './components/NewContentBadge';
import { ThemeToggle } from './components/ThemeToggle';
import { useAudience } from './contexts/AudienceContext';
import { useAuth } from './contexts/AuthContext';
import { ENDPOINTS, fetchWithTimeout } from './src/config/api';
import { PageShell } from './components/ui/PageShell';
import { SectionHeader } from './components/ui/SectionHeader';
import { Card, CardBody, CardHeader } from './components/ui/Card';
import { Metric } from './components/ui/Metric';
import { Badge } from './components/ui/Badge';
import { Button } from './components/ui/Button';
import { isDemoMode } from './src/demo/demoMode';
import { getLayoutVariant, setLayoutVariant, type LayoutVariant } from './src/demo/layoutVariant';
import {
  demoMetrics,
  demoSignals,
  demoBriefCards,
  demoDefaultState,
  type UiState,
  type ConsoleScreenId,
} from './src/demo/data';
import {
  isFirstVisit,
  markAsVisited,
  markOnboardingCompleted,
  markTourCompleted,
  hasWelcomeTooltipBeenDismissed,
  markWelcomeTooltipDismissed,
  updateLastVisit,
  shouldShowNewContentBadge,
  getNewContentCount,
  updateLastDailyIntelCheck,
} from './utils/userState';

type IntelligenceBriefing = {
  id: string;
  date: string;
  title: string;
  description: string;
  theme: string;
  query?: string;
};

const FALLBACK_BRIEFINGS: IntelligenceBriefing[] = [
  {
    id: 'LOG-201',
    date: '19.01.2026',
    title: 'Retail media concentration keeps accelerating',
    description: 'Top network concentration is pushing benchmark costs higher. Tighten incremental tests and holdout design this week.',
    theme: 'Market Trends',
  },
  {
    id: 'LOG-202',
    date: '19.01.2026',
    title: 'AI-assisted campaign ops reducing turnaround time',
    description: 'Teams using AI workflow support are cutting launch cycles and reporting handoff delays across paid programs.',
    theme: 'AI Strategy',
  },
  {
    id: 'LOG-203',
    date: '19.01.2026',
    title: 'Attribution quality driving spend confidence',
    description: 'Organizations with stronger incrementality frameworks are reallocating faster and preserving CAC efficiency.',
    theme: 'Revenue Growth',
  },
];

const SCREEN_IDS: ConsoleScreenId[] = ['overview', 'daily-brief', 'strategy-chat', 'intelligence-feed'];

const App: React.FC = () => {
  const { audience } = useAudience();
  const { user } = useAuth();

  const [activeScreen, setActiveScreen] = useState<ConsoleScreenId>('overview');
  const [layoutVariant, setLayoutVariantState] = useState<LayoutVariant>(() => getLayoutVariant());
  const [screenState, setScreenState] = useState<Record<ConsoleScreenId, UiState>>(demoDefaultState);

  const [chatQuery, setChatQuery] = useState<string>('');
  const [intelligenceOpen, setIntelligenceOpen] = useState(false);
  const [intelligencePayload, setIntelligencePayload] = useState<IntelligencePayload | null>(null);
  const [isLoadingIntelligence, setIsLoadingIntelligence] = useState(false);

  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [showWelcomeTooltip, setShowWelcomeTooltip] = useState(false);
  const [showPostSignupWelcome, setShowPostSignupWelcome] = useState(false);
  const [showFeatureTour, setShowFeatureTour] = useState(false);

  const [showNewBadge, setShowNewBadge] = useState(false);
  const [newContentCount, setNewContentCount] = useState(0);

  const [briefings, setBriefings] = useState<IntelligenceBriefing[]>([]);
  const [loadingBriefings, setLoadingBriefings] = useState<boolean>(true);

  const navItems = useMemo(
    () => [
      { id: 'overview', label: 'Overview', icon: <LayoutGrid size={16} /> },
      { id: 'daily-brief', label: 'Daily Brief', icon: <Newspaper size={16} /> },
      { id: 'strategy-chat', label: 'Strategy Chat', icon: <MessageSquareText size={16} /> },
      { id: 'intelligence-feed', label: 'Intelligence Feed', icon: <Radar size={16} /> },
    ],
    []
  );

  const displayBriefings = briefings.length > 0 ? briefings : FALLBACK_BRIEFINGS;

  const toggleLayoutVariant = () => {
    const next: LayoutVariant = layoutVariant === 'A' ? 'B' : 'A';
    setLayoutVariant(next);
    setLayoutVariantState(next);
  };

  const fetchIntelligence = async (query: string, displayQuery?: string) => {
    setIntelligenceOpen(true);
    setIsLoadingIntelligence(true);
    setIntelligencePayload(null);

    if (isDemoMode) {
      setIntelligencePayload({
        query: displayQuery || query,
        summary:
          'Demo mode: this executive brief emphasizes immediate decisions, confidence level, and next-week revenue implications.',
        keySignals: demoSignals.map((item) => item.title),
        movesForLeaders: [
          'Reallocate 8-12% of low-efficiency budget into top-performing audience segments.',
          'Hold daily pacing checkpoint for at-risk programs until volatility normalizes.',
          'Trigger creative refresh for channels with rising cost and flat conversion.',
        ],
        signals: demoSignals.map((item, idx) => ({
          id: `demo-${idx}`,
          title: item.title,
          sourceName: item.source,
          sourceUrl: '#',
          summary: item.status,
        })),
      });
      setIsLoadingIntelligence(false);
      return;
    }

    try {
      const audienceFormatted = audience.replace(/_/g, ' ');
      const res = await fetchWithTimeout(ENDPOINTS.chatIntel, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ query, audience: audienceFormatted }),
        timeout: 50000,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Request failed: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      const cleanQuery = displayQuery || query;

      setIntelligencePayload({
        query: cleanQuery,
        summary: data.implications?.join(' ') || 'No summary available.',
        keySignals: data.signals?.map((s: any) => s.title || s.summary) || [],
        signals: data.signals || [],
        movesForLeaders: data.actions || [],
        frameworks: data.frameworks,
        followUps: data.followUps || [],
        graphData: data.graphData,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setIntelligencePayload({
        query: displayQuery || query,
        summary: `Unable to load intelligence right now. ${message}`,
        keySignals: [],
        movesForLeaders: [],
        signals: [],
      });
    } finally {
      setIsLoadingIntelligence(false);
    }
  };

  const openSearch = (query: string) => {
    fetchIntelligence(query);
  };

  const openStrategyChat = (query?: string) => {
    setActiveScreen('strategy-chat');
    if (query) setChatQuery(query);
  };

  const handleChatQueryProcessed = () => {
    setChatQuery('');
  };

  const fetchBriefings = async () => {
    if (isDemoMode) {
      setBriefings(
        demoBriefCards.map((card) => ({
          id: card.id,
          date: card.timestamp,
          title: card.title,
          description: card.summary,
          theme: card.category,
        }))
      );
      setLoadingBriefings(false);
      return;
    }

    setLoadingBriefings(true);
    try {
      const audienceFormatted = audience.replace(/_/g, ' ');
      const res = await fetch(
        `${ENDPOINTS.briefingsLatest}?audience=${encodeURIComponent(audienceFormatted)}&limit=6`
      );

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();

      if (data.briefings && data.briefings.length > 0) {
        setBriefings(data.briefings);
      } else {
        setBriefings(FALLBACK_BRIEFINGS);
      }
    } catch (error) {
      console.error('Failed to fetch briefings, using fallback:', error);
      setBriefings(FALLBACK_BRIEFINGS);
    } finally {
      setLoadingBriefings(false);
    }
  };

  useEffect(() => {
    fetchBriefings();
  }, [audience]);

  useEffect(() => {
    const handleOpenBriefModal = (e: Event) => {
      const customEvent = e as CustomEvent;
      const briefData = customEvent.detail.brief;

      const transformedSignals = (briefData.sources || []).map((citation: any, index: number) => ({
        sourceName: citation.title || `Source ${index + 1}`,
        sourceUrl: citation.url || '#',
        snippet: citation.snippet || '',
        title: citation.title || `Source ${index + 1}`,
      }));

      setIntelligencePayload({
        query: briefData.title || "Today's Intelligence Brief",
        summary: briefData.summary || '',
        keySignals: [],
        movesForLeaders: [],
        signals: transformedSignals,
      });
      setIntelligenceOpen(true);
    };

    window.addEventListener('openBriefModal', handleOpenBriefModal);
    return () => window.removeEventListener('openBriefModal', handleOpenBriefModal);
  }, []);

  useEffect(() => {
    updateLastVisit();

    if (isFirstVisit() && !hasWelcomeTooltipBeenDismissed()) {
      setTimeout(() => setShowWelcomeTooltip(true), 1000);
      markAsVisited();
    }

    if (shouldShowNewContentBadge()) {
      setShowNewBadge(true);
      setNewContentCount(getNewContentCount());
    }
  }, []);

  const handleSignupSuccess = () => {
    setShowPostSignupWelcome(true);
    markOnboardingCompleted();
  };

  const handleStartTour = () => {
    setShowFeatureTour(true);
  };

  const handleNewContentClick = () => {
    setActiveScreen('intelligence-feed');
    updateLastDailyIntelCheck();
    setShowNewBadge(false);
    setNewContentCount(0);
  };

  const cycleScreenState = (screenId: ConsoleScreenId) => {
    if (!isDemoMode) return;
    const order: UiState[] = ['ready', 'loading', 'empty', 'error'];
    const currentIndex = order.indexOf(screenState[screenId]);
    const next = order[(currentIndex + 1) % order.length];
    setScreenState((prev) => ({ ...prev, [screenId]: next }));
  };

  const stateGate = (screenId: ConsoleScreenId, content: React.ReactNode) => {
    const status = screenState[screenId];
    if (status === 'ready') return content;

    if (status === 'loading') {
      return (
        <Card>
          <CardBody>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Loading intelligence view...</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Status: ingesting latest signals and recalculating priorities.</p>
          </CardBody>
        </Card>
      );
    }

    if (status === 'empty') {
      return (
        <Card>
          <CardBody>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">No records to show</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Source: — • Updated: {new Date().toLocaleTimeString()}</p>
          </CardBody>
        </Card>
      );
    }

    return (
      <Card>
        <CardBody>
          <p className="text-sm font-medium text-red-700 dark:text-red-300">Unable to load this section</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Status: degraded • Source: —</p>
        </CardBody>
      </Card>
    );
  };

  const credibilityBadges = (screenId: ConsoleScreenId) => (
    <>
      <Badge tone="info">
        <Clock3 size={12} className="mr-1" /> Updated {new Date().toLocaleTimeString()}
      </Badge>
      <Badge tone="neutral">Source: —</Badge>
      <Badge tone="success">Status: Operational</Badge>
      {isDemoMode && import.meta.env.DEV && (
        <Button variant="ghost" onClick={() => cycleScreenState(screenId)}>
          Demo State: {screenState[screenId]}
        </Button>
      )}
    </>
  );

  const topRight = (
    <>
      <ThemeToggle />
      {import.meta.env.DEV && (
        <Button variant="ghost" onClick={toggleLayoutVariant}>
          Layout: A / B · {layoutVariant}
        </Button>
      )}
      {user ? (
        <Badge tone="neutral">{user.displayName || user.email || 'User'}</Badge>
      ) : (
        <Button variant="primary" onClick={() => setIsSignupModalOpen(true)}>
          Save Brief
        </Button>
      )}
    </>
  );

  return (
    <>
      <PageShell
        variant={layoutVariant}
        productName="PlannerAPI Executive Intelligence Console"
        navItems={navItems}
        activeNav={activeScreen}
        onNavChange={(id) => setActiveScreen(id as ConsoleScreenId)}
        topRight={topRight}
      >
        {activeScreen === 'overview' && (
          <section>
            <SectionHeader
              title="Executive Overview"
              subtitle="Decision-grade pulse for CMO and VP Marketing operators."
              actions={credibilityBadges('overview')}
            />

            {stateGate(
              'overview',
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {demoMetrics.map((metric) => (
                    <Card key={metric.label}>
                      <CardBody>
                        <Metric
                          label={metric.label}
                          value={metric.value}
                          delta={metric.delta}
                          deltaTone={metric.tone || 'neutral'}
                        />
                      </CardBody>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                  <div className="xl:col-span-8">
                    <Card>
                      <CardHeader>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Ask the Console</p>
                      </CardHeader>
                      <CardBody>
                        {isDemoMode ? (
                          <div className="space-y-3">
                            {demoBriefCards.map((card) => (
                              <button
                                key={card.id}
                                onClick={() => openSearch(card.title)}
                                className="w-full rounded-lg border border-slate-200 p-3 text-left text-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                              >
                                <p className="font-medium text-slate-900 dark:text-slate-100">{card.title}</p>
                                <p className="mt-1 text-slate-600 dark:text-slate-300">{card.summary}</p>
                              </button>
                            ))}
                            <p className="text-xs text-slate-500 dark:text-slate-400">Demo mode uses local data only.</p>
                          </div>
                        ) : (
                          <HeroSearch onSearch={openSearch} onOpenChat={openStrategyChat} />
                        )}
                      </CardBody>
                    </Card>
                  </div>

                  <div className="xl:col-span-4">
                    <Card className="h-full">
                      <CardHeader>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Priority Signals</p>
                      </CardHeader>
                      <CardBody className="space-y-3">
                        {demoSignals.map((signal) => (
                          <div key={signal.title} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{signal.title}</p>
                              <Badge
                                tone={
                                  signal.status === 'Critical'
                                    ? 'danger'
                                    : signal.status === 'Watch'
                                      ? 'warning'
                                      : 'success'
                                }
                              >
                                {signal.status}
                              </Badge>
                            </div>
                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{signal.timestamp} • {signal.source}</p>
                          </div>
                        ))}
                      </CardBody>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {activeScreen === 'daily-brief' && (
          <section>
            <SectionHeader
              title="Daily Brief"
              subtitle="Morning intelligence recap with operator-ready takeaways."
              actions={credibilityBadges('daily-brief')}
            />

            {stateGate(
              'daily-brief',
              <div className="space-y-6">
                {isDemoMode ? (
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                    {demoBriefCards.map((card) => (
                      <Card key={card.id} className="xl:col-span-4">
                        <CardHeader>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{card.category}</p>
                            <Badge tone="info">Live</Badge>
                          </div>
                        </CardHeader>
                        <CardBody>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{card.title}</p>
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{card.summary}</p>
                          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{card.timestamp} • {card.source}</p>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <>
                    <Card>
                      <CardBody>
                        <DailyBriefPreview />
                      </CardBody>
                    </Card>

                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                      {(loadingBriefings ? [] : displayBriefings).map((brief) => (
                        <Card key={brief.id} className="xl:col-span-4">
                          <CardHeader>
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{brief.theme}</p>
                              <Badge tone="neutral">{brief.date}</Badge>
                            </div>
                          </CardHeader>
                          <CardBody>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{brief.title}</p>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{brief.description}</p>
                            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Source: — • Status: Reviewed</p>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </section>
        )}

        {activeScreen === 'strategy-chat' && (
          <section>
            <SectionHeader
              title="Strategy Chat"
              subtitle="Interactive planning for campaign priorities and trade-off decisions."
              actions={credibilityBadges('strategy-chat')}
            />

            {stateGate(
              'strategy-chat',
              isDemoMode ? (
                <Card>
                  <CardBody>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Demo conversation preview</p>
                    <p className="mt-3 rounded-lg bg-slate-100 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      “Given rising prospecting costs, shift 10% budget into retention audiences for 7 days, then validate lift in blended CAC.”
                    </p>
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Source: — • Confidence: Medium</p>
                  </CardBody>
                </Card>
              ) : (
                <Card>
                  <CardBody>
                    <ExecutiveStrategyChat
                      externalQuery={chatQuery}
                      onExternalQueryProcessed={handleChatQueryProcessed}
                    />
                  </CardBody>
                </Card>
              )
            )}
          </section>
        )}

        {activeScreen === 'intelligence-feed' && (
          <section>
            <SectionHeader
              title="Intelligence Feed"
              subtitle="Continuous stream of market movements and tactical recommendations."
              actions={
                <>
                  {credibilityBadges('intelligence-feed')}
                  {showNewBadge && (
                    <NewContentBadge count={newContentCount} onClick={handleNewContentClick} />
                  )}
                </>
              }
            />

            {stateGate(
              'intelligence-feed',
              isDemoMode ? (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                  {demoSignals.map((signal) => (
                    <Card key={signal.title} className="xl:col-span-4">
                      <CardHeader>
                        <div className="flex items-center justify-between gap-2">
                          <Badge tone="neutral">Signal</Badge>
                          <Badge
                            tone={
                              signal.status === 'Critical'
                                ? 'danger'
                                : signal.status === 'Watch'
                                  ? 'warning'
                                  : 'success'
                            }
                          >
                            {signal.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardBody>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{signal.title}</p>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{signal.timestamp} • {signal.source}</p>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardBody>
                    <DashboardSection />
                  </CardBody>
                </Card>
              )
            )}
          </section>
        )}
      </PageShell>

      <IntelligenceModal
        open={intelligenceOpen}
        payload={intelligencePayload}
        onClose={() => setIntelligenceOpen(false)}
        isLoading={isLoadingIntelligence}
        onFollowUp={(question, displayQuery) => fetchIntelligence(question, displayQuery)}
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
        onComplete={() => {
          setShowFeatureTour(false);
          markTourCompleted();
        }}
        onSkip={() => {
          setShowFeatureTour(false);
          markTourCompleted();
        }}
      />

      {showWelcomeTooltip && (
        <WelcomeTooltip
          onDismiss={() => {
            setShowWelcomeTooltip(false);
            markWelcomeTooltipDismissed();
          }}
        />
      )}
    </>
  );
};

export default App;
