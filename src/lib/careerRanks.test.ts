import { describe, it, expect } from 'vitest';
import { getRankTitle, CAREER_RANKS_CONFIG } from './careerRanks';

describe('Career Ladder Ranks (CEOWEB skin)', () => {
  it('maps entry level to Intern', () => {
    expect(getRankTitle(0, 'career')).toBe('Intern');
  });

  it('maps mid level to Director', () => {
    expect(getRankTitle(650, 'career')).toBe('Director');
  });

  it('maps top progression to Chief Executive Officer (CEO)', () => {
    expect(getRankTitle(5200, 'career')).toBe('Chief Executive Officer (CEO)');
  });

  it('preserves belt titles when belt skin is chosen', () => {
    expect(getRankTitle(5200, 'belt')).toBe('Black Belt Master');
  });
});
