'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useI18n } from '@/features/i18n/LanguageContext';
import { SEED_POSTS, SEED_STORIES } from '@/lib/seedData';
import { Post, Story } from '@/types/models';
import { PostCard } from '@/features/feed/PostCard';
import { StoriesTray } from '@/features/stories/StoriesTray';
import { Image as ImageIcon, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { socialDataService } from '@/lib/socialDataService';

export default function FeedPage() {
  const { currentUser, addXP } = useAuth();
  const { t } = useI18n();
  const [posts, setPosts] = useState<Post[]>(SEED_POSTS);
  const [stories, setStories] = useState<Story[]>(SEED_STORIES);
  const [activeMood, setActiveMood] = useState<string>('all');
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<'chill' | 'funny' | 'creative' | 'study' | 'none'>('chill');
  const [mediaInput, setMediaInput] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);

  useEffect(() => {
    socialDataService.getPosts().then((loadedPosts) => {
      if (loadedPosts && loadedPosts.length > 0) {
        setPosts(loadedPosts);
      }
    });
    socialDataService.getStories().then((loadedStories) => {
      if (loadedStories && loadedStories.length > 0) {
        setStories(loadedStories);
      }
    });
  }, []);

  const moodFilters = [
    { id: 'all', label: t.all_moods, icon: '🌀' },
    { id: 'chill', label: t.chill, icon: '🍃' },
    { id: 'funny', label: t.funny, icon: '😂' },
    { id: 'creative', label: t.creative, icon: '🎨' },
    { id: 'study', label: t.study, icon: '📚' },
  ];

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !currentUser) return;

    const newPost: Post = {
      id: `post-${Date.now()}`,
      author_id: currentUser.id,
      author: currentUser,
      content: newPostContent.trim(),
      media_urls: mediaInput.trim() ? [mediaInput.trim()] : undefined,
      mood: selectedMood,
      privacy: 'public',
      likes_count: 0,
      comments_count: 0,
      has_liked: false,
      created_at: new Date().toISOString(),
    };

    await socialDataService.createPost(newPost);
    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setMediaInput('');
    setShowMediaInput(false);
    addXP(25); // Award +25 XP
  };

  const handleAddStory = async (imageUrl: string, text: string) => {
    if (!currentUser) return;
    const newStory: Story = {
      id: `story-${Date.now()}`,
      author_id: currentUser.id,
      author: currentUser,
      media_url: imageUrl,
      text_overlay: text || undefined,
      views_count: 1,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    };
    await socialDataService.createStory(newStory);
    setStories([newStory, ...stories]);
    addXP(25);
  };

  const filteredPosts = activeMood === 'all'
    ? posts
    : posts.filter((p) => p.mood === activeMood);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* 24-Hour Stories Tray */}
      <StoriesTray
        stories={stories}
        currentUser={currentUser}
        onPostStory={handleAddStory}
      />

      {/* Quick Post Creator */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm">
        <form onSubmit={handleCreatePost} className="flex flex-col gap-3">
          <div className="flex gap-3">
            {currentUser && (
              <img
                src={currentUser.avatar_url}
                alt={currentUser.display_name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20 flex-shrink-0"
              />
            )}
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder={t.what_are_you_crafting}
              rows={2}
              className="w-full bg-secondary/40 border border-border/60 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {showMediaInput && (
            <input
              type="text"
              placeholder="URL изображения..."
              value={mediaInput}
              onChange={(e) => setMediaInput(e.target.value)}
              className="bg-secondary/60 border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
            />
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowMediaInput(!showMediaInput)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary text-xs flex items-center gap-1.5 transition"
              >
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>{t.media}</span>
              </button>
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value as any)}
                className="bg-secondary border border-border rounded-lg px-2 py-1 text-xs font-medium focus:outline-none"
              >
                <option value="chill">🍃 {t.chill}</option>
                <option value="funny">😂 {t.funny}</option>
                <option value="creative">🎨 {t.creative}</option>
                <option value="study">📚 {t.study}</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={!newPostContent.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition flex items-center gap-1.5 shadow-sm shadow-primary/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t.post_to_wall}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Mood Feed Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {moodFilters.map((m) => {
          const isActive = activeMood === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveMood(m.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0 border',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                  : 'bg-card text-muted-foreground border-border/80 hover:bg-secondary hover:text-foreground'
              )}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Wall Stream Posts */}
      <div className="flex flex-col gap-4">
        {filteredPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={currentUser}
            onLikeToggle={async () => {
              if (currentUser) {
                await socialDataService.toggleLikePost(post.id, currentUser.id);
              }
              addXP(5);
            }}
            onAddComment={() => addXP(10)}
          />
        ))}
      </div>
    </div>
  );
}
