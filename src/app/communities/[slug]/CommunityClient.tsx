'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { SEED_COMMUNITIES, SEED_POSTS } from '@/lib/seedData';
import { useAuth } from '@/features/auth/AuthContext';
import { PostCard } from '@/features/feed/PostCard';
import { Users, Shield, Plus, Check, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

export default function CommunityClient({ initialSlug }: { initialSlug?: string }) {
  const params = useParams();
  const slug = (params?.slug as string) || initialSlug || 'tokyo-coders';
  const { currentUser, addXP } = useAuth();

  const community =
    SEED_COMMUNITIES.find((c) => c.slug === slug) || SEED_COMMUNITIES[0];

  const [isJoined, setIsJoined] = useState(community.is_joined || false);
  const [membersCount, setMembersCount] = useState(community.members_count);
  const [posts, setPosts] = useState(SEED_POSTS);
  const [newPostText, setNewPostText] = useState('');

  const handleToggleJoin = () => {
    const nextJoined = !isJoined;
    setIsJoined(nextJoined);
    setMembersCount((prev) => (nextJoined ? prev + 1 : Math.max(1, prev - 1)));
    if (nextJoined) {
      addXP(15, 'join_community', `comm_${community.id}`);
    }
  };

  const handleCreateCommunityPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() || !currentUser) return;

    const newPost = {
      id: `post-${Date.now()}`,
      author_id: currentUser.id,
      author: currentUser,
      community_id: community.id,
      community_name: community.name,
      content: newPostText.trim(),
      mood: 'study' as const,
      privacy: 'public' as const,
      likes_count: 0,
      comments_count: 0,
      created_at: new Date().toISOString(),
    };

    setPosts([newPost, ...posts]);
    setNewPostText('');
    addXP(25, 'community_post', `post_${newPost.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 animate-fade-in">
      {/* Back button */}
      <Link
        href="/communities"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Ко всем сообществам</span>
      </Link>

      {/* Community Hero Banner */}
      <div className="bg-card border border-border/80 rounded-3xl overflow-hidden shadow-sm">
        <div className="h-36 sm:h-48 bg-neutral-900 relative">
          <img src={community.cover_url} alt={community.name} className="w-full h-full object-cover opacity-85" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        </div>

        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 sm:-mt-14 mb-4 gap-4">
            <div className="relative">
              <img
                src={community.avatar_url}
                alt={community.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-card object-cover shadow-lg"
              />
            </div>

            <button
              onClick={handleToggleJoin}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 ${
                isJoined
                  ? 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
                  : 'bg-primary text-primary-foreground hover:opacity-90'
              }`}
            >
              {isJoined ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
              <span>{isJoined ? 'Вы участник' : 'Присоединиться (+15 XP)'}</span>
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">{community.name}</h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {community.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
              <span className="flex items-center gap-1.5 font-semibold text-foreground">
                <Users className="w-4 h-4 text-primary" />
                {membersCount.toLocaleString()} участников
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Community Rules Notice */}
      <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60 text-xs">
        <div className="flex items-center gap-2 font-bold mb-1 text-foreground">
          <Shield className="w-4 h-4 text-primary" />
          <span>Правила сообщества</span>
        </div>
        <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
          {community.rules_text}
        </p>
      </div>

      {/* Community Post Creator */}
      {isJoined && currentUser && (
        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm">
          <form onSubmit={handleCreateCommunityPost} className="flex flex-col gap-3">
            <textarea
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              placeholder={`Опубликовать в ${community.name}...`}
              rows={2}
              className="w-full bg-secondary/40 border border-border rounded-xl p-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newPostText.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Опубликовать в гильдию</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Community Feed */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-bold text-foreground">Публикации сообщества</h2>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={currentUser}
            onDelete={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
          />
        ))}
      </div>
    </div>
  );
}
