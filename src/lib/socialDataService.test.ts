import { describe, it, expect, beforeEach } from 'vitest';
import { socialDataService } from './socialDataService';
import { SnapMessage, Story } from '../types/models';
import { SEED_USERS } from './seedData';

describe('Production Social Data & Security Engine', () => {
  it('enforces 24-hour expiration for Stories', async () => {
    const expiredStory: Story = {
      id: 'story-expired-1',
      author_id: 'user-1',
      author: SEED_USERS[0],
      media_url: 'https://example.com/img.jpg',
      views_count: 5,
      created_at: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
      expires_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(), // Expired 6h ago
    };

    const activeStory: Story = {
      id: 'story-active-1',
      author_id: 'user-1',
      author: SEED_USERS[0],
      media_url: 'https://example.com/img2.jpg',
      views_count: 10,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 18 * 3600 * 1000).toISOString(), // Active for 18h
    };

    await socialDataService.createStory(activeStory);
    const stories = await socialDataService.getStories();

    // Verify expired stories are filtered out
    expect(stories.some((s) => s.id === expiredStory.id)).toBe(false);
  });

  it('prohibits strangers from opening and burning private snaps (One-Time View Security)', async () => {
    const snap: SnapMessage = {
      id: 'snap-secure-1',
      sender_id: 'user-alice',
      sender: SEED_USERS[0],
      recipient_id: 'user-bob',
      recipient: SEED_USERS[1],
      media_url: 'https://example.com/private_snap.jpg',
      status: 'delivered',
      created_at: new Date().toISOString(),
    };

    await socialDataService.sendSnap(snap);

    // Stranger tries to burn snap -> must fail
    const strangerAttempt = await socialDataService.openAndBurnSnap('snap-secure-1', 'user-charlie');
    expect(strangerAttempt).toBe(false);

    // Legitimate recipient opens and burns snap -> must succeed
    const recipientAttempt = await socialDataService.openAndBurnSnap('snap-secure-1', 'user-bob');
    expect(recipientAttempt).toBe(true);

    // Replay attack: opening an already burnt snap -> must fail
    const replayAttempt = await socialDataService.openAndBurnSnap('snap-secure-1', 'user-bob');
    expect(replayAttempt).toBe(false);
  });
});
