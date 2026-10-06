import React from 'react';
import { getNextRankProgress } from '@/lib/gamification';
import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';

interface XPProgressBarProps {
  xp: number;
  className?: string;
  showDetails?: boolean;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({
  xp,
  className,
  showDetails = true,
}) => {
  const { currentRank, nextRank, progressPercent, xpNeeded } = getNextRankProgress(xp);

  return (
    <div className={cn('w-full flex flex-col gap-1.5', className)}>
      {showDetails && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{xp.toLocaleString()} XP</span>
          </div>
          <span className="text-muted-foreground">
            {nextRank ? `${xpNeeded} XP to ${nextRank.title}` : 'Grandmaster Peak'}
          </span>
        </div>
      )}
      <div className="w-full h-2.5 bg-secondary/80 rounded-full overflow-hidden p-0.5 border border-border/40">
        <div
          className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-cyan-400 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
