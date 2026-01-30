// Custom geometric icons for terminal aesthetic
// Angular, radar-style SVGs to replace Lucide React

import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// Signal icon - replacing Zap/Activity
export const SignalIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M8 2L8 14M4 6L8 2L12 6M4 10L8 14L12 10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
  </svg>
);

// Radar icon - for scanning/analysis
export const RadarIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    <circle cx="8" cy="8" r="1" fill="currentColor" />
    <path d="M8 2L8 8L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
  </svg>
);

// Terminal icon - command-line style
export const TerminalSharpIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="1" y="2" width="14" height="12" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 5L6 8L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" />
    <path d="M8 11L12 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
  </svg>
);

// Target/Objective icon - crosshair with grid
export const ObjectiveIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="8" cy="8" r="1" fill="currentColor" />
    <path d="M8 1L8 4M8 12L8 15M1 8L4 8M12 8L15 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
  </svg>
);

// Database/Storage icon - geometric stacks
export const DataIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="2" y="2" width="12" height="3" stroke="currentColor" strokeWidth="1.5" />
    <rect x="2" y="6.5" width="12" height="3" stroke="currentColor" strokeWidth="1.5" />
    <rect x="2" y="11" width="12" height="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M4 3.5L4 13M7 3.5L7 13M10 3.5L10 13" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
  </svg>
);

// Briefing/Document icon - classification header
export const BriefingIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="3" y="2" width="10" height="12" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 5L13 5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5 7.5L11 7.5M5 9.5L11 9.5M5 11.5L9 11.5" stroke="currentColor" strokeWidth="1" opacity="0.7" />
    <rect x="6" y="2.5" width="4" height="1" fill="currentColor" />
  </svg>
);

// Arrow/Action icon - sharp geometric arrow
export const ActionArrowIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M2 8L14 8M14 8L10 4M14 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" />
  </svg>
);

// Grid/Network icon - connection nodes
export const NetworkIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="3" cy="3" r="1.5" fill="currentColor" />
    <circle cx="13" cy="3" r="1.5" fill="currentColor" />
    <circle cx="3" cy="13" r="1.5" fill="currentColor" />
    <circle cx="13" cy="13" r="1.5" fill="currentColor" />
    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M4 4L6.5 6.5M10 6.5L12 4M4 12L6.5 9.5M10 9.5L12 12" stroke="currentColor" strokeWidth="1" />
  </svg>
);

// Analytics/Metrics icon - bar chart geometric
export const MetricsIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="2" y="10" width="2.5" height="4" stroke="currentColor" strokeWidth="1.5" />
    <rect x="6" y="6" width="2.5" height="8" stroke="currentColor" strokeWidth="1.5" />
    <rect x="10" y="3" width="2.5" height="11" stroke="currentColor" strokeWidth="1.5" />
    <path d="M1 14L15 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
  </svg>
);

// Status indicator - square with corner brackets
export const StatusIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M2 5L2 2L5 2M11 2L14 2L14 5M14 11L14 14L11 14M5 14L2 14L2 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    <circle cx="8" cy="8" r="2.5" fill="currentColor" />
  </svg>
);
