import { describe, it, expect } from 'vitest';
import {
  fuzzCoordinates,
  isLocationActive,
  calculateDistanceKm,
  formatLocationFreshness,
  canViewerSeeLocation,
} from './locationPrivacy';

describe('Friends Map: Location Privacy, Distance & Authorization', () => {
  it('fuzzes precise coordinates to roughly 500m grid to protect exact address', () => {
    const raw = { lat: 41.311081, lng: 69.240562 }; // Tashkent Amir Timur Square
    const fuzzed = fuzzCoordinates(raw);
    expect(fuzzed.lat).toBe(41.31);
    expect(fuzzed.lng).toBe(69.24);
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

  it('correctly calculates Haversine distance between Tashkent and Samarkand', () => {
    // Tashkent ~ (41.2995, 69.2401), Samarkand ~ (39.6542, 66.9597) -> approx ~270 km
    const dist = calculateDistanceKm(41.2995, 69.2401, 39.6542, 66.9597);
    expect(dist).toBeGreaterThan(250);
    expect(dist).toBeLessThan(300);
  });

  it('formats location freshness correctly', () => {
    const justNow = new Date().toISOString();
    expect(formatLocationFreshness(justNow).isStale).toBe(false);
    expect(formatLocationFreshness(justNow).label).toBe('Только что');

    const sixHoursAgo = new Date(Date.now() - 6 * 3600 * 1000).toISOString();
    expect(formatLocationFreshness(sixHoursAgo).isStale).toBe(true);
    expect(formatLocationFreshness(sixHoursAgo).label).toContain('Устарело');
  });

  it('strictly enforces viewer authorization rules', () => {
    // 1. If sharing is disabled, nobody can see (except owner preview)
    expect(canViewerSeeLocation(false, 'friends', true, false)).toBe(false);
    expect(canViewerSeeLocation(false, 'public', false, false)).toBe(false);

    // 2. Owner can always see their own location
    expect(canViewerSeeLocation(true, 'nobody', false, true)).toBe(true);
    expect(canViewerSeeLocation(false, 'nobody', false, true)).toBe(true);

    // 3. Visibility 'nobody' hides from everyone
    expect(canViewerSeeLocation(true, 'nobody', true, false)).toBe(false);
    expect(canViewerSeeLocation(true, 'nobody', false, false)).toBe(false);

    // 4. Visibility 'friends' requires friendship
    expect(canViewerSeeLocation(true, 'friends', true, false)).toBe(true);
    expect(canViewerSeeLocation(true, 'friends', false, false)).toBe(false);

    // 5. Visibility 'public' allows any viewer
    expect(canViewerSeeLocation(true, 'public', false, false)).toBe(true);
  });
});
