import { describe, it, expect } from 'vitest';
import { fuzzCoordinates, isLocationActive } from './locationPrivacy';

describe('Friends Map: Location Privacy & Fuzzing', () => {
  it('fuzzes precise coordinates to roughly 500m grid', () => {
    const raw = { lat: 35.689487, lng: 139.691706 }; // Tokyo Shinjuku
    const fuzzed = fuzzCoordinates(raw);
    expect(fuzzed.lat).toBe(35.69);
    expect(fuzzed.lng).toBe(139.69);
    expect(fuzzed.lat).not.toBe(raw.lat);
  });

  it('validates active locations within 4 hours', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(isLocationActive(twoHoursAgo)).toBe(true);
  });

  it('expires positions older than 4 hours', () => {
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();
    expect(isLocationActive(fiveHoursAgo)).toBe(false);
  });
});
