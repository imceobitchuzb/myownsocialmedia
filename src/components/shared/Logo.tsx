import React from 'react';
import { cn } from '@/lib/utils';

export const Logo: React.FC<{ className?: string; size?: number }> = ({ className, size = 32 }) => {
  return (
    <div className={cn('relative inline-flex items-center justify-center select-none', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 hover:rotate-180"
      >
        <defs>
          <linearGradient id="ninjaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E11D48" />
            <stop offset="50%" stopColor="#FB7185" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#E11D48" floodOpacity="0.4" />
          </filter>
        </defs>
        
        {/* Shuriken / Möbius Loop Blades */}
        <circle cx="50" cy="50" r="44" stroke="url(#ninjaGrad)" strokeWidth="6" strokeDasharray="60 20" strokeLinecap="round" />
        <path
          d="M50 15 L58 42 L85 50 L58 58 L50 85 L42 58 L15 50 L42 42 Z"
          fill="url(#ninjaGrad)"
          filter="url(#glow)"
        />
        <circle cx="50" cy="50" r="8" fill="#0B0F17" stroke="#FFFFFF" strokeWidth="2.5" />
      </svg>
    </div>
  );
};
