import { User, Post, Story, SnapMessage, StoryChain, WeeklyChallenge, NotificationItem } from '../types/models';
import { SEED_USERS, SEED_POSTS, SEED_STORIES, SEED_CHAINS, SEED_CHALLENGES } from './seedData';
import { isRealSupabaseConfigured, supabase } from './supabase/client';
import { getBeltRank } from './gamification';

const STORAGE_KEY_POSTS = 'ceoweb_store_posts';
const STORAGE_KEY_STORIES = 'ceoweb_store_stories';
const STORAGE_KEY_SNAPS = 'ceoweb_store_snaps';
const STORAGE_KEY_NOTIFICATIONS = 'ceoweb_store_notifications';
const STORAGE_KEY_CHAINS = 'ceoweb_store_chains';
const STORAGE_KEY_CHALLENGES = 'ceoweb_store_challenges';
const STORAGE_KEY_FOLLOWS = 'ceoweb_store_follows';
const STORAGE_KEY_XP_LEDGER = 'ceoweb_store_xp_ledger';

// In-memory cache for fast runtime & Node test execution
const memoryCache = new Map<string, any>();

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return memoryCache.has(key) ? memoryCache.get(key) : fallback;
  }
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : (memoryCache.has(key) ? memoryCache.get(key) : fallback);
  } catch {
    return memoryCache.has(key) ? memoryCache.get(key) : fallback;
  }
}

function setLocal<T>(key: string, data: T) {
  memoryCache.set(key, data);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.error('Storage write error:', err);
    }
  }
}

export interface FollowRecord {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface XpLedgerEntry {
  user_id: string;
  amount: number;
  source_action: string;
  source_ref_id: string;
  created_at: string;
}

export const socialDataService = {
  // ==========================================
  // 1. POSTS (CRUD with Database & Cache)
  // ==========================================
  async getPosts(): Promise<Post[]> {
    if (isRealSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*, author:profiles(*)')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data as unknown as Post[];
        }
      } catch (err) {
        console.error('Supabase getPosts error:', err);
      }
    }
    return getLocal<Post[]>(STORAGE_KEY_POSTS, SEED_POSTS);
  },

  async createPost(post: Post): Promise<Post> {
    if (!post.content || !post.author_id) {
      throw new Error('Post content and author are required');
    }

    if (isRealSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('posts')
          .insert({
            id: post.id,
            author_id: post.author_id,
            content: post.content,
            media_urls: post.media_urls || [],
            mood: post.mood || 'none',
            privacy: post.privacy || 'public',
            likes_count: 0,
            comments_count: 0,
          })
          .select('*, author:profiles(*)')
          .single();
        if (!error && data) {
          const current = getLocal<Post[]>(STORAGE_KEY_POSTS, SEED_POSTS);
          setLocal(STORAGE_KEY_POSTS, [data as unknown as Post, ...current]);
          return data as unknown as Post;
        }
      } catch (err) {
        console.error('Supabase createPost error:', err);
      }
    }

    const current = getLocal<Post[]>(STORAGE_KEY_POSTS, SEED_POSTS);
    const updated = [post, ...current];
    setLocal(STORAGE_KEY_POSTS, updated);
    return post;
  },

  async deletePost(postId: string, userId: string): Promise<boolean> {
    if (isRealSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('posts')
          .delete()
          .match({ id: postId, author_id: userId });
        if (error) return false;
      } catch {
        return false;
      }
    }

    const current = getLocal<Post[]>(STORAGE_KEY_POSTS, SEED_POSTS);
    const target = current.find((p) => p.id === postId);
    if (target && target.author_id !== userId) {
      // Authorization boundary: Only owner can delete their post
      return false;
    }
    const updated = current.filter((p) => p.id !== postId);
    setLocal(STORAGE_KEY_POSTS, updated);
    return true;
  },

  // ==========================================
  // 2. LIKES (Persistent & Idempotent)
  // ==========================================
  async toggleLikePost(postId: string, userId: string): Promise<{ liked: boolean; count: number }> {
    if (!userId || !postId) return { liked: false, count: 0 };

    if (isRealSupabaseConfigured() && supabase) {
      try {
        const { data: existing } = await supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', userId)
          .maybeSingle();

        if (existing) {
          await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
          const { count } = await supabase.from('post_likes').select('*', { count: 'exact', head: true }).eq('post_id', postId);
          const finalCount = count || 0;
          await supabase.from('posts').update({ likes_count: finalCount }).eq('id', postId);
          return { liked: false, count: finalCount };
        } else {
          await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
          const { count } = await supabase.from('post_likes').select('*', { count: 'exact', head: true }).eq('post_id', postId);
          const finalCount = count || 1;
          await supabase.from('posts').update({ likes_count: finalCount }).eq('id', postId);
          return { liked: true, count: finalCount };
        }
      } catch (err) {
        console.error('Supabase toggleLike error:', err);
      }
    }

    const current = getLocal<Post[]>(STORAGE_KEY_POSTS, SEED_POSTS);
    let result = { liked: false, count: 0 };
    const updated = current.map((p) => {
      if (p.id === postId) {
        const nextLiked = !p.has_liked;
        const nextCount = nextLiked ? p.likes_count + 1 : Math.max(0, p.likes_count - 1);
        result = { liked: nextLiked, count: nextCount };
        return { ...p, has_liked: nextLiked, likes_count: nextCount };
      }
      return p;
    });
    setLocal(STORAGE_KEY_POSTS, updated);
    return result;
  },

  // ==========================================
  // 3. FOLLOWS & SOCIAL GRAPH
  // ==========================================
  async followUser(followerId: string, followingId: string): Promise<boolean> {
    if (followerId === followingId) {
      throw new Error('Users cannot follow themselves');
    }

    if (isRealSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.from('follows').insert({
          follower_id: followerId,
          following_id: followingId,
        });
        if (error) {
          // If unique constraint violation, it's already followed
          return false;
        }
        return true;
      } catch {
        return false;
      }
    }

    const follows = getLocal<FollowRecord[]>(STORAGE_KEY_FOLLOWS, []);
    const exists = follows.some((f) => f.follower_id === followerId && f.following_id === followingId);
    if (exists) return false;

    const newFollow: FollowRecord = {
      follower_id: followerId,
      following_id: followingId,
      created_at: new Date().toISOString(),
    };
    setLocal(STORAGE_KEY_FOLLOWS, [...follows, newFollow]);
    return true;
  },

  async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    if (isRealSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('follows')
          .delete()
          .match({ follower_id: followerId, following_id: followingId });
        return !error;
      } catch {
        return false;
      }
    }

    const follows = getLocal<FollowRecord[]>(STORAGE_KEY_FOLLOWS, []);
    const updated = follows.filter((f) => !(f.follower_id === followerId && f.following_id === followingId));
    setLocal(STORAGE_KEY_FOLLOWS, updated);
    return true;
  },

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    if (isRealSupabaseConfigured() && supabase) {
      try {
        const { data } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', followerId)
          .eq('following_id', followingId)
          .maybeSingle();
        return Boolean(data);
      } catch {
        return false;
      }
    }

    const follows = getLocal<FollowRecord[]>(STORAGE_KEY_FOLLOWS, []);
    return follows.some((f) => f.follower_id === followerId && f.following_id === followingId);
  },

  async getFollowStats(userId: string): Promise<{ followersCount: number; followingCount: number }> {
    if (isRealSupabaseConfigured() && supabase) {
      try {
        const { count: followersCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', userId);
        const { count: followingCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', userId);
        return {
          followersCount: followersCount || 0,
          followingCount: followingCount || 0,
        };
      } catch {
        // Fall through
      }
    }

    const follows = getLocal<FollowRecord[]>(STORAGE_KEY_FOLLOWS, []);
    const followersCount = follows.filter((f) => f.following_id === userId).length;
    const followingCount = follows.filter((f) => f.follower_id === userId).length;
    return { followersCount, followingCount };
  },

  // ==========================================
  // 4. STORIES (Strict 24h Expiry & Views)
  // ==========================================
  async getStories(): Promise<Story[]> {
    const now = new Date().getTime();

    if (isRealSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('stories')
          .select('*, author:profiles(*)')
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data as unknown as Story[];
        }
      } catch (err) {
        console.error('Supabase getStories error:', err);
      }
    }

    const current = getLocal<Story[]>(STORAGE_KEY_STORIES, SEED_STORIES);
    // Strict 24h expiration enforcement
    const active = current.filter((s) => new Date(s.expires_at).getTime() > now);
    setLocal(STORAGE_KEY_STORIES, active);
    return active;
  },

  async createStory(story: Story): Promise<Story> {
    if (!story.media_url || !story.author_id) {
      throw new Error('Story media and author are required');
    }

    if (isRealSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('stories')
          .insert({
            id: story.id,
            author_id: story.author_id,
            media_url: story.media_url,
            text_overlay: story.text_overlay || null,
            views_count: 0,
            expires_at: story.expires_at,
          })
          .select('*, author:profiles(*)')
          .single();
        if (!error && data) {
          return data as unknown as Story;
        }
      } catch (err) {
        console.error('Supabase createStory error:', err);
      }
    }

    const current = await this.getStories();
    const updated = [story, ...current];
    setLocal(STORAGE_KEY_STORIES, updated);
    return story;
  },

  async recordStoryView(storyId: string, viewerId: string): Promise<boolean> {
    if (!storyId || !viewerId) return false;

    if (isRealSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.rpc('record_story_view', { p_story_id: storyId });
        if (!error && data) return Boolean(data);
      } catch (err) {
        console.error('Supabase recordStoryView error:', err);
      }
    }

    const current = getLocal<Story[]>(STORAGE_KEY_STORIES, SEED_STORIES);
    const updated = current.map((s) =>
      s.id === storyId ? { ...s, views_count: s.views_count + 1 } : s
    );
    setLocal(STORAGE_KEY_STORIES, updated);
    return true;
  },

  // ==========================================
  // 5. EPHEMERAL SNAPS (Atomic View-Once Burn)
  // ==========================================
  async getSnapsForUser(userId: string): Promise<SnapMessage[]> {
    const now = new Date().getTime();

    if (isRealSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('snaps')
          .select('*, sender:profiles!snaps_sender_id_fkey(*), recipient:profiles!snaps_recipient_id_fkey(*)')
          .or(`recipient_id.eq.${userId},sender_id.eq.${userId}`)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data as unknown as SnapMessage[];
        }
      } catch (err) {
        console.error('Supabase getSnaps error:', err);
      }
    }

    const snaps = getLocal<SnapMessage[]>(STORAGE_KEY_SNAPS, []);
    return snaps.filter((s) => {
      const isRelevant = s.recipient_id === userId || s.sender_id === userId;
      const isNotExpired = !s.opened_at || new Date().getTime() - new Date(s.created_at).getTime() < 24 * 3600 * 1000;
      return isRelevant && isNotExpired;
    });
  },

  async sendSnap(snap: SnapMessage): Promise<SnapMessage> {
    if (!snap.media_url || !snap.sender_id || !snap.recipient_id) {
      throw new Error('Snap requires sender, recipient, and media');
    }

    if (isRealSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('snaps')
          .insert({
            id: snap.id,
            sender_id: snap.sender_id,
            recipient_id: snap.recipient_id,
            media_url: snap.media_url,
            caption: snap.caption || null,
            status: 'delivered',
          })
          .select()
          .single();
        if (!error && data) {
          return data as unknown as SnapMessage;
        }
      } catch (err) {
        console.error('Supabase sendSnap error:', err);
      }
    }

    const current = getLocal<SnapMessage[]>(STORAGE_KEY_SNAPS, []);
    const updated = [snap, ...current];
    setLocal(STORAGE_KEY_SNAPS, updated);
    return snap;
  },

  /**
   * Atomic snap opening and burning.
   * Guarantees view-once replay-safety:
   * Only the designated recipient can burn the snap, and once burned,
   * any subsequent or concurrent request matches 0 rows and returns false.
   */
  async openAndBurnSnap(snapId: string, userId: string): Promise<boolean> {
    if (!snapId || !userId) return false;

    if (isRealSupabaseConfigured() && supabase) {
      try {
        // Try atomic PostgreSQL RPC burn function first
        const { data: rpcData, error: rpcError } = await supabase.rpc('burn_snap', { snap_id: snapId });
        if (!rpcError && rpcData && rpcData.length > 0) {
          return true;
        }

        // Fallback to atomic status match update
        const { data: updated, error } = await supabase
          .from('snaps')
          .update({ status: 'opened', opened_at: new Date().toISOString() })
          .match({ id: snapId, recipient_id: userId, status: 'delivered' })
          .select();
        if (!error && updated && updated.length > 0) {
          return true;
        }
        return false;
      } catch (err) {
        console.error('Supabase atomic snap burn error:', err);
        return false;
      }
    }

    // Atomic in-memory/cache validation
    const current = getLocal<SnapMessage[]>(STORAGE_KEY_SNAPS, []);
    const target = current.find((s) => s.id === snapId);
    if (!target) return false;

    // Security check 1: Only recipient can consume and burn
    if (target.recipient_id !== userId) return false;

    // Security check 2: Prevent replay of already burned snap
    if (target.status === 'opened') return false;

    const updated = current.map((s) =>
      s.id === snapId ? { ...s, status: 'opened' as const, opened_at: new Date().toISOString() } : s
    );
    setLocal(STORAGE_KEY_SNAPS, updated);
    return true;
  },

  // ==========================================
  // 6. SERVER-AUTHORITATIVE XP & GAMIFICATION
  // ==========================================
  /**
   * Idempotent XP awarding with bounds verification and belt recalculation.
   */
  async awardXP(
    userId: string,
    amount: number,
    action: string,
    refId?: string
  ): Promise<{ success: boolean; awarded: number; xp: number; belt_rank: string }> {
    if (!userId || amount <= 0 || amount > 100) {
      throw new Error('Invalid XP award request: amount must be between 1 and 100');
    }

    const idempotencyKey = refId || `${action}_${Date.now()}`;

    if (isRealSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.rpc('award_xp', {
          p_amount: amount,
          p_action: action,
          p_ref_id: idempotencyKey,
        });
        if (!error && data) {
          return data as { success: boolean; awarded: number; xp: number; belt_rank: string };
        }
      } catch (err) {
        console.error('Supabase awardXP error:', err);
      }
    }

    // Ledger idempotency check in memory/cache
    const ledger = getLocal<XpLedgerEntry[]>(STORAGE_KEY_XP_LEDGER, []);
    const alreadyAwarded = ledger.some(
      (entry) => entry.user_id === userId && entry.source_action === action && entry.source_ref_id === idempotencyKey
    );

    const users = getLocal<User[]>('ceoweb_store_users', SEED_USERS);
    const userIndex = users.findIndex((u) => u.id === userId);
    const currentUser = userIndex >= 0 ? users[userIndex] : SEED_USERS[0];

    if (alreadyAwarded) {
      return {
        success: false,
        awarded: 0,
        xp: currentUser.xp,
        belt_rank: currentUser.belt_rank,
      };
    }

    // Record in ledger
    const newEntry: XpLedgerEntry = {
      user_id: userId,
      amount,
      source_action: action,
      source_ref_id: idempotencyKey,
      created_at: new Date().toISOString(),
    };
    setLocal(STORAGE_KEY_XP_LEDGER, [...ledger, newEntry]);

    // Recalculate XP & Belt
    const newXp = currentUser.xp + amount;
    const newBelt = getBeltRank(newXp).rank;
    const updatedUser = { ...currentUser, xp: newXp, belt_rank: newBelt };

    if (userIndex >= 0) {
      users[userIndex] = updatedUser;
      setLocal('ceoweb_store_users', users);
    }

    return {
      success: true,
      awarded: amount,
      xp: newXp,
      belt_rank: newBelt,
    };
  },

  // ==========================================
  // 7. NOTIFICATIONS
  // ==========================================
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    if (isRealSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*, actor:profiles!notifications_sender_id_fkey(*)')
          .eq('recipient_id', userId)
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data as unknown as NotificationItem[];
        }
      } catch (err) {
        console.error('Supabase getNotifications error:', err);
      }
    }

    const notifs = getLocal<NotificationItem[]>(STORAGE_KEY_NOTIFICATIONS, []);
    return notifs.filter((n) => n.recipient_id === userId);
  },

  async addNotification(notif: NotificationItem): Promise<void> {
    if (isRealSupabaseConfigured() && supabase) {
      try {
        await supabase.from('notifications').insert({
          id: notif.id,
          recipient_id: notif.recipient_id,
          sender_id: notif.actor.id,
          type: notif.type,
          title: notif.message,
          content: notif.message,
          link: notif.link,
          is_read: false,
        });
      } catch (err) {
        console.error('Supabase addNotification error:', err);
      }
    }

    const notifs = getLocal<NotificationItem[]>(STORAGE_KEY_NOTIFICATIONS, []);
    setLocal(STORAGE_KEY_NOTIFICATIONS, [notif, ...notifs]);
  },

  async markAllNotificationsRead(userId: string): Promise<void> {
    if (isRealSupabaseConfigured() && supabase) {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('recipient_id', userId);
      } catch (err) {
        console.error('Supabase markAllNotificationsRead error:', err);
      }
    }

    const notifs = getLocal<NotificationItem[]>(STORAGE_KEY_NOTIFICATIONS, []);
    const updated = notifs.map((n) => (n.recipient_id === userId ? { ...n, is_read: true } : n));
    setLocal(STORAGE_KEY_NOTIFICATIONS, updated);
  },
};
