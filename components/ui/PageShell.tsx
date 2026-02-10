import React, { useState } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { TopNav, NavItem } from './TopNav';
import { Button } from './Button';
import { cn } from './cn';

type LayoutVariant = 'A' | 'B';

type PageShellProps = {
  variant: LayoutVariant;
  productName: string;
  navItems: NavItem[];
  activeNav: string;
  onNavChange: (id: string) => void;
  topRight?: React.ReactNode;
  children: React.ReactNode;
};

export const PageShell: React.FC<PageShellProps> = ({
  variant,
  productName,
  navItems,
  activeNav,
  onNavChange,
  topRight,
  children,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const showSidebar = variant === 'A';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <TopNav
        productName={productName}
        navItems={navItems}
        activeNav={activeNav}
        onNavChange={onNavChange}
        rightContent={topRight}
        showPrimaryNav={variant === 'B'}
      />

      <div className="mx-auto flex w-full max-w-[1500px] gap-0">
        {showSidebar && (
          <aside
            className={cn(
              'sticky top-[61px] h-[calc(100vh-61px)] border-r border-slate-200 bg-white transition-[width] duration-150 dark:border-slate-800 dark:bg-slate-950',
              sidebarCollapsed ? 'w-[76px]' : 'w-[250px]'
            )}
          >
            <div className="flex items-center justify-end p-3">
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                onClick={() => setSidebarCollapsed((v) => !v)}
              >
                {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
              </Button>
            </div>
            <nav className="space-y-1 px-2" aria-label="Console sections">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavChange(item.id)}
                  className={cn(
                    'flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                    activeNav === item.id
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                  )}
                  aria-current={activeNav === item.id ? 'page' : undefined}
                  title={item.label}
                >
                  <span className="mr-2 inline-flex">{item.icon}</span>
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              ))}
            </nav>
          </aside>
        )}

        <main className={cn('min-w-0 flex-1 px-4 py-6 md:px-6 md:py-8', variant === 'A' ? 'max-w-[1240px]' : 'max-w-[1440px]')}>
          {children}
        </main>
      </div>
    </div>
  );
};
