import { logEvent } from 'firebase/analytics';
import { analytics } from '../../utils/firebase';

/** Card-like shape for GA4 card events (id, title, summary, pillar optional) */
export interface TrackableCard {
  id?: string;
  title: string;
  summary?: string;
  pillar?: string;
}

/**
 * Track when an intelligence card is viewed (e.g. modal opened).
 */
export function trackCardView(card: TrackableCard): void {
  if (!analytics) return;
  logEvent(analytics, 'view_intelligence_card', {
    card_id: card.id ?? undefined,
    card_title: card.title,
    card_pillar: card.pillar ?? undefined,
  });
}

/**
 * Track a generic interaction with an intelligence card (e.g. follow-up, share).
 */
export function trackCardInteraction(action: string, card: TrackableCard): void {
  if (!analytics) return;
  logEvent(analytics, 'intelligence_card_action', {
    action,
    card_id: card.id ?? undefined,
    card_title: card.title,
    card_pillar: card.pillar ?? undefined,
  });
}

/**
 * Track CTA button clicks (e.g. Get Daily Signals, See Example).
 */
export function trackCTAClick(ctaName: string, location: string): void {
  if (!analytics) return;
  logEvent(analytics, 'cta_click', {
    cta_name: ctaName,
    location,
  });
}

/**
 * Track when a filter is applied (e.g. pillar filter).
 */
export function trackFilterApplied(filterType: string, filterValue: string): void {
  if (!analytics) return;
  logEvent(analytics, 'filter_applied', {
    filter_type: filterType,
    filter_value: filterValue,
  });
}
