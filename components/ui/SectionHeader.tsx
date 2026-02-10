import React from 'react';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 dark:border-slate-800 md:flex-row md:items-start md:justify-between">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 md:text-2xl">{title}</h2>
        {subtitle ? <p className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
};
