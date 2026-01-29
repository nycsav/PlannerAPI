
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
    <nav className="nav-base app-padding-x">
      <div className="max-w-wide mx-auto h-[80px] flex items-center justify-between">
        <div className="flex items-center gap-lg">
          <div className="flex items-center gap-3">
            <a href="/" className="hover:opacity-80 transition-opacity duration-200">
              <Logo variant="terminal" className="h-[32px] md:h-[40px]" />
            </a>
            <span className="bg-planner-orange text-white text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
              BETA
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-md border-l border-slate-200/60 dark:border-slate-700/50 pl-md">
            <span className="text-xs font-medium text-slate-500 dark:text-gray-400 font-mono">
              {currentTime} UTC
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {/* Show user menu if logged in, otherwise show signup button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="btn-icon flex items-center gap-2"
                aria-label="User menu"
                aria-expanded={isUserMenuOpen}
              >
                {user.photoURL && !imageError ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-planner-orange/10 flex items-center justify-center ring-2 ring-slate-200 dark:ring-slate-700">
                    <User className="w-4 h-4 text-planner-orange" />
                  </div>
                )}
                <ChevronDown className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200/60 dark:border-slate-700/50 py-2 z-20 backdrop-blur-xl">
                    <div className="px-4 py-3 border-b border-slate-200/60 dark:border-slate-700/50">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {user.displayName || 'User'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-gray-400 truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 opacity-60 cursor-not-allowed"
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
              className="btn-primary"
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
