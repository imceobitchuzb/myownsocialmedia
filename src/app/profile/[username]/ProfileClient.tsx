'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { SEED_USERS, SEED_POSTS } from '@/lib/seedData';
import { BeltBadge } from '@/components/shared/BeltBadge';
import { XPProgressBar } from '@/components/shared/XPProgressBar';
import { PostCard } from '@/features/feed/PostCard';
import { useAuth } from '@/features/auth/AuthContext';
import {
  Edit3,
  UserPlus,
  Check,
  MessageSquare,
  Shield,
  Calendar,
  MapPin,
  Image as ImageIcon,
  FileText,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { CreatorAnalytics } from '@/features/profile/CreatorAnalytics';
import { socialDataService } from '@/lib/socialDataService';
import { Post } from '@/types/models';
import Link from 'next/link';

export default function ProfileClient({ initialUsername }: { initialUsername?: string }) {
  const params = useParams();
  const username = (params?.username as string) || initialUsername || '';
  const { currentUser, updateCurrentUser, addXP } = useAuth();

  const user =
    SEED_USERS.find((u) => u.username === username) ||
    (currentUser?.username === username ? currentUser : SEED_USERS[0]);
  const isOwnProfile = currentUser?.username === user.username;

  const [activeTab, setActiveTab] = useState<'wall' | 'about' | 'media'>('wall');
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.display_name);
  const [statusLine, setStatusLine] = useState(user.status_line);
  const [bio, setBio] = useState(user.bio);
  const [city, setCity] = useState(user.city || 'Ташкент, Узбекистан');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followStats, setFollowStats] = useState({ followersCount: 42, followingCount: 18 });
  const [wallPosts, setWallPosts] = useState<Post[]>(SEED_POSTS.filter((p) => p.author_id === user.id));

  useEffect(() => {
    socialDataService.getPosts().then((posts) => {
      const filtered = posts.filter((p) => p.author_id === user.id || p.author?.username === user.username);
      if (filtered.length > 0) {
        setWallPosts(filtered);
      }
    });

    if (currentUser && currentUser.id !== user.id) {
      socialDataService.isFollowing(currentUser.id, user.id).then((res) => {
        setIsFollowing(res);
      });
    }

    socialDataService.getFollowStats(user.id).then((stats) => {
      if (stats.followersCount > 0 || stats.followingCount > 0) {
        setFollowStats(stats);
      }
    });
  }, [user.id, user.username, currentUser]);

  const handleToggleFollow = async () => {
    if (!currentUser || isOwnProfile) return;
    if (isFollowing) {
      await socialDataService.unfollowUser(currentUser.id, user.id);
      setIsFollowing(false);
      setFollowStats((prev) => ({ ...prev, followersCount: Math.max(0, prev.followersCount - 1) }));
    } else {
      await socialDataService.followUser(currentUser.id, user.id);
      setIsFollowing(true);
      setFollowStats((prev) => ({ ...prev, followersCount: prev.followersCount + 1 }));
      addXP(10, 'follow_user', `follow_${user.id}`);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({
      display_name: displayName,
      status_line: statusLine,
      bio: bio,
      city: city,
    });
    setIsEditing(false);
    addXP(15, 'edit_profile');
  };

  const mediaPosts = wallPosts.filter((p) => p.media_urls && p.media_urls.length > 0);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 animate-fade-in">
      {/* Profile Header Banner Card */}
      <div className="bg-card border border-border/80 rounded-3xl overflow-hidden shadow-sm">
        {/* Editorial Cover Photo */}
        <div className="h-36 sm:h-48 bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/10 to-transparent" />
        </div>

        {/* Profile Details Container */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-14 mb-4 gap-4">
            <div className="relative">
              <img
                src={user.avatar_url}
                alt={user.display_name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-card object-cover shadow-xl ring-2 ring-primary/20"
              />
            </div>

            <div className="flex items-center gap-2">
              {isOwnProfile ? (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold rounded-xl transition flex items-center gap-1.5 border border-border shadow-sm active:scale-95"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Отмена' : 'Редактировать'}</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleToggleFollow}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95 ${
                      isFollowing
                        ? 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
                        : 'bg-primary text-primary-foreground hover:opacity-90'
                    }`}
                  >
                    {isFollowing ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <UserPlus className="w-3.5 h-3.5" />}
                    <span>{isFollowing ? 'В друзьях' : 'Добавить в друзья'}</span>
                  </button>

                  <Link
                    href="/messages"
                    className="p-2 bg-secondary text-foreground hover:bg-secondary/80 rounded-xl transition border border-border"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* User Name & Belt Badge */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{user.display_name}</h1>
              <span className="text-sm text-muted-foreground">@{user.username}</span>
              <BeltBadge xp={user.xp} size="md" />
            </div>

            {/* Status Line */}
            {user.status_line && (
              <p className="text-sm italic text-primary font-medium">
                "{user.status_line}"
              </p>
            )}

            {/* Bio */}
            {user.bio && (
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed mt-1">{user.bio}</p>
            )}

            {/* City & Follow Stats */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2">
              {user.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {user.city}
                </span>
              )}
              <span>
                <strong className="text-foreground font-semibold">{followStats.followersCount}</strong> Подписчиков
              </span>
              <span>
                <strong className="text-foreground font-semibold">{followStats.followingCount}</strong> Подписок
              </span>
            </div>

            {/* XP Progression Bar */}
            <div className="mt-3 p-3 bg-secondary/30 rounded-2xl border border-border/60">
              <XPProgressBar xp={user.xp} />
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Drawer */}
      {isEditing && (
        <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm animate-fade-in">
          <h3 className="font-bold text-sm mb-4 text-foreground">Редактирование профиля</h3>
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-3.5">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Имя</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Статус</label>
              <input
                type="text"
                value={statusLine}
                onChange={(e) => setStatusLine(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Город</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">О себе</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs bg-secondary hover:bg-secondary/80 text-foreground rounded-xl transition"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition shadow-sm"
              >
                Сохранить (+15 XP)
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Creator Analytics Panel */}
      <CreatorAnalytics />

      {/* Profile Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-2">
        <button
          onClick={() => setActiveTab('wall')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'wall'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Публикации ({wallPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'media'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Медиа ({mediaPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'about'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Информация</span>
        </button>
      </div>

      {/* Tab: Wall Posts */}
      {activeTab === 'wall' && (
        <div className="flex flex-col gap-4">
          {wallPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onDelete={(id) => setWallPosts((prev) => prev.filter((p) => p.id !== id))}
            />
          ))}

          {wallPosts.length === 0 && (
            <div className="bg-card border border-border rounded-3xl p-8 text-center text-muted-foreground text-xs">
              На стене пока нет публикаций.
            </div>
          )}
        </div>
      )}

      {/* Tab: Media Gallery */}
      {activeTab === 'media' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {mediaPosts.map((post) => (
            <div key={post.id} className="relative rounded-2xl overflow-hidden aspect-square border border-border/80 group bg-secondary/30">
              <img
                src={post.media_urls![0]}
                alt="Media"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                <span className="text-[11px] text-white line-clamp-1">{post.content}</span>
              </div>
            </div>
          ))}

          {mediaPosts.length === 0 && (
            <div className="col-span-full bg-card border border-border rounded-3xl p-8 text-center text-muted-foreground text-xs">
              Медиафайлов пока нет.
            </div>
          )}
        </div>
      )}

      {/* Tab: About Info */}
      {activeTab === 'about' && (
        <div className="bg-card border border-border rounded-3xl p-6 flex flex-col gap-4 text-xs">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground font-semibold">Город</span>
            <span className="text-foreground text-sm font-medium">{user.city || 'Не указан'}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground font-semibold">О себе</span>
            <span className="text-foreground text-sm leading-relaxed">{user.bio || 'Пользователь не добавил описание.'}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground font-semibold">Ранг сообщества</span>
            <span className="text-foreground text-sm font-medium capitalize">{user.belt_rank} Belt ({user.xp} XP)</span>
          </div>
        </div>
      )}
    </div>
  );
}
