import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { signInWithGoogle, signUpWithEmail } from '../utils/firebase';

type SignupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      onClose();
      onSuccess?.();
    } catch (err: any) {
      console.error('Google signup error:', err);
      setError(err.message || 'Failed to sign up with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await signUpWithEmail(email, password);
      onClose();
      onSuccess?.();
    } catch (err: any) {
      console.error('Email signup error:', err);
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/60 dark:bg-slate-900/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full mx-4 p-8 border border-gray-100 dark:border-slate-800">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="space-y-6">
          {/* Headline */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Save This Intelligence Brief
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Create a free account to save your research and access it anytime.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-bureau-signal/10 dark:bg-planner-orange/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-bureau-signal dark:text-planner-orange text-xs font-bold">✓</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Save unlimited intelligence briefs
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-bureau-signal/10 dark:bg-planner-orange/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-bureau-signal dark:text-planner-orange text-xs font-bold">✓</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Export to PDF and share with team
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-bureau-signal/10 dark:bg-planner-orange/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-bureau-signal dark:text-planner-orange text-xs font-bold">✓</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Access search history across devices
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-bureau-signal/10 dark:bg-planner-orange/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-bureau-signal dark:text-planner-orange text-xs font-bold">✓</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Free during beta (launching March 2026)
              </p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Email Form (if shown) */}
          {showEmailForm ? (
            <form onSubmit={handleEmailSignup} className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bureau-signal dark:focus:ring-planner-orange"
                disabled={loading}
              />
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bureau-signal dark:focus:ring-planner-orange"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-planner-orange text-white py-3 px-6 rounded-lg font-semibold hover:bg-planner-orange/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="w-full text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                ← Back to options
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full bg-planner-orange text-white py-3 px-6 rounded-lg font-semibold hover:bg-planner-orange/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Continue with Google
              </button>
              <button
                onClick={() => setShowEmailForm(true)}
                disabled={loading}
                className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 py-3 px-6 rounded-lg font-semibold border-2 border-gray-200 dark:border-slate-700 hover:border-gray-900 dark:hover:border-slate-600 hover:shadow-md active:scale-[0.98] transition-all duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-slate-600 focus:ring-offset-2"
              >
                Continue with Email
              </button>
            </div>
          )}

          {/* Escape hatch */}
          <div className="text-center">
            <button
              onClick={onClose}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              I'll explore first
            </button>
          </div>

          {/* Social proof */}
          <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
            <p className="text-xs text-gray-500 dark:text-gray-300 text-center">
              Join 500+ CMOs in early access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
