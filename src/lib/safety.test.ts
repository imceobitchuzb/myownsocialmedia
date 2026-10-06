import { describe, it, expect } from 'vitest';
import { containsProfanity, filterProfanity, checkRateLimit } from './safety';

describe('Safety: Profanity Filter', () => {
  it('detects banned spam and attack keywords', () => {
    expect(containsProfanity('Join this crypto scam now')).toBe(true);
    expect(containsProfanity('Normal engineering discussion on algorithms')).toBe(false);
  });

  it('censors banned words in public text', () => {
    const sanitized = filterProfanity('Do not fall for this phishing attempt');
    expect(sanitized).toBe('Do not fall for this *** attempt');
  });
});

describe('Safety: Rate Limiting', () => {
  it('allows actions within limits', () => {
    const res = checkRateLimit('user-1', 'post', 3, 1000);
    expect(res.allowed).toBe(true);
  });

  it('blocks actions exceeding limits and computes retry time', () => {
    const testUser = 'rate-limited-user';
    checkRateLimit(testUser, 'message', 2, 10000);
    checkRateLimit(testUser, 'message', 2, 10000);
    const blocked = checkRateLimit(testUser, 'message', 2, 10000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });
});
