/**
 * React Error Boundary Component
 *
 * Catches runtime errors in child components and displays a fallback UI
 * instead of crashing the entire application to a white screen.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 */

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  /**
   * Update state so the next render will show the fallback UI
   */
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Log the error and send to analytics
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console for debugging
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);

    // Store error info in state for display
    this.setState({
      errorInfo,
    });

    // Track in Google Analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: `${error.name}: ${error.message}`,
        fatal: true,
      });
    }

    // In production, you could also send to error tracking service like Sentry
    // Sentry.captureException(error);
  }

  /**
   * Reset error state to allow recovery
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-50 dark:from-slate-900 dark:to-slate-800 p-4">
          <div className="max-w-md w-full">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-gray-100 text-center mb-3">
              Something went wrong
            </h1>

            <p className="text-base text-gray-600 dark:text-gray-300 text-center mb-6">
              We're sorry for the inconvenience. The application encountered an unexpected error.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg overflow-auto max-h-40">
                <p className="text-xs text-gray-700 dark:text-gray-300 font-mono mb-2">
                  <strong>Error:</strong> {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 font-mono whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full px-6 py-3 bg-bureau-signal dark:bg-planner-orange hover:bg-bureau-signal/90 dark:hover:bg-planner-orange/90 hover:shadow-md active:scale-[0.98] text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-bureau-signal dark:focus:ring-planner-orange focus:ring-offset-2"
              >
                <RotateCw className="w-4 h-4" />
                Try Again
              </button>

              <button
                onClick={() => (window.location.href = '/')}
                className="w-full px-6 py-3 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 hover:shadow-md active:scale-[0.98] text-gray-900 dark:text-gray-100 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-slate-500 focus:ring-offset-2"
              >
                Go Home
              </button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-gray-500 dark:text-gray-300 text-center mt-6">
              If this problem persists, please refresh the page or clear your browser cache.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
