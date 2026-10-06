'use client';

import React, { useState } from 'react';
import { SEED_COMMUNITIES } from '@/lib/seedData';
import { Community } from '@/types/models';
import { Users, Shield, Plus, Check } from 'lucide-react';
import Link from 'next/link';

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>(SEED_COMMUNITIES);

  const toggleJoin = (id: string) => {
    setCommunities(
      communities.map((c) =>
        c.id === id ? { ...c, is_joined: !c.is_joined, members_count: c.is_joined ? c.members_count - 1 : c.members_count + 1 } : c
      )
    );
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="bg-gradient-to-r from-cyan-950/60 via-card to-secondary/80 border border-cyan-500/30 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-cyan-400 mb-2">
          <Users className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Ninja Clans</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight mb-2">Explore Communities</h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Find your niche clan. Share exclusive wall posts, collaborate on specialized challenges, and level up together.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {communities.map((comm) => (
          <div
            key={comm.id}
            className="bg-card border border-border/80 rounded-3xl overflow-hidden shadow-sm flex flex-col"
          >
            <div className="h-28 bg-neutral-900 relative">
              <img src={comm.cover_url} alt={comm.name} className="w-full h-full object-cover opacity-80" />
            </div>

            <div className="p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 -mt-10">
                  <img
                    src={comm.avatar_url}
                    alt={comm.name}
                    className="w-16 h-16 rounded-2xl border-4 border-card object-cover shadow-md"
                  />
                  <div className="mt-8">
                    <h2 className="font-bold text-base leading-tight">{comm.name}</h2>
                    <span className="text-xs text-muted-foreground">{comm.members_count.toLocaleString()} ninjas</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleJoin(comm.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                    comm.is_joined
                      ? 'bg-secondary text-foreground hover:bg-secondary/80'
                      : 'bg-primary text-primary-foreground hover:opacity-90 shadow-sm'
                  }`}
                >
                  {comm.is_joined ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Joined</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Join Clan</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-foreground/90 leading-relaxed">{comm.description}</p>

              <div className="p-3 bg-secondary/30 rounded-xl text-[11px] text-muted-foreground border border-border/50">
                <span className="font-bold text-foreground">Clan Rules: </span>
                {comm.rules_text}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
