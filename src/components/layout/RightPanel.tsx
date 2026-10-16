'use client';

import React from 'react';
import Link from 'next/link';
import { SEED_USERS, SEED_COMMUNITIES } from '@/lib/seedData';
import { BeltBadge } from '@/components/shared/BeltBadge';
import { Trophy, Flame, Sparkles, Compass, Users } from 'lucide-react';

export const RightPanel: React.FC = () => {
  return (
    <aside className="hidden lg:flex flex-col w-80 h-screen sticky top-0 bg-card border-l border-border p-4 gap-5 overflow-y-auto select-none">
      {/* 3D Radar Quick Teaser Banner */}
      <Link
        href="/map"
        className="p-4 rounded-3xl bg-gradient-to-br from-primary/15 via-secondary/30 to-card border border-primary/20 flex items-center justify-between group hover:border-primary/50 transition-all shadow-sm"
      >
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 animate-spin" />
            3D Globe Radar
          </span>
          <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition">
            Друзья на глобусе Земли
          </h4>
          <span className="text-[11px] text-muted-foreground">Интерактивная карта</span>
        </div>
        <div className="w-9 h-9 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
          3D
        </div>
      </Link>

      {/* Leaderboard Widget */}
      <div className="bg-secondary/30 border border-border/70 rounded-3xl p-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">Топ участников</h3>
          </div>
          <span className="text-[10px] text-muted-foreground font-semibold">Рейтинг</span>
        </div>

        <div className="flex flex-col gap-2">
          {SEED_USERS.slice(0, 4).map((user, idx) => (
            <Link
              key={user.id}
              href={`/profile/${user.username}`}
              className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-secondary/70 transition group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xs font-bold w-4 text-muted-foreground group-hover:text-primary">
                  #{idx + 1}
                </span>
                <img
                  src={user.avatar_url}
                  alt={user.display_name}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-border"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold truncate text-foreground">{user.display_name}</span>
                  <span className="text-[10px] text-muted-foreground">@{user.username}</span>
                </div>
              </div>
              <BeltBadge xp={user.xp} size="sm" showTitle={false} />
            </Link>
          ))}
        </div>
      </div>

      {/* Active Streaks Widget */}
      <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-4">
        <div className="flex items-center gap-2 mb-2 text-rose-500 px-1">
          <Flame className="w-4 h-4 fill-rose-500" />
          <h3 className="font-bold text-xs uppercase tracking-wider">Серия дней (Streak)</h3>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed mb-3 px-1">
          Обменивайтесь снимками (Snaps) ежедневно, чтобы поддерживать статус огненного стрика.
        </p>
        <div className="flex items-center justify-between p-2.5 bg-card rounded-2xl border border-border/80 shadow-sm">
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
            <span>14 дней</span>
          </div>
        </div>
      </div>

      {/* Recommended Communities Widget */}
      <div className="bg-secondary/30 border border-border/70 rounded-3xl p-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">Сообщества</h3>
          </div>
          <Link href="/communities" className="text-[10px] text-primary hover:underline font-semibold">
            Все
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          {SEED_COMMUNITIES.map((comm) => (
            <Link
              key={comm.id}
              href={`/communities/${comm.slug}`}
              className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-secondary/70 transition group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={comm.avatar_url}
                  alt={comm.name}
                  className="w-8 h-8 rounded-xl object-cover ring-1 ring-border"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold truncate text-foreground group-hover:text-primary transition">
                    {comm.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{comm.members_count.toLocaleString()} участников</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
};
