import React from 'react';
import { Badge } from './Badge';

type MetricProps = {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
};

export const Metric: React.FC<MetricProps> = ({ label, value, delta, deltaTone = 'neutral' }) => {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
      {delta && <Badge tone={deltaTone}>{delta}</Badge>}
    </div>
  );
};
