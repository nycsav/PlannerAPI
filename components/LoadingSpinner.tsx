import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div className="relative">
        {/* Outer ring with smooth rotation */}
        <Loader2 
          className={`${sizeClasses[size]} animate-spin-smooth text-bureau-signal dark:text-planner-orange`}
          style={{
            filter: 'drop-shadow(0 0 4px currentColor)'
          }}
        />
        {/* Inner glow effect */}
        <div 
          className={`absolute inset-0 ${sizeClasses[size]} rounded-full animate-pulse-glow`}
          style={{
            background: 'radial-gradient(circle, currentColor 0%, transparent 70%)',
            opacity: 0.3,
            filter: 'blur(4px)'
          }}
        />
      </div>
      {text && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 animate-pulse-glow">
          {text}
        </span>
      )}
    </div>
  );
};
