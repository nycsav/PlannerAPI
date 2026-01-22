/**
 * Analytics Hook for PlannerAPI
 *
 * Tracks user engagement with Daily Intelligence cards, search queries,
 * and other interactions. Stores events in Firestore and sends to GA4.
 *
 * Usage:
 *   const { trackCardClick, trackSearch } = useAnalytics();
 *   trackCardClick(card.id, card.pillar, card.type);
 */

import { useCallback, useRef, useEffect } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../utils/firebase';

// Session ID management
const getSessionId = (): string => {
  if (typeof window === 'undefined') return 'server';

  let sessionId = sessionStorage.getItem('papi_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('papi_session_id', sessionId);
  }
  return sessionId;
};

// Get user ID if logged in (from localStorage or auth)
const getUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('papi_user_id') || null;
};

// UTM parameter extraction
const getUtmParams = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const utmParams: Record<string, string> = {};

  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(key => {
    const value = params.get(key);
    if (value) utmParams[key] = value;
  });

  return utmParams;
};

// Declare gtag type for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

interface AnalyticsEvent {
  eventName: string;
  sessionId: string;
  userId: string | null;
  timestamp: any; // Firestore Timestamp
  properties: Record<string, any>;
  context: {
    userAgent: string;
    viewport: { width: number; height: number };
    referrer: string;
    url: string;
    utmParams: Record<string, string>;
  };
}

export const useAnalytics = () => {
  const sessionId = useRef<string>(getSessionId());
  const utmParams = useRef<Record<string, string>>(getUtmParams());

  // Track session start on mount
  useEffect(() => {
    const isReturning = localStorage.getItem('papi_visited') === 'true';

    track('session_start', {
      isReturning,
      referrer: document.referrer,
      landingPage: window.location.pathname,
    });

    localStorage.setItem('papi_visited', 'true');
  }, []);

  /**
   * Core tracking function
   * Sends event to Firestore and GA4
   */
  const track = useCallback(async (
    eventName: string,
    properties: Record<string, any> = {}
  ): Promise<void> => {
    try {
      const event: AnalyticsEvent = {
        eventName,
        sessionId: sessionId.current,
        userId: getUserId(),
        timestamp: Timestamp.now(),
        properties,
        context: {
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
          referrer: document.referrer,
          url: window.location.href,
          utmParams: utmParams.current,
        },
      };

      // Send to Firestore (non-blocking)
      addDoc(collection(db, 'analytics_events'), event).catch(err => {
        console.warn('[Analytics] Firestore write failed:', err);
      });

      // Send to GA4 if available
      if (window.gtag) {
        window.gtag('event', eventName, {
          ...properties,
          session_id: sessionId.current,
        });
      }

      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics]', eventName, properties);
      }
    } catch (error) {
      console.warn('[Analytics] Track error:', error);
    }
  }, []);

  // ============================================
  // Card Engagement Events
  // ============================================

  /**
   * Track when a card becomes visible in the viewport
   */
  const trackCardImpression = useCallback((
    cardId: string,
    pillar: string,
    position: number,
    source: 'featured' | 'slider' | 'filter'
  ) => {
    track('card_impression', {
      cardId,
      pillar,
      position,
      source,
    });
  }, [track]);

  /**
   * Track when a user clicks to open a card modal
   */
  const trackCardClick = useCallback((
    cardId: string,
    pillar: string,
    cardType: string,
    title: string
  ) => {
    track('card_click', {
      cardId,
      pillar,
      cardType,
      title: title.substring(0, 100), // Truncate for storage
    });
  }, [track]);

  /**
   * Track time spent reading a card (called on modal close)
   */
  const trackCardRead = useCallback((
    cardId: string,
    readTimeMs: number,
    scrollDepth: number // 0-100
  ) => {
    track('card_read', {
      cardId,
      readTimeMs,
      scrollDepth,
      readTimeSec: Math.round(readTimeMs / 1000),
    });
  }, [track]);

  /**
   * Track when a user clicks a signal bullet point
   */
  const trackSignalClick = useCallback((
    cardId: string,
    signalIndex: number,
    signalText: string
  ) => {
    track('card_signal_click', {
      cardId,
      signalIndex,
      signalText: signalText.substring(0, 100),
    });
  }, [track]);

  /**
   * Track when a user clicks an action/move item
   */
  const trackMoveClick = useCallback((
    cardId: string,
    moveIndex: number,
    moveText: string
  ) => {
    track('card_move_click', {
      cardId,
      moveIndex,
      moveText: moveText.substring(0, 100),
    });
  }, [track]);

  /**
   * Track when a user asks a follow-up question from a card
   */
  const trackFollowUp = useCallback((
    cardId: string,
    followUpType: string,
    query: string
  ) => {
    track('card_follow_up', {
      cardId,
      followUpType,
      query: query.substring(0, 200),
    });
  }, [track]);

  // ============================================
  // Search & Chat Events
  // ============================================

  /**
   * Track search queries from hero or chat
   */
  const trackSearch = useCallback((
    query: string,
    source: 'hero' | 'chat' | 'category'
  ) => {
    track('search_query', {
      query: query.substring(0, 200),
      queryLength: query.length,
      source,
    });
  }, [track]);

  /**
   * Track category/pillar filter clicks
   */
  const trackCategoryClick = useCallback((
    category: string,
    source: 'hero' | 'filter'
  ) => {
    track('category_click', {
      category,
      source,
    });
  }, [track]);

  /**
   * Track pillar filter changes
   */
  const trackPillarFilter = useCallback((
    pillar: string | null,
    previousPillar: string | null
  ) => {
    track('pillar_filter_change', {
      pillar: pillar || 'all',
      previousPillar: previousPillar || 'all',
    });
  }, [track]);

  // ============================================
  // User Events
  // ============================================

  /**
   * Track signup modal open
   */
  const trackSignupOpen = useCallback((source: string) => {
    track('signup_modal_open', { source });
  }, [track]);

  /**
   * Track successful signup
   */
  const trackSignupComplete = useCallback((method: 'google' | 'email') => {
    track('signup_complete', { method });
  }, [track]);

  /**
   * Track scroll depth on main page
   */
  const trackScrollDepth = useCallback((
    depth: 25 | 50 | 75 | 100,
    section: string
  ) => {
    track('scroll_depth', { depth, section });
  }, [track]);

  return {
    // Core
    track,

    // Card engagement
    trackCardImpression,
    trackCardClick,
    trackCardRead,
    trackSignalClick,
    trackMoveClick,
    trackFollowUp,

    // Search & navigation
    trackSearch,
    trackCategoryClick,
    trackPillarFilter,

    // User events
    trackSignupOpen,
    trackSignupComplete,
    trackScrollDepth,
  };
};

// Export a singleton for use outside of React components
export const analytics = {
  track: async (eventName: string, properties: Record<string, any> = {}) => {
    try {
      const event = {
        eventName,
        sessionId: getSessionId(),
        userId: getUserId(),
        timestamp: Timestamp.now(),
        properties,
        context: {
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
          viewport: typeof window !== 'undefined'
            ? { width: window.innerWidth, height: window.innerHeight }
            : { width: 0, height: 0 },
          referrer: typeof document !== 'undefined' ? document.referrer : '',
          url: typeof window !== 'undefined' ? window.location.href : '',
          utmParams: getUtmParams(),
        },
      };

      await addDoc(collection(db, 'analytics_events'), event);

      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, properties);
      }
    } catch (error) {
      console.warn('[Analytics] Track error:', error);
    }
  },
};
