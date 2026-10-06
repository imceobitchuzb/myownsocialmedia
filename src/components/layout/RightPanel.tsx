'use client';

import React from 'react';
import Link from 'next/link';
import { SEED_USERS, SEED_COMMUNITIES } from '@/lib/seedData';
import { BeltBadge } from '@/components/shared/BeltBadge';
import { Trophy, Flame, Sparkles } from 'lucide-react';

export const RightPanel: React.FC = () => {
  return (
    <aside className="hidden lg:flex flex-col w-80 h-screen sticky top-0 bg-card border-l border-border p-4 gap-6 overflow-y-auto select-none">
      {/* Ninja Leaderboard */}
      <div className="bg-secondary/40 border border-border/60 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-xs uppercase tracking-wider">Belt Leaderboard</h3>
          </div>
          <span className="text-[10px] text-muted-foreground">Top Clans</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {SEED_USERS.slice(0, 4).map((user, idx) => (
            <Link
              key={user.id}
              href={`/profile/${user.username}`}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-secondary/70 transition group"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold w-4 text-muted-foreground group-hover:text-primary">
                  #{idx + 1}
                </span>
                <img
                  src={user.avatar_url}
                  alt={user.display_name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold truncate max-w-[100px]">{user.display_name}</span>
                  <span className="text-[10px] text-muted-foreground">@{user.username}</span>
                </div>
              </div>
              <BeltBadge xp={user.xp} size="sm" showTitle={false} />
            </Link>
          ))}
        </div>
      </div>

      {/* Active Streaks Widget */}
      <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2 text-rose-500">
          <Flame className="w-4 h-4 fill-rose-500" />
          <h3 className="font-bold text-xs uppercase tracking-wider">Dojo Streaks</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          Exchange daily snaps with clan members to keep streaks burning.
        </p>
        <div className="flex items-center justify-between p-2.5 bg-card rounded-xl border border-border/80">
          <div className="flex items-center gap-2">
            <img
              src={SEED_USERS[1].avatar_url}
              alt={SEED_USERS[1].display_name}
              className="w-7 h-7 rounded-full object-cover"
            />
            <span className="text-xs font-semibold">{SEED_USERS[1].display_name}</span>
          </div>
          <div className="flex items-center gap-1 font-bold text-xs text-rose-500">
            <Flame className="w-3.5 h-3.5 fill-rose-500" />
            <span>12 Days</span>
          </div>
        </div>
      </div>

      {/* Recommended Communities */}
      <div className="bg-secondary/40 border border-border/60 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider">Top Communities</h3>
          </div>
          <Link href="/communities" className="text-[10px] text-primary hover:underline font-semibold">
            Explore
          </Link>
        </div>

        <div className="flex flex-col gap-2.5">
          {SEED_COMMUNITIES.map((comm) => (
            <Link
              key={comm.id}
              href={`/communities/${comm.slug}`}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-secondary/70 transition"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src={comm.avatar_url}
                  alt={comm.name}
                  className="w-8 h-8 rounded-lg object-cover"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold truncate max-w-[120px]">{comm.name}</span>
                  <span className="text-[10px] text-muted-foreground">{comm.members_count} ninjas</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
};
