/**
 * Firebase Cloud Functions Entry Point
 *
 * Exports all cloud functions for signal2noise
 */

export { chatIntel, chatIntelStream } from './chat-intel';
export { chatSimple } from './chat-simple';
export { generateDiscoverCards } from './generateDiscoverCards';
export { storeN8nCards } from './storeN8nCards';
export { storeDailyBrief } from './storeDailyBrief';
export { markLinkedInPosted } from './markLinkedInPosted';
export { getTopCardForPublishing } from './getTopCardForPublishing';

// Premium content enrichment with Opus 4.6 (uses $50 API credit)
export { enrichPremiumBriefFunction as enrichPremiumBrief } from './enrichPremiumBrief';

// CopilotKit Runtime
export { copilotRuntime, copilotHealth } from './copilot-runtime';

// Perplexity API v2 Endpoints (six modes)
export {
  perplexitySearch,
  perplexityResearch,
  perplexityRawSearch,
  perplexitySearchInstant,
  getSignalScores,
  getSignalInsight,
} from './perplexity-endpoints';

// Notion API Endpoints
export { getSourceReports } from './notion-endpoints';
