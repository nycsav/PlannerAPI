/**
 * Content Validation Utility for Daily Intelligence Cards
 *
 * Validates cards from n8n workflow before storing in Firestore.
 * Enforces editorial standards from EDITORIAL_VOICE.md and DAILY_INTEL_FRAMEWORK.md
 */

export interface ValidationResult {
  isValid: boolean;
  score: number;
  issues: string[];
  warnings: string[];
}

/**
 * Validates a discover card against quality standards
 *
 * @param card - The card to validate
 * @returns ValidationResult with isValid flag, score (0-100), issues, and warnings
 */
export function validateDiscoverCard(card: any): ValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // ============================================
  // CRITICAL CHECKS (must pass or reject card)
  // ============================================

  // Check: Title exists and has reasonable length
  if (!card.title || card.title.trim().length === 0) {
    issues.push('Title is missing');
    score -= 50;
  } else if (card.title.length > 80) {
    issues.push(`Title too long (${card.title.length} chars, max 80)`);
    score -= 20;
  } else if (card.title.length < 20) {
    issues.push(`Title too short (${card.title.length} chars, min 20)`);
    score -= 15;
  }

  // Check: Summary exists and has substance
  if (!card.summary || card.summary.trim().length === 0) {
    issues.push('Summary is missing');
    score -= 50;
  } else if (card.summary.length < 50) {
    issues.push(`Summary too short (${card.summary.length} chars, min 50)`);
    score -= 30;
  } else if (card.summary.length > 500) {
    warnings.push(`Summary very long (${card.summary.length} chars) - consider condensing`);
    score -= 5;
  }

  // Check: Signals array exists and has minimum content
  if (!card.signals || !Array.isArray(card.signals)) {
    issues.push('Signals field is missing or not an array');
    score -= 25;
  } else if (card.signals.length < 2) {
    issues.push(`Need at least 2 signals (found ${card.signals.length})`);
    score -= 25;
  } else if (card.signals.length > 6) {
    warnings.push(`Too many signals (${card.signals.length}) - recommended max is 4-5`);
    score -= 5;
  }

  // Check: Moves array exists and has actionable content
  if (!card.moves || !Array.isArray(card.moves)) {
    issues.push('Moves field is missing or not an array');
    score -= 25;
  } else if (card.moves.length < 2) {
    issues.push(`Need at least 2 moves (found ${card.moves.length})`);
    score -= 25;
  } else if (card.moves.length > 5) {
    warnings.push(`Too many moves (${card.moves.length}) - recommended max is 3-4`);
    score -= 5;
  }

  // Check: First move starts with "Your next move:"
  if (card.moves && card.moves.length > 0) {
    const firstMove = card.moves[0]?.trim() || '';
    if (!firstMove.startsWith('Your next move:')) {
      issues.push('First move must start with "Your next move:"');
      score -= 15;
    }
  }

  // Check: Valid pillar
  const validPillars = ['ai_strategy', 'brand_performance', 'competitive_intel', 'media_trends'];
  if (!card.pillar) {
    issues.push('Pillar is missing');
    score -= 20;
  } else if (!validPillars.includes(card.pillar)) {
    issues.push(`Invalid pillar "${card.pillar}" - must be one of: ${validPillars.join(', ')}`);
    score -= 20;
  }

  // Check: Source information
  if (!card.source || card.source.trim().length === 0) {
    issues.push('Source name is required');
    score -= 20;
  }

  if (!card.sourceTier || typeof card.sourceTier !== 'number') {
    issues.push('Source tier is required and must be a number');
    score -= 15;
  } else if (card.sourceTier < 1 || card.sourceTier > 5) {
    issues.push(`Source tier must be 1-5 (found ${card.sourceTier})`);
    score -= 15;
  }

  // Check: Card type
  const validTypes = ['brief', 'hot_take', 'datapulse'];
  if (!card.type) {
    warnings.push('Card type missing - defaulting to "brief"');
    score -= 5;
  } else if (!validTypes.includes(card.type)) {
    warnings.push(`Invalid card type "${card.type}" - should be: ${validTypes.join(', ')}`);
    score -= 5;
  }

  // ============================================
  // EDITORIAL VOICE CHECKS (from EDITORIAL_VOICE.md)
  // ============================================

  // Check for prohibited hype language
  const hypeWords = [
    'revolutionary',
    'game-changing',
    'game changer',
    'paradigm shift',
    'disrupting',
    'disruptive',
    'transformative',
    'groundbreaking'
  ];

  const textToCheck = (card.title + ' ' + card.summary).toLowerCase();
  const foundHypeWords: string[] = [];

  hypeWords.forEach(word => {
    if (textToCheck.includes(word)) {
      foundHypeWords.push(word);
      score -= 10;
    }
  });

  if (foundHypeWords.length > 0) {
    issues.push(`Contains prohibited hype language: ${foundHypeWords.join(', ')}`);
  }

  // Check for emojis (not allowed per EDITORIAL_VOICE.md)
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  if (emojiRegex.test(card.title) || emojiRegex.test(card.summary)) {
    issues.push('Emojis are not allowed in title or summary (per editorial guidelines)');
    score -= 15;
  }

  // ============================================
  // QUALITY CHECKS (warnings, not rejections)
  // ============================================

  // Check for metrics in signals
  if (card.signals && Array.isArray(card.signals)) {
    const hasMetrics = card.signals.some((s: string) =>
      /\d+%|\$\d+[BMK]?|\d+x|\d+\.\d+x/i.test(s)
    );

    if (!hasMetrics) {
      warnings.push('Signals should include specific metrics (%, $, x multipliers)');
      score -= 5;
    }
  }

  // Check source tier vs priority consistency
  if (card.sourceTier > 2 && card.priority > 85) {
    warnings.push(
      `High priority card (${card.priority}) should ideally use Tier 1-2 source ` +
      `(currently Tier ${card.sourceTier}: ${card.source})`
    );
    score -= 5;
  }

  // Check for vague recommendations
  const vagueTerms = ['consider', 'maybe', 'perhaps', 'might want to', 'should think about'];
  if (card.moves && Array.isArray(card.moves)) {
    const movesText = card.moves.join(' ').toLowerCase();
    const foundVagueTerms: string[] = [];

    vagueTerms.forEach(term => {
      if (movesText.includes(term)) {
        foundVagueTerms.push(term);
      }
    });

    if (foundVagueTerms.length > 0) {
      warnings.push(
        `Moves should be direct and specific, not vague. Found: ${foundVagueTerms.join(', ')}`
      );
      score -= 3;
    }
  }

  // Check for generic AI content (should be marketing-specific)
  const genericAITerms = [
    'ai is changing everything',
    'the future of ai',
    'ai revolution',
    'in the age of ai'
  ];

  const foundGeneric = genericAITerms.filter(term => textToCheck.includes(term));
  if (foundGeneric.length > 0) {
    warnings.push(
      `Content feels generic. Focus on marketing/brand-specific AI applications. ` +
      `Found: ${foundGeneric.join(', ')}`
    );
    score -= 5;
  }

  // Check if summary has "what this means" framing
  const hasImplicationFraming = /what this means|for (\w+), the|the implication|this puts pressure on/i.test(card.summary);
  if (!hasImplicationFraming) {
    warnings.push('Summary should include "what this means" language for target audience');
    score -= 3;
  }

  // ============================================
  // FINAL VALIDATION
  // ============================================

  // Card is valid only if:
  // 1. No critical issues
  // 2. Score is at least 50 (allows some warnings but not too many problems)
  const isValid = issues.length === 0 && score >= 50;

  return {
    isValid,
    score: Math.max(0, Math.min(100, score)), // Clamp to 0-100
    issues,
    warnings
  };
}

/**
 * Helper function to generate a content hash for deduplication
 *
 * @param content - String content to hash (typically title + summary)
 * @returns MD5 hash as hex string
 */
export function generateContentHash(content: string): string {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(content.trim().toLowerCase()).digest('hex');
}
