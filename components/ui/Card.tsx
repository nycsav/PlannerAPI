import React from 'react';
import { cn } from './cn';

type BaseProps = {
  children: React.ReactNode;
  className?: string;
};

export const Card: React.FC<BaseProps> = ({ children, className }) => (
  <article className={cn('rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900', className)}>
    {children}
  </article>
);

export const CardHeader: React.FC<BaseProps> = ({ children, className }) => (
  <header className={cn('border-b border-slate-200 px-4 py-3 dark:border-slate-800', className)}>{children}</header>
);

export const CardBody: React.FC<BaseProps> = ({ children, className }) => (
  <div className={cn('px-4 py-4', className)}>{children}</div>
);
