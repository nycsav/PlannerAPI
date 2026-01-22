/**
 * User state management for onboarding and engagement tracking
 * Uses localStorage for persistence
 */

const STORAGE_KEYS = {
  HAS_VISITED: 'plannerapi_has_visited',
  ONBOARDING_COMPLETED: 'plannerapi_onboarding_completed',
  TOUR_COMPLETED: 'plannerapi_tour_completed',
  LAST_VISIT: 'plannerapi_last_visit',
  LAST_DAILY_INTEL_CHECK: 'plannerapi_last_daily_intel_check',
  TOOLTIP_DISMISSED: 'plannerapi_tooltip_dismissed',
} as const;

/**
 * Check if this is user's first visit
 */
export const isFirstVisit = (): boolean => {
  return !localStorage.getItem(STORAGE_KEYS.HAS_VISITED);
};

/**
 * Mark user as having visited
 */
export const markAsVisited = (): void => {
  localStorage.setItem(STORAGE_KEYS.HAS_VISITED, 'true');
  localStorage.setItem(STORAGE_KEYS.LAST_VISIT, new Date().toISOString());
};

/**
 * Check if user has completed onboarding
 */
export const hasCompletedOnboarding = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === 'true';
};

/**
 * Mark onboarding as completed
 */
export const markOnboardingCompleted = (): void => {
  localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
};

/**
 * Check if user has completed tour
 */
export const hasCompletedTour = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.TOUR_COMPLETED) === 'true';
};

/**
 * Mark tour as completed
 */
export const markTourCompleted = (): void => {
  localStorage.setItem(STORAGE_KEYS.TOUR_COMPLETED, 'true');
};

/**
 * Get last visit timestamp
 */
export const getLastVisit = (): Date | null => {
  const lastVisit = localStorage.getItem(STORAGE_KEYS.LAST_VISIT);
  return lastVisit ? new Date(lastVisit) : null;
};

/**
 * Update last visit timestamp
 */
export const updateLastVisit = (): void => {
  localStorage.setItem(STORAGE_KEYS.LAST_VISIT, new Date().toISOString());
};

/**
 * Get last Daily Intelligence check timestamp
 */
export const getLastDailyIntelCheck = (): Date | null => {
  const lastCheck = localStorage.getItem(STORAGE_KEYS.LAST_DAILY_INTEL_CHECK);
  return lastCheck ? new Date(lastCheck) : null;
};

/**
 * Update last Daily Intelligence check timestamp
 */
export const updateLastDailyIntelCheck = (): void => {
  localStorage.setItem(STORAGE_KEYS.LAST_DAILY_INTEL_CHECK, new Date().toISOString());
};

/**
 * Check if Daily Intelligence has new content since last check
 * Returns number of hours since last check (used to determine "NEW" badge)
 */
export const getHoursSinceLastDailyIntelCheck = (): number => {
  const lastCheck = getLastDailyIntelCheck();
  if (!lastCheck) return 999; // First time, show as new

  const now = new Date();
  const diffMs = now.getTime() - lastCheck.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  return diffHours;
};

/**
 * Check if welcome tooltip has been dismissed
 */
export const hasWelcomeTooltipBeenDismissed = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.TOOLTIP_DISMISSED) === 'true';
};

/**
 * Mark welcome tooltip as dismissed
 */
export const markWelcomeTooltipDismissed = (): void => {
  localStorage.setItem(STORAGE_KEYS.TOOLTIP_DISMISSED, 'true');
};

/**
 * Check if user should see "NEW" badge on Daily Intelligence
 * Shows badge if:
 * 1. Content refreshes daily at 6am ET
 * 2. User last checked before today's 6am ET refresh
 */
export const shouldShowNewContentBadge = (): boolean => {
  const hoursSinceCheck = getHoursSinceLastDailyIntelCheck();

  // Show badge if user hasn't checked in 12+ hours
  // (content refreshes at 6am ET daily, so 12 hours ensures they see it)
  return hoursSinceCheck >= 12;
};

/**
 * Calculate number of "new" cards to show in badge
 * Daily Intelligence generates 10 cards/day
 */
export const getNewContentCount = (): number => {
  const hoursSinceCheck = getHoursSinceLastDailyIntelCheck();

  if (hoursSinceCheck < 12) return 0;
  if (hoursSinceCheck < 36) return 6; // Today's batch
  if (hoursSinceCheck < 60) return 12; // 2 days
  return 18; // 3+ days (capped at 18 for UI)
};

/**
 * Reset all user state (for testing or user request)
 */
export const resetUserState = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};
