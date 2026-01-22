import React from 'react';
import { Sparkles } from 'lucide-react';

type NewContentBadgeProps = {
  count: number;
  onClick?: () => void;
};

export const NewContentBadge: React.FC<NewContentBadgeProps> = ({ count, onClick }) => {
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-planner-orange text-white text-xs font-bold rounded-full hover:bg-planner-orange/90 transition-all animate-pulse hover:animate-none"
      aria-label={`${count} new intelligence briefings`}
    >
      <Sparkles className="w-3.5 h-3.5" />
      <span>{count} NEW</span>
    </button>
  );
};
