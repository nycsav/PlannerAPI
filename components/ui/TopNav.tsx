import React from 'react';
import { Button } from './Button';
import { cn } from './cn';

export type NavItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
};

type TopNavProps = {
  productName: string;
  navItems: NavItem[];
  activeNav: string;
  onNavChange: (id: string) => void;
  rightContent?: React.ReactNode;
  showPrimaryNav?: boolean;
};

export const TopNav: React.FC<TopNavProps> = ({
  productName,
  navItems,
  activeNav,
  onNavChange,
  rightContent,
  showPrimaryNav = true,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <p className="truncate text-sm font-semibold tracking-wide text-slate-900 dark:text-slate-100">{productName}</p>
          {showPrimaryNav && (
            <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeNav === item.id ? 'primary' : 'ghost'}
                  className={cn('px-2.5 py-1.5 text-xs', activeNav === item.id ? '' : 'text-slate-600 dark:text-slate-300')}
                  onClick={() => onNavChange(item.id)}
                  aria-current={activeNav === item.id ? 'page' : undefined}
                >
                  {item.label}
                </Button>
              ))}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-2">{rightContent}</div>
      </div>
    </header>
  );
};
