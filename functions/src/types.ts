/**
 * Shared type definitions for Firebase Cloud Functions
 */

import { Timestamp } from 'firebase-admin/firestore';

/**
 * Discover Card - Daily intelligence card for Discover feed
 */
export type DiscoverCard = {
  id?: string; // Auto-generated Firestore ID (optional for creation)
  title: string;
  summary: string;
  signals: string[];
  moves: string[];
  pillar: 'ai_strategy' | 'brand_performance' | 'competitive_intel' | 'media_trends';
  priority: number; // 1-100 (determines hero vs secondary)
  publishedAt: Timestamp;
  type: 'brief' | 'hot_take' | 'datapulse';
  createdAt: Timestamp;

  // Source metadata
  source: string; // Source name (e.g., "McKinsey & Company", "Digiday")
  sourceUrl?: string; // Direct URL to source article/report
  sourceTier: number; // 1-5 (1 = Premier, 5 = Ecosystem)
  sourceCount?: number; // Number of sources analyzed (optional)
  sources?: Array<{ // Array of all sources used (for citation display)
    sourceName: string;
    sourceUrl: string;
    snippet?: string;
    title?: string;
  }>;

  // Content metadata
  contentSource?: 'n8n' | 'firebase' | 'manual'; // How the card was generated
  contentHash?: string; // MD5 hash for deduplication
  validationScore?: number; // 0-100 quality score from validation

  // Audience Strategy metadata (see docs/AUDIENCE-STRATEGY.md Section B)
  audienceSegment?: 'CMO_Mid-Market' | 'Agency_Strategy' | 'CX_Leader' | 'Independent_Consultant' | 'Cross-Segment';
  painPoint?: Array<'budget_pressure' | 'AI_integration_chaos' | 'measurement_collapse' | 'headcount_reduction' | 'client_fee_erosion' | 'martech_sprawl' | 'competitive_disintermediation' | 'skills_gap' | 'attribution_breakdown'>;
  budgetAuthority?: 'Direct_$100K+' | 'Direct_$25-100K' | 'Influence_Only' | 'Personal_<$5K';
  offerFit?: 'Daily_Briefing' | 'Consulting_Hook' | 'Deep_Research' | 'Framework_Template' | 'Workflow_Playbook';
  priorityScore?: number; // 1-10, calculated: (Source Tier × 0.3) + (Relevance × 0.3) + (Budget Authority rank × 0.2) + (Pain Point match count × 0.2)
  engagedContentType?: Array<'board_deck_data' | 'benchmark_report' | 'vendor_comparison' | 'workflow_automation' | 'ROI_calculator' | 'case_study' | 'regulatory_update' | 'competitive_teardown'>;

  // LinkedIn metadata (if posted to LinkedIn)
  linkedinPosted?: boolean;
  linkedinPostedAt?: Timestamp;
  linkedinPostUrl?: string;

  // Optional enhancements
  macroAnchor?: string; // Tier 1/2 research anchor
  microSignal?: string; // Latest development <24h
  tension?: string; // The conflict/gap description
  imageUrl?: string; // Optional thumbnail image URL
  chartData?: Array<{ // Optional chart data for visualization
    label: string;
    value: number;
  }>;
};

/**
 * Content Pillar configuration for discover card generation
 */
export type PillarConfig = {
  id: 'ai_strategy' | 'brand_performance' | 'competitive_intel' | 'media_trends';
  query: string;
  cardCount: number;
  diverseQueries?: string[]; // Different query angles for content diversity
};
