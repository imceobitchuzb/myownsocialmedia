'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { SEED_USERS, SEED_POSTS } from '@/lib/seedData';
import { BeltBadge } from '@/components/shared/BeltBadge';
import { XPProgressBar } from '@/components/shared/XPProgressBar';
import { PostCard } from '@/features/feed/PostCard';
import { useAuth } from '@/features/auth/AuthContext';
import { Edit3, UserPlus, Check, MessageSquare, Shield, Calendar } from 'lucide-react';
import { CreatorAnalytics } from '@/features/profile/CreatorAnalytics';

export default function ProfilePage() {
  const params = useParams();
  const username = params?.username as string;
  const { currentUser, updateCurrentUser, addXP } = useAuth();

  const user = SEED_USERS.find((u) => u.username === username) || (currentUser?.username === username ? currentUser : SEED_USERS[0]);
  const isOwnProfile = currentUser?.username === user.username;

  const [isEditing, setIsEditing] = useState(false);
  const [statusLine, setStatusLine] = useState(user.status_line);
  const [bio, setBio] = useState(user.bio);
  const [friendRequested, setFriendRequested] = useState(false);

  const userPosts = SEED_POSTS.filter((p) => p.author_id === user.id);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({
      status_line: statusLine,
      bio: bio,
    });
    setIsEditing(false);
    addXP(15);
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* Profile Header Banner Card */}
      <div className="bg-card border border-border/80 rounded-3xl overflow-hidden shadow-sm">
        {/* Dojo Cover Photo */}
        <div className="h-36 sm:h-44 bg-gradient-to-r from-rose-950 via-slate-900 to-cyan-950 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/10 to-transparent" />
        </div>

        {/* Profile Details Container */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-14 mb-4 gap-4">
            <div className="relative">
              <img
                src={user.avatar_url}
                alt={user.display_name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-card object-cover shadow-lg"
              />
            </div>

            <div className="flex items-center gap-2">
              {isOwnProfile ? (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                </button>
              ) : (
                <button
                  onClick={() => setFriendRequested(!friendRequested)}
                  className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition flex items-center gap-1.5 shadow-sm"
                >
                  {friendRequested ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                  <span>{friendRequested ? 'Request Sent' : 'Add Friend'}</span>
                </button>
              )}
            </div>
          </div>

          {/* User Name & Belt Badge */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{user.display_name}</h1>
              <span className="text-sm text-muted-foreground">@{user.username}</span>
              <BeltBadge xp={user.xp} size="md" />
            </div>

            {/* Status Line */}
            <p className="text-sm italic text-cyan-600 dark:text-cyan-400 font-medium">
              "{user.status_line || 'Honoring the code of discipline.'}"
            </p>

            {/* Bio */}
            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed mt-1">{user.bio}</p>

            {/* XP Progression Bar */}
            <div className="mt-3 p-3 bg-secondary/40 rounded-2xl border border-border/60">
              <XPProgressBar xp={user.xp} />
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Drawer */}
      {isEditing && (
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-3">Edit Profile & Status Line</h3>
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Status Line</label>
              <input
                type="text"
                value={statusLine}
                onChange={(e) => setStatusLine(e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs bg-secondary rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-xl"
              >
                Save Changes (+15 XP)
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Creator Analytics Panel */}
      <CreatorAnalytics />

      {/* Profile Wall Posts */}
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-bold flex items-center gap-2">
          <span>Personal Wall Posts</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
            {userPosts.length}
          </span>
        </h2>

        {userPosts.length > 0 ? (
          userPosts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={currentUser} />
          ))
        ) : (
          <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground text-xs">
            No wall posts yet. Share something with the clan!
          </div>
        )}
      </div>
    </div>
  );
}
