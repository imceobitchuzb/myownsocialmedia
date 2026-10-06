export type BeltRank =
  | 'white'
  | 'yellow'
  | 'orange'
  | 'green'
  | 'blue'
  | 'brown'
  | 'black';

export interface BeltDefinition {
  rank: BeltRank;
  title: string;
  minXp: number;
  maxXp: number;
  color: string;
  bgBadge: string;
  textBadge: string;
  borderColor: string;
}

export const BELT_RANKS: Record<BeltRank, BeltDefinition> = {
  white: {
    rank: 'white',
    title: 'White Belt',
    minXp: 0,
    maxXp: 100,
    color: '#E2E8F0',
    bgBadge: 'bg-slate-200 dark:bg-slate-800',
    textBadge: 'text-slate-800 dark:text-slate-200',
    borderColor: 'border-slate-300 dark:border-slate-700',
  },
  yellow: {
    rank: 'yellow',
    title: 'Yellow Belt',
    minXp: 100,
    maxXp: 300,
    color: '#FACC15',
    bgBadge: 'bg-amber-100 dark:bg-amber-950/60',
    textBadge: 'text-amber-800 dark:text-amber-300',
    borderColor: 'border-amber-400 dark:border-amber-600',
  },
  orange: {
    rank: 'orange',
    title: 'Orange Belt',
    minXp: 300,
    maxXp: 600,
    color: '#FB923C',
    bgBadge: 'bg-orange-100 dark:bg-orange-950/60',
    textBadge: 'text-orange-800 dark:text-orange-300',
    borderColor: 'border-orange-400 dark:border-orange-600',
  },
  green: {
    rank: 'green',
    title: 'Green Belt',
    minXp: 600,
    maxXp: 1200,
    color: '#22C55E',
    bgBadge: 'bg-emerald-100 dark:bg-emerald-950/60',
    textBadge: 'text-emerald-800 dark:text-emerald-300',
    borderColor: 'border-emerald-400 dark:border-emerald-600',
  },
  blue: {
    rank: 'blue',
    title: 'Blue Belt',
    minXp: 1200,
    maxXp: 2500,
    color: '#3B82F6',
    bgBadge: 'bg-blue-100 dark:bg-blue-950/60',
    textBadge: 'text-blue-800 dark:text-blue-300',
    borderColor: 'border-blue-400 dark:border-blue-600',
  },
  brown: {
    rank: 'brown',
    title: 'Brown Belt',
    minXp: 2500,
    maxXp: 5000,
    color: '#A16207',
    bgBadge: 'bg-yellow-950/20 dark:bg-amber-950/70',
    textBadge: 'text-amber-900 dark:text-amber-200',
    borderColor: 'border-amber-700 dark:border-amber-800',
  },
  black: {
    rank: 'black',
    title: 'Black Belt Master',
    minXp: 5000,
    maxXp: 999999,
    color: '#18181B',
    bgBadge: 'bg-neutral-900 text-amber-400 dark:bg-neutral-950 dark:text-amber-300',
    textBadge: 'text-amber-400 font-bold',
    borderColor: 'border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]',
  },
};

export const XP_REWARDS = {
  CREATE_POST: 25,
  COMMENT: 10,
  LIKE_RECEIVED: 5,
  STORY_CHAIN_CONTRIBUTION: 40,
  STORY_CHAIN_WIN: 150,
  CHALLENGE_SUBMISSION: 50,
  CHALLENGE_WIN: 200,
  DAILY_STREAK: 20,
} as const;

export function getBeltRank(xp: number): BeltDefinition {
  if (xp >= 5000) return BELT_RANKS.black;
  if (xp >= 2500) return BELT_RANKS.brown;
  if (xp >= 1200) return BELT_RANKS.blue;
  if (xp >= 600) return BELT_RANKS.green;
  if (xp >= 300) return BELT_RANKS.orange;
  if (xp >= 100) return BELT_RANKS.yellow;
  return BELT_RANKS.white;
}

export function getNextRankProgress(xp: number): {
  currentRank: BeltDefinition;
  nextRank: BeltDefinition | null;
  progressPercent: number;
  xpNeeded: number;
} {
  const currentRank = getBeltRank(xp);
  const ranksOrder: BeltRank[] = ['white', 'yellow', 'orange', 'green', 'blue', 'brown', 'black'];
  const currentIndex = ranksOrder.indexOf(currentRank.rank);
  
  if (currentIndex === ranksOrder.length - 1) {
    return {
      currentRank,
      nextRank: null,
      progressPercent: 100,
      xpNeeded: 0,
    };
  }

  const nextRank = BELT_RANKS[ranksOrder[currentIndex + 1]];
  const xpInRange = xp - currentRank.minXp;
  const totalRange = nextRank.minXp - currentRank.minXp;
  const progressPercent = Math.min(100, Math.max(0, Math.floor((xpInRange / totalRange) * 100)));
  const xpNeeded = Math.max(0, nextRank.minXp - xp);

  return {
    currentRank,
    nextRank,
    progressPercent,
    xpNeeded,
  };
}

export function calculateStreak(
  lastSnapDateStr: string | null,
  currentStreak: number,
  now = new Date()
): { newStreak: number; status: 'continued' | 'incremented' | 'broken' | 'first' } {
  if (!lastSnapDateStr) {
    return { newStreak: 1, status: 'first' };
  }

  const lastSnap = new Date(lastSnapDateStr);
  const diffMs = now.getTime() - lastSnap.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // If sent within the same calendar day / under 24h, streak maintained but not double incremented in same hour
  if (diffHours < 24) {
    const isSameDay = lastSnap.toISOString().slice(0, 10) === now.toISOString().slice(0, 10);
    if (isSameDay) {
      return { newStreak: currentStreak, status: 'continued' };
    }
    return { newStreak: currentStreak + 1, status: 'incremented' };
  } else if (diffHours < 48) {
    // Within 24-48h grace window to keep streak alive and increment
    return { newStreak: currentStreak + 1, status: 'incremented' };
  } else {
    // Streak expired (>48 hours)
    return { newStreak: 1, status: 'broken' };
  }
}
