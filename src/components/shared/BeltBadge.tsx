import React from 'react';
import { getBeltRank, BeltRank } from '@/lib/gamification';
import { cn } from '@/lib/utils';
import { Shield } from 'lucide-react';

interface BeltBadgeProps {
  rank?: BeltRank;
  xp?: number;
  showTitle?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BeltBadge: React.FC<BeltBadgeProps> = ({
  rank,
  xp,
  showTitle = true,
  size = 'md',
  className,
}) => {
  const belt = xp !== undefined ? getBeltRank(xp) : (rank ? getBeltRank(rank === 'white' ? 0 : rank === 'yellow' ? 150 : rank === 'orange' ? 400 : rank === 'green' ? 800 : rank === 'blue' ? 1500 : rank === 'brown' ? 3000 : 6000) : getBeltRank(0));

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border transition-transform hover:scale-105 select-none shadow-sm',
        belt.bgBadge,
        belt.textBadge,
        belt.borderColor,
        sizeClasses[size],
        className
      )}
      title={`${belt.title} (${belt.minXp} - ${belt.maxXp === 999999 ? '∞' : belt.maxXp} XP)`}
    >
      <span
        className="w-2 h-2 rounded-full ring-1 ring-black/20"
        style={{ backgroundColor: belt.color }}
      />
      <Shield className={cn(size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
      {showTitle && <span>{belt.title}</span>}
    </span>
  );
};
