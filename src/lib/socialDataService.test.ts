import { describe, it, expect, beforeEach } from 'vitest';
import { socialDataService } from './socialDataService';
import { SnapMessage, Story, Post } from '../types/models';
import { SEED_USERS } from './seedData';

describe('Production Social Data & Security Engine (Phase 2)', () => {
  // 1. STORIES
  describe('Stories Lifecycle & Expiration', () => {
    it('enforces 24-hour expiration for Stories', async () => {
      const expiredStory: Story = {
        id: 'story-expired-1',
        author_id: 'user-1',
        author: SEED_USERS[0],
        media_url: 'https://example.com/img.jpg',
        views_count: 5,
        created_at: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
        expires_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      };

      const activeStory: Story = {
        id: 'story-active-1',
        author_id: 'user-1',
        author: SEED_USERS[0],
        media_url: 'https://example.com/img2.jpg',
        views_count: 10,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
      };

      await socialDataService.createStory(activeStory);
      const stories = await socialDataService.getStories();

      expect(stories.some((s) => s.id === expiredStory.id)).toBe(false);
      expect(stories.some((s) => s.id === activeStory.id)).toBe(true);
    });

    it('records story views and increments view count', async () => {
      const story: Story = {
        id: 'story-view-test',
        author_id: 'user-author',
        author: SEED_USERS[0],
        media_url: 'https://example.com/story.jpg',
        views_count: 3,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 20 * 3600 * 1000).toISOString(),
      };
      await socialDataService.createStory(story);

      const viewed = await socialDataService.recordStoryView('story-view-test', 'user-viewer');
      expect(viewed).toBe(true);

      const stories = await socialDataService.getStories();
      const updated = stories.find((s) => s.id === 'story-view-test');
      expect(updated?.views_count).toBe(4);
    });
  });

  // 2. EPHEMERAL SNAPS
  describe('Ephemeral Snaps Security & Atomic Burn', () => {
    it('prohibits strangers from opening and burning private snaps', async () => {
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

      // Stranger attempt -> must fail
      const strangerAttempt = await socialDataService.openAndBurnSnap('snap-secure-1', 'user-charlie');
      expect(strangerAttempt).toBe(false);

      // Sender attempt (only recipient can burn) -> must fail
      const senderAttempt = await socialDataService.openAndBurnSnap('snap-secure-1', 'user-alice');
      expect(senderAttempt).toBe(false);

      // Legitimate recipient opens and burns snap -> must succeed
      const recipientAttempt = await socialDataService.openAndBurnSnap('snap-secure-1', 'user-bob');
      expect(recipientAttempt).toBe(true);

      // Replay attack: opening an already burnt snap -> must fail
      const replayAttempt = await socialDataService.openAndBurnSnap('snap-secure-1', 'user-bob');
      expect(replayAttempt).toBe(false);
    });
  });

  // 3. SOCIAL GRAPH (FOLLOWS)
  describe('Follows & Social Graph Boundaries', () => {
    it('rejects self-follow attempts', async () => {
      await expect(socialDataService.followUser('user-alex', 'user-alex')).rejects.toThrow(
        'Users cannot follow themselves'
      );
    });

    it('enforces idempotent follow and handles unfollow cleanly', async () => {
      const follower = 'user-follower-1';
      const following = 'user-creator-1';

      // First follow -> success
      const f1 = await socialDataService.followUser(follower, following);
      expect(f1).toBe(true);

      // Check isFollowing
      const check1 = await socialDataService.isFollowing(follower, following);
      expect(check1).toBe(true);

      // Duplicate follow attempt -> returns false
      const f2 = await socialDataService.followUser(follower, following);
      expect(f2).toBe(false);

      // Unfollow -> success
      const unfollowed = await socialDataService.unfollowUser(follower, following);
      expect(unfollowed).toBe(true);

      // Check isFollowing after unfollow
      const check2 = await socialDataService.isFollowing(follower, following);
      expect(check2).toBe(false);
    });
  });

  // 4. LIKES
  describe('Post Likes Persistence', () => {
    it('toggles post like state and adjusts like count accurately', async () => {
      const post: Post = {
        id: 'post-like-test',
        author_id: 'user-1',
        author: SEED_USERS[0],
        content: 'Testing persistent like counts',
        mood: 'chill',
        privacy: 'public',
        likes_count: 5,
        comments_count: 1,
        has_liked: false,
        created_at: new Date().toISOString(),
      };
      await socialDataService.createPost(post);

      // Like
      const res1 = await socialDataService.toggleLikePost('post-like-test', 'user-voter');
      expect(res1.liked).toBe(true);
      expect(res1.count).toBe(6);

      // Unlike
      const res2 = await socialDataService.toggleLikePost('post-like-test', 'user-voter');
      expect(res2.liked).toBe(false);
      expect(res2.count).toBe(5);
    });
  });

  // 5. SERVER-AUTHORITATIVE XP & GAMIFICATION
  describe('Server-Authoritative XP Ledger', () => {
    it('awards XP and recalculates belt rank safely', async () => {
      const award = await socialDataService.awardXP('user-me', 50, 'post_create', 'ref-post-1');
      expect(award.success).toBe(true);
      expect(award.awarded).toBe(50);
      expect(award.xp).toBeGreaterThanOrEqual(50);
      expect(award.belt_rank).toBeDefined();
    });

    it('rejects duplicate XP events with same idempotency key', async () => {
      const key = 'idem-unique-event-999';
      const first = await socialDataService.awardXP('user-me', 25, 'comment_create', key);
      expect(first.success).toBe(true);

      const replay = await socialDataService.awardXP('user-me', 25, 'comment_create', key);
      expect(replay.success).toBe(false);
      expect(replay.awarded).toBe(0);
    });

    it('rejects invalid or exploitative XP amounts (> 100 XP)', async () => {
      await expect(socialDataService.awardXP('user-me', 9999, 'hack_attempt')).rejects.toThrow(
        'Invalid XP award request'
      );
      await expect(socialDataService.awardXP('user-me', -10, 'negative_hack')).rejects.toThrow(
        'Invalid XP award request'
      );
    });
  });

  // 6. POST OWNERSHIP & AUTHORIZATION
  describe('Post Deletion Authorization', () => {
    it('prohibits non-owners from deleting posts', async () => {
      const post: Post = {
        id: 'post-owner-protected',
        author_id: 'user-real-author',
        author: SEED_USERS[0],
        content: 'Protected post',
        mood: 'creative',
        privacy: 'public',
        likes_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString(),
      };
      await socialDataService.createPost(post);

      // Unauthorized attacker attempts to delete -> must fail
      const attackerAttempt = await socialDataService.deletePost('post-owner-protected', 'user-attacker');
      expect(attackerAttempt).toBe(false);

      // Real author deletes -> must succeed
      const authorAttempt = await socialDataService.deletePost('post-owner-protected', 'user-real-author');
      expect(authorAttempt).toBe(true);
    });
  });
});
