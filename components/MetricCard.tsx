import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Percent, Users, Target } from 'lucide-react';

type MetricCardProps = {
  value: string | number;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: 'dollar' | 'percent' | 'users' | 'target';
  context?: string;
};

export const MetricCard: React.FC<MetricCardProps> = ({
  value,
  label,
  trend = 'neutral',
  icon = 'target',
  context
}) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Target;
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-bureau-slate';

  const iconMap = {
    dollar: DollarSign,
    percent: Percent,
    users: Users,
    target: Target
  };

  const IconComponent = iconMap[icon];

  return (
    <div className="border-2 border-bureau-border rounded-sm bg-white p-4 hover:border-bureau-signal transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <IconComponent className="w-4 h-4 text-bureau-signal" />
            <p className="text-xs text-bureau-slate/60 uppercase tracking-wide font-medium">{label}</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-planner-navy">
              {value}
            </span>
          </div>
          {context && (
            <p className="text-xs text-bureau-slate mt-1">{context}</p>
          )}
        </div>
        <TrendIcon className={`w-5 h-5 ${trendColor} flex-shrink-0`} />
      </div>
    </div>
  );
};
