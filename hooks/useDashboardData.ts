/**
 * Custom hook for fetching and processing dashboard data
 * Queries Firestore and provides aggregated metrics
 */

import { useState, useEffect, useCallback } from 'react';
import { db } from '../utils/firebase';
import { collection, query, orderBy, limit, getDocs, where, Timestamp } from 'firebase/firestore';
import {
  IntelligenceCard,
  PillarDistribution,
  aggregateCardMetrics,
  groupByPillar,
  generateTrendData,
  TrendDataPoint,
  Pillar
} from '../utils/dashboardMetrics';
import { ExtractedMetric } from '../utils/extractMetrics';

// Fallback cards - shown when Firestore is empty or fails
const FALLBACK_CARDS: IntelligenceCard[] = [
  {
    id: 'fallback-1',
    title: 'AI Marketing Spend Surpasses $12B in 2026, Up 340% YoY',
    summary: 'Enterprise marketing leaders are rapidly adopting AI tools for content generation, customer segmentation, and predictive analytics. Fortune 500 CMOs report 23% efficiency gains and 34% improvement in campaign personalization.',
    signals: [
      'Global AI marketing technology spend reached $12.4B in Q1 2026',
      '89% of enterprise marketers now use at least one AI tool daily',
      'Average ROI of 4.2x on AI marketing investments within 8 months'
    ],
    moves: [
      'Audit current martech stack for AI integration opportunities',
      'Pilot AI-powered segmentation tools in one high-value campaign',
      'Establish governance framework for AI-generated content approval'
    ],
    pillar: 'ai_strategy' as const,
    priority: 95,
    sourceCount: 12,
    publishedAt: Timestamp.now(),
    type: 'brief' as const
  },
  {
    id: 'fallback-2',
    title: 'First-Party Data Collection Drives 51% Higher Engagement',
    summary: 'Brands collecting zero-party data through interactive experiences achieve significantly higher engagement and conversion rates versus third-party cookie-based targeting.',
    signals: [
      '51% higher engagement rates for zero-party data strategies',
      '34% improved conversion versus third-party targeting',
      'Interactive quizzes generate 2.3x more actionable customer insights'
    ],
    moves: [
      'Implement preference centers to collect explicit customer data',
      'Design interactive quiz or assessment to capture zero-party insights',
      'Evaluate enterprise CDP vendors (Segment, mParticle, Treasure Data)'
    ],
    pillar: 'brand_performance' as const,
    priority: 88,
    sourceCount: 8,
    publishedAt: Timestamp.now(),
    type: 'brief' as const
  },
  {
    id: 'fallback-3',
    title: 'Retail Media Consolidation: Top 3 Networks Hold 64% Share',
    summary: 'Amazon Ads, Walmart Connect, and Target Roundel command nearly two-thirds of the $65B retail media market. Brands are consolidating to 2-3 primary partners.',
    signals: [
      'Amazon Ads holds 38% market share, Walmart 16%, Target 10%',
      'Smaller retail media networks struggle to achieve scale',
      'First-party data moats create sustainable competitive advantages'
    ],
    moves: [
      'Negotiate guaranteed ROAS deals with top-tier retail media partners',
      'Consolidate retail media spend to 2-3 strategic platforms',
      'Develop retail media testing framework for emerging networks'
    ],
    pillar: 'competitive_intel' as const,
    priority: 86,
    sourceCount: 15,
    publishedAt: Timestamp.now(),
    type: 'brief' as const
  },
  {
    id: 'fallback-4',
    title: 'TikTok Shop Hits $12B US Revenue, Reshaping Social Commerce',
    summary: 'Social commerce disrupts traditional e-commerce playbook as TikTok Shop achieves 340% YoY growth. Average conversion rates are 2.8x higher than Instagram Shopping.',
    signals: [
      '$12B projected US revenue for TikTok Shop in 2026',
      'Brands allocating 15-25% of social budgets to shoppable video',
      '2.8x higher conversion rates than Instagram Shopping'
    ],
    moves: [
      'Test TikTok Shop with 3-5 SKUs in high-margin product categories',
      'Partner with micro-influencers for authentic live commerce sessions',
      'Rethink social-to-commerce attribution models and KPIs'
    ],
    pillar: 'media_trends' as const,
    priority: 92,
    sourceCount: 10,
    publishedAt: Timestamp.now(),
    type: 'brief' as const
  },
  {
    id: 'fallback-5',
    title: 'B2B Attribution Gap Costs $8.9B Annually in Misallocated Spend',
    summary: '73% of B2B marketers cannot accurately attribute revenue to channels, resulting in massive budget waste. AI attribution tools deliver 42% CAC improvement.',
    signals: [
      '$8.9B in annual misallocated B2B marketing budgets',
      'Only 27% of B2B marketers have reliable multi-touch attribution',
      'AI attribution tools deliver 42% CAC improvement with 8-month payback'
    ],
    moves: [
      'Evaluate AI-powered attribution platforms (Bizible, Dreamdata, HockeyStack)',
      'Implement first-touch and last-touch attribution as baseline',
      'Build business case for multi-touch attribution investment'
    ],
    pillar: 'brand_performance' as const,
    priority: 84,
    sourceCount: 9,
    publishedAt: Timestamp.now(),
    type: 'hot_take' as const
  },
  {
    id: 'fallback-6',
    title: 'Sustainability Claims Face 56% Greenwashing Scrutiny Rate',
    summary: 'FTC investigates majority of Fortune 500 sustainability marketing claims. Brands with third-party verified ESG credentials maintain 89% consumer trust.',
    signals: [
      '56% of Fortune 500 sustainability claims under FTC investigation',
      'Third-party verified ESG credentials maintain 89% consumer trust',
      'CMOs investing $2-5M in verification infrastructure'
    ],
    moves: [
      'Audit all sustainability marketing claims for substantiation',
      'Obtain third-party ESG verification (B Corp, Climate Neutral)',
      'Implement legal review process for all green marketing materials'
    ],
    pillar: 'competitive_intel' as const,
    priority: 81,
    sourceCount: 11,
    publishedAt: Timestamp.now(),
    type: 'brief' as const
  }
];

interface UseDashboardDataOptions {
  pillar?: Pillar;
  dateRange?: { start: Date; end: Date };
  cardLimit?: number;
}

interface DashboardData {
  cards: IntelligenceCard[];
  pillarDistribution: PillarDistribution[];
  trendData: TrendDataPoint[];
  aggregatedMetrics: ExtractedMetric[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  isLiveData: boolean;
}

export function useDashboardData(options: UseDashboardDataOptions = {}): DashboardData {
  const { pillar, cardLimit = 20 } = options;

  const [cards, setCards] = useState<IntelligenceCard[]>(FALLBACK_CARDS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isLiveData, setIsLiveData] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const cardsRef = collection(db, 'discover_cards');

      // Simple query - just order by publishedAt to avoid index issues
      // Then sort by priority in memory
      const q = query(
        cardsRef,
        orderBy('publishedAt', 'desc'),
        limit(cardLimit)
      );

      const snapshot = await getDocs(q);
      let fetchedCards = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as IntelligenceCard[];

      // Sort by priority in memory
      fetchedCards = fetchedCards.sort((a, b) => (b.priority || 0) - (a.priority || 0));

      // Filter by pillar if specified
      if (pillar) {
        fetchedCards = fetchedCards.filter(card => card.pillar === pillar);
      }

      if (fetchedCards.length > 0) {
        setCards(fetchedCards);
        setIsLiveData(true);
      } else {
        // Use fallback cards if Firestore is empty
        const fallbackFiltered = pillar
          ? FALLBACK_CARDS.filter(card => card.pillar === pillar)
          : FALLBACK_CARDS;
        setCards(fallbackFiltered);
        setIsLiveData(false);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
      // Use fallback cards on error
      const fallbackFiltered = pillar
        ? FALLBACK_CARDS.filter(card => card.pillar === pillar)
        : FALLBACK_CARDS;
      setCards(fallbackFiltered);
      setIsLiveData(false);
    } finally {
      setLoading(false);
    }
  }, [pillar, cardLimit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Compute derived data
  const pillarDistribution = groupByPillar(cards);
  const trendData = generateTrendData(cards, 7);
  const aggregatedMetrics = aggregateCardMetrics(cards);

  return {
    cards,
    pillarDistribution,
    trendData,
    aggregatedMetrics,
    loading,
    error,
    refetch: fetchData,
    isLiveData
  };
}
