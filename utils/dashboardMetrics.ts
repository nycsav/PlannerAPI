/**
 * Dashboard metrics aggregation utilities
 * Processes intelligence cards into dashboard visualizations
 */

import { extractMetrics, ExtractedMetric } from './extractMetrics';
import { Timestamp } from 'firebase/firestore';

export type Pillar = 'ai_strategy' | 'brand_performance' | 'competitive_intel' | 'media_trends';

export interface IntelligenceCard {
  id: string;
  title: string;
  summary: string;
  signals: string[];
  moves: string[];
  pillar: Pillar;
  priority: number;
  sourceCount: number;
  publishedAt: Timestamp;
  type: 'brief' | 'hot_take';
  graphData?: {
    comparisons?: Array<{
      label: string;
      value: number;
      unit: string;
      context: string;
      source?: string;
    }>;
    metrics?: Array<{
      label: string;
      value: number;
      unit: string;
      context: string;
    }>;
  };
}

export interface PillarDistribution {
  pillar: Pillar;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface TrendDataPoint {
  date: string;
  ai_strategy: number;
  brand_performance: number;
  competitive_intel: number;
  media_trends: number;
}

// Pillar configuration
export const PILLAR_CONFIG: Record<Pillar, { label: string; color: string; gradient: string; icon: string }> = {
  ai_strategy: {
    label: 'AI Strategy',
    color: '#7C3AED',
    gradient: 'from-purple-500 to-violet-600',
    icon: 'Brain'
  },
  brand_performance: {
    label: 'Brand Performance',
    color: '#2563EB',
    gradient: 'from-blue-500 to-cyan-500',
    icon: 'TrendingUp'
  },
  competitive_intel: {
    label: 'Competitive Intel',
    color: '#FF6B35',
    gradient: 'from-orange-500 to-amber-500',
    icon: 'Eye'
  },
  media_trends: {
    label: 'Media Trends',
    color: '#059669',
    gradient: 'from-emerald-500 to-teal-500',
    icon: 'Radio'
  }
};

/**
 * Aggregate metrics from multiple cards
 * Returns top metrics across all card summaries and signals
 */
export function aggregateCardMetrics(cards: IntelligenceCard[]): ExtractedMetric[] {
  const allMetrics: ExtractedMetric[] = [];

  cards.forEach(card => {
    // Extract from summary
    const summaryMetrics = extractMetrics(card.summary);
    allMetrics.push(...summaryMetrics);

    // Extract from signals
    card.signals.forEach(signal => {
      const signalMetrics = extractMetrics(signal);
      allMetrics.push(...signalMetrics);
    });
  });

  // Deduplicate by value and rank by frequency
  const metricCounts = new Map<string, { metric: ExtractedMetric; count: number }>();

  allMetrics.forEach(metric => {
    const key = `${metric.value}-${metric.label}`;
    if (metricCounts.has(key)) {
      metricCounts.get(key)!.count++;
    } else {
      metricCounts.set(key, { metric, count: 1 });
    }
  });

  return Array.from(metricCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map(item => item.metric);
}

/**
 * Group cards by pillar for distribution chart
 */
export function groupByPillar(cards: IntelligenceCard[]): PillarDistribution[] {
  const counts: Record<Pillar, number> = {
    ai_strategy: 0,
    brand_performance: 0,
    competitive_intel: 0,
    media_trends: 0
  };

  cards.forEach(card => {
    counts[card.pillar]++;
  });

  const total = cards.length;

  return (Object.keys(counts) as Pillar[]).map(pillar => ({
    pillar,
    label: PILLAR_CONFIG[pillar].label,
    count: counts[pillar],
    percentage: total > 0 ? Math.round((counts[pillar] / total) * 100) : 0,
    color: PILLAR_CONFIG[pillar].color
  }));
}

/**
 * Generate trend data for timeline visualization
 * Groups cards by date and pillar
 */
export function generateTrendData(cards: IntelligenceCard[], days: number = 7): TrendDataPoint[] {
  const trendMap = new Map<string, TrendDataPoint>();

  // Initialize all dates with zero counts
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    trendMap.set(dateKey, {
      date: dateKey,
      ai_strategy: 0,
      brand_performance: 0,
      competitive_intel: 0,
      media_trends: 0
    });
  }

  // Count cards per date per pillar
  cards.forEach(card => {
    const dateKey = card.publishedAt.toDate().toISOString().split('T')[0];
    if (trendMap.has(dateKey)) {
      const point = trendMap.get(dateKey)!;
      point[card.pillar]++;
    }
  });

  // Sort by date ascending
  return Array.from(trendMap.values())
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Format date for display
 */
export function formatDate(timestamp: Timestamp): string {
  const date = timestamp.toDate();
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Calculate estimated read time based on content length
 */
export function calculateReadTime(card: IntelligenceCard): number {
  const wordCount =
    card.summary.split(/\s+/).length +
    card.signals.join(' ').split(/\s+/).length +
    card.moves.join(' ').split(/\s+/).length;

  // Average reading speed: 200 words per minute
  return Math.max(2, Math.ceil(wordCount / 200));
}
