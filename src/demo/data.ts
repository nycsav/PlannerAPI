export type UiState = 'ready' | 'loading' | 'empty' | 'error';
export type ConsoleScreenId = 'overview' | 'daily-brief' | 'strategy-chat' | 'intelligence-feed';

export type DemoMetric = {
  label: string;
  value: string;
  delta?: string;
  tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
};

export type DemoSignal = {
  title: string;
  status: 'Stable' | 'Watch' | 'Critical';
  timestamp: string;
  source: string;
};

export type DemoBriefCard = {
  id: string;
  title: string;
  summary: string;
  category: string;
  timestamp: string;
  source: string;
};

export const demoMetrics: DemoMetric[] = [
  { label: 'Pipeline Velocity', value: '+18.4%', delta: 'WoW', tone: 'success' },
  { label: 'CAC Efficiency', value: '$412', delta: '-6.2%', tone: 'success' },
  { label: 'Share of Voice', value: '26.7%', delta: '+2.1 pts', tone: 'info' },
  { label: 'At-Risk Programs', value: '3', delta: 'Needs action', tone: 'warning' },
];

export const demoSignals: DemoSignal[] = [
  { title: 'Retail media CPM inflation in Q1 verticals', status: 'Watch', timestamp: 'Updated 08:15 ET', source: 'Source: —' },
  { title: 'Creator conversion uplift sustaining above 2.3x', status: 'Stable', timestamp: 'Updated 07:40 ET', source: 'Source: —' },
  { title: 'Search CPC spikes in branded terms', status: 'Critical', timestamp: 'Updated 08:03 ET', source: 'Source: —' },
];

export const demoBriefCards: DemoBriefCard[] = [
  {
    id: 'DB-01',
    title: 'Retail media compression favors top 2 networks',
    summary: 'Budget concentration is increasing. Rebalance test allocation before next weekly pacing run.',
    category: 'Market',
    timestamp: 'Published 06:02 ET',
    source: 'Source: —',
  },
  {
    id: 'DB-02',
    title: 'Zero-party preference capture improves paid efficiency',
    summary: 'Segments with explicit preferences show stronger CVR and lower blended CAC this week.',
    category: 'Audience',
    timestamp: 'Published 06:04 ET',
    source: 'Source: —',
  },
  {
    id: 'DB-03',
    title: 'Competitor creative velocity climbs in prospecting',
    summary: 'Competitors pushed higher frequency and new formats; refresh cadence likely required.',
    category: 'Competitive',
    timestamp: 'Published 06:07 ET',
    source: 'Source: —',
  },
];

export const demoDefaultState: Record<ConsoleScreenId, UiState> = {
  overview: 'ready',
  'daily-brief': 'ready',
  'strategy-chat': 'ready',
  'intelligence-feed': 'ready',
};
