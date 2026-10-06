const BANNED_WORDS = [
  'scam',
  'phishing',
  'hate',
  'violence',
  'malware',
  'exploit',
  'tokengrabber',
  'stealer',
];

export function containsProfanity(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return BANNED_WORDS.some((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lower);
  });
}

export function filterProfanity(text: string): string {
  if (!text) return '';
  let result = text;
  BANNED_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    result = result.replace(regex, '***');
  });
  return result;
}

// In-memory rate limiting map for posting and messages
const rateLimitMap = new Map<string, number[]>();

export function checkRateLimit(
  userId: string,
  action: 'post' | 'message' | 'friend_request',
  limit = 5,
  windowMs = 60000
): { allowed: boolean; retryAfterSec?: number } {
  const key = `${userId}:${action}`;
  const now = Date.now();
  const timestamps = rateLimitMap.get(key) || [];

  // Filter timestamps within current window
  const activeTimestamps = timestamps.filter((t) => now - t < windowMs);

  if (activeTimestamps.length >= limit) {
    const oldest = activeTimestamps[0];
    const retryAfterSec = Math.ceil((windowMs - (now - oldest)) / 1000);
    return { allowed: false, retryAfterSec };
  }

  activeTimestamps.push(now);
  rateLimitMap.set(key, activeTimestamps);
  return { allowed: true };
}
