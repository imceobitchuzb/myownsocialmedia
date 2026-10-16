'use client';

import React, { useState } from 'react';
import { SEED_COMMUNITIES } from '@/lib/seedData';
import { Community } from '@/types/models';
import { Users, Shield, Plus, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/AuthContext';

export default function CommunitiesPage() {
  const { addXP } = useAuth();
  const [communities, setCommunities] = useState<Community[]>(SEED_COMMUNITIES);

  const toggleJoin = (id: string) => {
    setCommunities(
      communities.map((c) => {
        if (c.id === id) {
          const next = !c.is_joined;
          if (next) addXP(15, 'join_community', `comm_${id}`);
          return {
            ...c,
            is_joined: next,
            members_count: next ? c.members_count + 1 : Math.max(1, c.members_count - 1),
          };
        }
        return c;
      })
    );
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 animate-fade-in">
      <div className="bg-gradient-to-br from-primary/15 via-card to-secondary/30 border border-primary/20 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-primary mb-2">
          <Users className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Сообщества & Гильдии</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight mb-2 text-foreground">Тематические сообщества</h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Находите единомышленников, делитесь эксклюзивными публикациями на стенах гильдий и развивайтесь вместе в SocialMediaUZ.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {communities.map((comm) => (
          <div
            key={comm.id}
            className="bg-card border border-border/80 rounded-3xl overflow-hidden shadow-sm flex flex-col hover:border-border transition-all"
          >
            <Link href={`/communities/${comm.slug}`} className="h-32 bg-neutral-900 relative block group">
              <img
                src={comm.cover_url}
                alt={comm.name}
                className="w-full h-full object-cover opacity-85 group-hover:scale-[1.01] transition-transform duration-300"
              />
            </Link>

            <div className="p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 -mt-10">
                  <Link href={`/communities/${comm.slug}`}>
                    <img
                      src={comm.avatar_url}
                      alt={comm.name}
                      className="w-16 h-16 rounded-2xl border-4 border-card object-cover shadow-md hover:scale-105 transition-transform"
                    />
                  </Link>
                  <div className="mt-8">
                    <Link
                      href={`/communities/${comm.slug}`}
                      className="font-bold text-base leading-tight text-foreground hover:text-primary transition"
                    >
                      {comm.name}
                    </Link>
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      {comm.members_count.toLocaleString()} участников
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleJoin(comm.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95 ${
                    comm.is_joined
                      ? 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
                      : 'bg-primary text-primary-foreground hover:opacity-90 shadow-sm'
                  }`}
                >
                  {comm.is_joined ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Вы участник</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Вступить (+15 XP)</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed mt-1">
                {comm.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                <Link
                  href={`/communities/${comm.slug}`}
                  className="font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <span>Открыть стену гильдии</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
