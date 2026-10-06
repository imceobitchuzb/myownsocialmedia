// Location privacy and fuzzing utilities for CEOWEB Friends Map

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
  const lastReported = new Date(lastReportedTimeStr);
  const diffMs = now.getTime() - lastReported.getTime();
  const maxInactivityMs = 4 * 60 * 60 * 1000; // 4 hours
  return diffMs <= maxInactivityMs;
}
