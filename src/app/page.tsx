'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useI18n } from '@/features/i18n/LanguageContext';
import { SEED_POSTS, SEED_STORIES } from '@/lib/seedData';
import { Post, Story } from '@/types/models';
import { PostCard } from '@/features/feed/PostCard';
import { StoriesTray } from '@/features/stories/StoriesTray';
import { Image as ImageIcon, Send, Sparkles, X, AlertCircle } from 'lucide-react';
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
  const [mediaPreview, setMediaPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [displayCount, setDisplayCount] = useState<number>(8);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    { id: 'all', label: t.all_moods, icon: '✦' },
    { id: 'chill', label: t.chill, icon: '🍃' },
    { id: 'funny', label: t.funny, icon: '😂' },
    { id: 'creative', label: t.creative, icon: '🎨' },
    { id: 'study', label: t.study, icon: '💻' },
  ];

  // Handle local image file upload & validation
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Файл слишком большой. Максимальный размер: 5 МБ.');
      return;
    }

    // Validate type
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setUploadError('Поддерживаются только форматы JPEG, PNG, WebP и GIF.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setMediaPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !currentUser || isSubmitting) return;

    setIsSubmitting(true);
    setUploadError('');

    try {
      const newPost: Post = {
        id: `post-${Date.now()}`,
        author_id: currentUser.id,
        author: currentUser,
        content: newPostContent.trim(),
        media_urls: mediaPreview ? [mediaPreview] : undefined,
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
      setMediaPreview('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      addXP(25, 'create_post', `post_${newPost.id}`);
    } catch (err) {
      console.error('Failed to create post:', err);
      setUploadError('Не удалось опубликовать пост. Попробуйте снова.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
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
    addXP(25, 'create_story', `story_${newStory.id}`);
  };

  const filteredPosts =
    activeMood === 'all'
      ? posts
      : posts.filter((p) => p.mood === activeMood);

  const visiblePosts = filteredPosts.slice(0, displayCount);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 animate-fade-in">
      {/* 24-Hour Stories Tray */}
      <StoriesTray stories={stories} currentUser={currentUser} onPostStory={handleAddStory} />

      {/* Post Creator Box */}
      {currentUser && (
        <div className="bg-card border border-border/80 rounded-3xl p-5 sm:p-6 shadow-sm">
          <form onSubmit={handleCreatePost} className="flex flex-col gap-4">
            <div className="flex items-start gap-3.5">
              <img
                src={currentUser.avatar_url}
                alt={currentUser.display_name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20 flex-shrink-0 mt-0.5"
              />
              <div className="flex-1 flex flex-col">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder={t.what_are_you_crafting}
                  rows={3}
                  className="w-full bg-transparent border-0 resize-none text-sm sm:text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 p-0 leading-relaxed"
                />

                {/* Attached Image Preview */}
                {mediaPreview && (
                  <div className="relative mt-3 rounded-2xl overflow-hidden border border-border/80 max-h-64 bg-secondary/20">
                    <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover max-h-64" />
                    <button
                      type="button"
                      onClick={() => {
                        setMediaPreview('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 text-foreground hover:bg-background transition shadow-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {uploadError && (
                  <div className="mt-2 text-xs text-rose-500 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between pt-3 border-t border-border/60 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {/* Media File Upload Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="feed-image-upload"
                />
                <label
                  htmlFor="feed-image-upload"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/70 cursor-pointer transition"
                >
                  <ImageIcon className="w-4 h-4 text-primary" />
                  <span>{t.media}</span>
                </label>

                {/* Mood Selector Dropdown */}
                <select
                  value={selectedMood}
                  onChange={(e) => setSelectedMood(e.target.value as any)}
                  className="bg-secondary/50 border border-border/80 rounded-xl px-2.5 py-1.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="chill">🍃 {t.chill}</option>
                  <option value="funny">😂 {t.funny}</option>
                  <option value="creative">🎨 {t.creative}</option>
                  <option value="study">💻 {t.study}</option>
                  <option value="none">✦ Без настроения</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!newPostContent.trim() || isSubmitting}
                className="px-5 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Публикация...' : t.post_to_wall}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mood Filters Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {moodFilters.map((mood) => {
          const isActive = activeMood === mood.id;
          return (
            <button
              key={mood.id}
              onClick={() => setActiveMood(mood.id)}
              className={cn(
                'px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-sm border',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-primary/20'
                  : 'bg-card text-muted-foreground hover:text-foreground border-border/80 hover:border-border'
              )}
            >
              <span>{mood.icon}</span>
              <span>{mood.label}</span>
            </button>
          );
        })}
      </div>

      {/* Feed Wall Stream */}
      <div className="flex flex-col gap-4">
        {visiblePosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={currentUser}
            onDelete={handleDeletePost}
          />
        ))}

        {visiblePosts.length === 0 && (
          <div className="p-10 rounded-3xl bg-card border border-border/80 text-center flex flex-col items-center gap-3">
            <Sparkles className="w-8 h-8 text-muted-foreground/60" />
            <h3 className="text-sm font-bold text-foreground">В этой категории пока нет публикаций</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Будьте первым, кто опубликует обновление в этой ленте!
            </p>
          </div>
        )}

        {/* Load More Button if more posts available */}
        {displayCount < filteredPosts.length && (
          <button
            onClick={() => setDisplayCount((prev) => prev + 6)}
            className="w-full py-3 rounded-2xl bg-secondary/50 border border-border/80 text-xs font-bold text-muted-foreground hover:text-foreground transition"
          >
            Загрузить ещё публикации ({filteredPosts.length - displayCount})
          </button>
        )}
      </div>
    </div>
  );
}
