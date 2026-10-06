import React from 'react';
import { cn } from '@/lib/utils';

export const Logo: React.FC<{ className?: string; size?: number; showWordmark?: boolean }> = ({
  className,
  size = 36,
  showWordmark = true,
}) => {
  return (
    <div className={cn('relative inline-flex items-center gap-2.5 select-none group', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 group-hover:scale-105"
      >
        <defs>
          <linearGradient id="ceoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E11D48" />
            <stop offset="50%" stopColor="#FB7185" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <filter id="ceoGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#E11D48" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Outer Hexagonal Web Node Ring */}
        <polygon
          points="50,6 88,28 88,72 50,94 12,72 12,28"
          stroke="url(#ceoGrad)"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-500 group-hover:rotate-45"
          style={{ transformOrigin: 'center' }}
        />

        {/* Network Loop Cross-Struts */}
        <line x1="50" y1="6" x2="50" y2="28" stroke="url(#ceoGrad)" strokeWidth="3" opacity="0.6" />
        <line x1="88" y1="72" x2="68" y2="60" stroke="url(#ceoGrad)" strokeWidth="3" opacity="0.6" />
        <line x1="12" y1="72" x2="32" y2="60" stroke="url(#ceoGrad)" strokeWidth="3" opacity="0.6" />

        {/* Stylized Modern Crown / Sovereign Monogram in Network Core */}
        <path
          d="M30 64 L30 42 L42 52 L50 36 L58 52 L70 42 L70 64 Z"
          fill="url(#ceoGrad)"
          filter="url(#ceoGlow)"
        />

        {/* Network Foundation Bar */}
        <rect x="28" y="66" width="44" height="4.5" rx="2" fill="#06B6D4" />

        {/* Sovereign Crown Jewels / Network Nodes */}
        <circle cx="30" cy="40" r="3" fill="#FFFFFF" />
        <circle cx="50" cy="34" r="3.5" fill="#FFFFFF" />
        <circle cx="70" cy="40" r="3" fill="#FFFFFF" />
      </svg>

      {showWordmark && (
        <div className="flex flex-col">
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-rose-500 to-cyan-500 bg-clip-text text-transparent">
            CEOWEB
          </span>
          <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Executive Network</p>
        </div>
      )}
    </div>
  );
};
