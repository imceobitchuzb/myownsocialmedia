import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className,
  size = 32,
  showWordmark = true,
}) => {
  return (
    <div className={cn('relative inline-flex items-center gap-2.5 select-none group', className)}>
      {/* Original SocialMediaUZ Emblem: Interlocked orbital social crest */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 group-hover:scale-105 flex-shrink-0"
      >
        <defs>
          <linearGradient id="smuzPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="smuzAccent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
          <filter id="smuzGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#3B82F6" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Outer Orbital Ring */}
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke="currentColor"
          strokeWidth="2"
          className="text-foreground/15 group-hover:text-primary/40 transition-colors"
          strokeDasharray="4 3"
        />

        {/* Fluid Modern Geometric Monogram: 'S' & 'U' Fusion */}
        <path
          d="M68 28 C56 22 36 24 28 36 C20 48 30 58 48 60 C66 62 76 72 68 84 C60 92 40 92 28 82"
          stroke="url(#smuzPrimary)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#smuzGlow)"
        />

        {/* Connecting U Loop Link */}
        <path
          d="M36 32 C36 46 64 46 64 62"
          stroke="url(#smuzAccent)"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Central Core Satellite Node */}
        <circle cx="50" cy="50" r="4.5" fill="#FFFFFF" className="dark:fill-white" />
        <circle cx="50" cy="50" r="8" stroke="url(#smuzPrimary)" strokeWidth="1.5" opacity="0.6" />
      </svg>

      {showWordmark && (
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-bold text-base tracking-tight text-foreground">
            SocialMedia
          </span>
          <span className="font-extrabold text-[11px] tracking-wider uppercase px-1.5 py-0.5 rounded-md bg-primary text-primary-foreground">
            UZ
          </span>
        </div>
      )}
    </div>
  );
};
