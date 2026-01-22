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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bureau-bg to-slate-50 p-4">
          <div className="max-w-md w-full">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-50 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl md:text-3xl font-black text-bureau-ink text-center mb-3">
              Something went wrong
            </h1>

            <p className="text-base text-bureau-slate/70 text-center mb-6">
              We're sorry for the inconvenience. The application encountered an unexpected error.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-slate-100 border border-slate-200 rounded-lg overflow-auto max-h-40">
                <p className="text-xs text-slate-700 font-mono mb-2">
                  <strong>Error:</strong> {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <p className="text-xs text-slate-600 font-mono whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full px-6 py-3 bg-bureau-signal hover:bg-bureau-signal/90 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RotateCw className="w-4 h-4" />
                Try Again
              </button>

              <button
                onClick={() => (window.location.href = '/')}
                className="w-full px-6 py-3 bg-slate-200 hover:bg-slate-300 text-bureau-ink font-semibold rounded-lg transition-colors"
              >
                Go Home
              </button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-bureau-slate/50 text-center mt-6">
              If this problem persists, please refresh the page or clear your browser cache.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
