import { describe, it, expect } from 'vitest';
import { getBeltRank, getNextRankProgress, calculateStreak } from './gamification';

describe('Gamification: Belt Ranks', () => {
  it('assigns White Belt for starting XP', () => {
    expect(getBeltRank(0).rank).toBe('white');
    expect(getBeltRank(80).rank).toBe('white');
  });

  it('assigns Yellow Belt at 100 XP', () => {
    expect(getBeltRank(100).rank).toBe('yellow');
    expect(getBeltRank(250).rank).toBe('yellow');
  });

  it('assigns Green Belt at 600 XP', () => {
    expect(getBeltRank(600).rank).toBe('green');
  });

  it('assigns Black Belt at 5000+ XP', () => {
    expect(getBeltRank(5000).rank).toBe('black');
    expect(getBeltRank(9999).rank).toBe('black');
  });

  it('calculates next rank progression correctly', () => {
    const progress = getNextRankProgress(50); // White belt (0 to 100)
    expect(progress.currentRank.rank).toBe('white');
    expect(progress.nextRank?.rank).toBe('yellow');
    expect(progress.progressPercent).toBe(50);
    expect(progress.xpNeeded).toBe(50);
  });
});

describe('Gamification: Streaks', () => {
  it('starts fresh streak on first snap', () => {
    const result = calculateStreak(null, 0);
    expect(result.newStreak).toBe(1);
    expect(result.status).toBe('first');
  });

  it('increments streak if snapped on next day within 48h', () => {
    const yesterday = new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString();
    const result = calculateStreak(yesterday, 5);
    expect(result.newStreak).toBe(6);
    expect(result.status).toBe('incremented');
  });

  it('resets streak to 1 if more than 48 hours elapsed', () => {
    const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
    const result = calculateStreak(threeDaysAgo, 15);
    expect(result.newStreak).toBe(1);
    expect(result.status).toBe('broken');
  });
});
