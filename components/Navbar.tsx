
import React, { useState, useEffect } from 'react';
import { ChevronDown, User, LogOut, History } from 'lucide-react';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../utils/firebase';

type NavbarProps = {
  onSignupClick?: () => void;
};

export const Navbar: React.FC<NavbarProps> = ({ onSignupClick }) => {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900 backdrop-blur-xl border-b border-bureau-ink/5 dark:border-slate-700 app-padding-x">
      <div className="max-w-wide mx-auto h-[80px] flex items-center justify-between">
        <div className="flex items-center gap-lg">
          <div className="flex items-center gap-3">
            <a href="/" className="hover:opacity-80 transition-opacity">
              <Logo variant="terminal" className="h-[32px] md:h-[40px]" />
            </a>
            <span className="bg-planner-orange text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
              BETA
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-md border-l border-bureau-ink/10 dark:border-slate-600 pl-md">
            <span className="text-xs text-bureau-slate/60 dark:text-gray-200">
              {currentTime} UTC
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {/* Show user menu if logged in, otherwise show signup button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-bureau-signal dark:focus:ring-planner-orange focus:ring-offset-2"
                aria-label="User menu"
                aria-expanded={isUserMenuOpen}
              >
                {user.photoURL && !imageError ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-planner-orange/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-planner-orange" />
                  </div>
                )}
                <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-slate-300 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-1 z-20">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                      <p className="text-sm font-semibold text-bureau-ink dark:text-slate-100">
                        {user.displayName || 'User'}
                      </p>
                      <p className="text-xs text-bureau-slate/60 dark:text-gray-300 truncate">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        // TODO: Open history sidebar in Phase 3
                        // For now, just close the menu - functionality coming soon
                        setIsUserMenuOpen(false);
                        // Future: Open history sidebar
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 opacity-60 cursor-not-allowed"
                      disabled
                      title="Coming soon in Phase 3"
                    >
                      <History className="w-4 h-4" />
                      History
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={onSignupClick}
              disabled={loading}
              className="bg-planner-orange text-white px-6 py-3 text-sm font-semibold hover:bg-planner-orange/90 hover:shadow-md active:scale-[0.98] transition-all duration-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-planner-orange focus:ring-offset-2"
              aria-label="Create free account"
            >
              Create Free Account
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
