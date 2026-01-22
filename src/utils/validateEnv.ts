/**
 * Environment Variable Validation
 *
 * Validates that all required environment variables are set at startup.
 * This prevents runtime errors from missing configuration.
 *
 * Required variables for frontend:
 * - VITE_FIREBASE_API_KEY
 * - VITE_FIREBASE_PROJECT_ID
 * - VITE_FIREBASE_SENDER_ID
 * - VITE_FIREBASE_APP_ID
 */

const REQUIRED_ENV_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

/**
 * Validate that all required environment variables are set
 *
 * @throws {Error} If any required variables are missing
 */
export function validateEnv(): void {
  const missing: string[] = [];

  REQUIRED_ENV_VARS.forEach((key) => {
    const value = import.meta.env[key];
    if (!value || value.trim() === '') {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    const errorMessage = `Missing required environment variables:\n${missing
      .map((key) => `  - ${key}`)
      .join('\n')}\n\nPlease copy .env.example to .env and fill in the required values.`;

    console.error('[Environment Validation] Error:', errorMessage);
    throw new Error(errorMessage);
  }

  console.log('[Environment Validation] ✓ All required environment variables are set');
}

/**
 * Check if environment is development
 */
export function isDevelopment(): boolean {
  return import.meta.env.MODE === 'development';
}

/**
 * Check if environment is production
 */
export function isProduction(): boolean {
  return import.meta.env.MODE === 'production';
}
