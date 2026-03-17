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
 * Hero Stat - Market Pulse stat for homepage (tier-1 enterprise AI research)
 */
export type HeroStat = {
  stat: string; // e.g. "68% of enterprise CMOs lack AI budget authority — McKinsey Q1 2026"
  source?: string;
  publishedAt: Timestamp;
  createdAt: Timestamp;
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

/**
 * Chat Thread - Persistent conversation for IntelligenceModal
 */
export type ChatThread = {
  id: string;
  userId?: string;
  cardId?: string;
  topic: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
