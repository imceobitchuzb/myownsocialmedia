// Location privacy and fuzzing utilities for SocialMediaUZ Friends 3D Radar

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Fuzzes coordinates to a ~500-meter grid resolution to protect user privacy.
 * 0.005 degrees latitude is roughly 555 meters.
 */
export function fuzzCoordinates(coords: LatLng): LatLng {
  const precision = 0.005;
  return {
    lat: Math.round(coords.lat / precision) * precision,
    lng: Math.round(coords.lng / precision) * precision,
  };
}

/**
 * Checks if location has expired (4-hour inactivity threshold)
 */
export function isLocationActive(lastReportedTimeStr: string, now = new Date()): boolean {
  if (!lastReportedTimeStr) return false;
  const lastReported = new Date(lastReportedTimeStr);
  if (isNaN(lastReported.getTime())) return false;
  const diffMs = now.getTime() - lastReported.getTime();
  const maxInactivityMs = 4 * 60 * 60 * 1000; // 4 hours
  return diffMs >= 0 && diffMs <= maxInactivityMs;
}

/**
 * Calculates great-circle distance between two points in kilometers using Haversine formula
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Formats time difference into human readable freshness
 */
export function formatLocationFreshness(updatedAtStr?: string): { label: string; isStale: boolean } {
  if (!updatedAtStr) return { label: 'Нет данных', isStale: true };
  const updated = new Date(updatedAtStr);
  if (isNaN(updated.getTime())) return { label: 'Нет данных', isStale: true };
  const diffMin = Math.round((Date.now() - updated.getTime()) / (60 * 1000));

  if (diffMin < 2) return { label: 'Только что', isStale: false };
  if (diffMin < 60) return { label: `${diffMin} мин назад`, isStale: false };
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 4) return { label: `${diffHours} ч назад`, isStale: false };
  return { label: `Устарело (>4 ч)`, isStale: true };
}

/**
 * Checks authorization: can a viewer see owner's location based on settings
 */
export function canViewerSeeLocation(
  ownerSharingEnabled: boolean,
  ownerVisibility: 'nobody' | 'friends' | 'public',
  isFriend: boolean,
  isOwnLocation: boolean
): boolean {
  if (isOwnLocation) return true;
  if (!ownerSharingEnabled) return false;
  if (ownerVisibility === 'nobody') return false;
  if (ownerVisibility === 'public') return true;
  if (ownerVisibility === 'friends') return isFriend;
  return false;
}
