import { User, Post, Story, SnapMessage, StoryChain, WeeklyChallenge, NotificationItem } from '../types/models';
import { SEED_USERS, SEED_POSTS, SEED_STORIES, SEED_CHAINS, SEED_CHALLENGES } from './seedData';
import { isRealSupabaseConfigured, supabase } from './supabase/client';

const STORAGE_KEY_POSTS = 'ceoweb_store_posts';
const STORAGE_KEY_STORIES = 'ceoweb_store_stories';
const STORAGE_KEY_SNAPS = 'ceoweb_store_snaps';
const STORAGE_KEY_NOTIFICATIONS = 'ceoweb_store_notifications';
const STORAGE_KEY_CHAINS = 'ceoweb_store_chains';
const STORAGE_KEY_CHALLENGES = 'ceoweb_store_challenges';

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

export const socialDataService = {
  // --- POSTS ---
  async getPosts(): Promise<Post[]> {
    if (isRealSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('posts')
        .select('*, author:profiles(*)')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as unknown as Post[];
    }
    return getLocal<Post[]>(STORAGE_KEY_POSTS, SEED_POSTS);
  },

  async createPost(post: Post): Promise<Post> {
    if (isRealSupabaseConfigured() && supabase) {
      await supabase.from('posts').insert({
        id: post.id,
        author_id: post.author_id,
        content: post.content,
        media_urls: post.media_urls || [],
        mood: post.mood,
        privacy: post.privacy,
        likes_count: 0,
        comments_count: 0,
      });
    }
    const current = getLocal<Post[]>(STORAGE_KEY_POSTS, SEED_POSTS);
    const updated = [post, ...current];
    setLocal(STORAGE_KEY_POSTS, updated);
    return post;
  },

  async toggleLikePost(postId: string, userId: string): Promise<{ liked: boolean; count: number }> {
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

  // --- STORIES (with 24h expiration enforcement) ---
  async getStories(): Promise<Story[]> {
    const now = new Date().getTime();
    const current = getLocal<Story[]>(STORAGE_KEY_STORIES, SEED_STORIES);
    // Strict 24h expiration filter
    const active = current.filter((s) => new Date(s.expires_at).getTime() > now);
    setLocal(STORAGE_KEY_STORIES, active);
    return active;
  },

  async createStory(story: Story): Promise<Story> {
    const current = await this.getStories();
    const updated = [story, ...current];
    setLocal(STORAGE_KEY_STORIES, updated);
    return story;
  },

  // --- EPHEMERAL SNAPS (Strict One-Time View) ---
  async getSnapsForUser(userId: string): Promise<SnapMessage[]> {
    const snaps = getLocal<SnapMessage[]>(STORAGE_KEY_SNAPS, []);
    return snaps.filter((s) => s.recipient_id === userId || s.sender_id === userId);
  },

  async sendSnap(snap: SnapMessage): Promise<SnapMessage> {
    const current = getLocal<SnapMessage[]>(STORAGE_KEY_SNAPS, []);
    const updated = [snap, ...current];
    setLocal(STORAGE_KEY_SNAPS, updated);
    return snap;
  },

  async openAndBurnSnap(snapId: string, userId: string): Promise<boolean> {
    const current = getLocal<SnapMessage[]>(STORAGE_KEY_SNAPS, []);
    const target = current.find((s) => s.id === snapId);
    if (!target) return false;
    // Security check: Only recipient can consume and burn
    if (target.recipient_id !== userId) return false;
    if (target.status === 'opened') return false; // Already burnt

    const updated = current.map((s) =>
      s.id === snapId ? { ...s, status: 'opened' as const, opened_at: new Date().toISOString() } : s
    );
    setLocal(STORAGE_KEY_SNAPS, updated);
    return true;
  },

  // --- NOTIFICATIONS ---
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    const notifs = getLocal<NotificationItem[]>(STORAGE_KEY_NOTIFICATIONS, []);
    return notifs.filter((n) => n.recipient_id === userId);
  },

  async addNotification(notif: NotificationItem): Promise<void> {
    const notifs = getLocal<NotificationItem[]>(STORAGE_KEY_NOTIFICATIONS, []);
    setLocal(STORAGE_KEY_NOTIFICATIONS, [notif, ...notifs]);
  },

  async markAllNotificationsRead(userId: string): Promise<void> {
    const notifs = getLocal<NotificationItem[]>(STORAGE_KEY_NOTIFICATIONS, []);
    const updated = notifs.map((n) => (n.recipient_id === userId ? { ...n, is_read: true } : n));
    setLocal(STORAGE_KEY_NOTIFICATIONS, updated);
  },
};
