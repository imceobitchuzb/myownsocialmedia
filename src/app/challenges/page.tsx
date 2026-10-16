'use client';

import React, { useState } from 'react';
import { SEED_CHALLENGES, SEED_USERS } from '@/lib/seedData';
import { WeeklyChallenge } from '@/types/models';
import { useAuth } from '@/features/auth/AuthContext';
import { BeltBadge } from '@/components/shared/BeltBadge';
import { Trophy, Flame, Send, Heart, Medal, Clock, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChallengesPage() {
  const { currentUser, addXP } = useAuth();
  const [activeChallenge] = useState<WeeklyChallenge>(SEED_CHALLENGES[0]);
  const [submissionCaption, setSubmissionCaption] = useState('');
  const [submissionImage, setSubmissionImage] = useState(
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80'
  );
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const [leaderboard, setLeaderboard] = useState([
    {
      id: 'sub-1',
      author: SEED_USERS[0],
      caption:
        'Три 4K монитора на эргономичных кронштейнах, кастомная сплит-клавиатура с Kailh choc свитчами, мягкая контурная подсветка.',
      image:
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
      votes: 142,
      voted: false,
    },
    {
      id: 'sub-2',
      author: SEED_USERS[2],
      caption:
        'Уютная студия с аналоговым синтезатором Roland, акустическими панелями из тёмного дерева и тёплым светом.',
      image:
        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80',
      votes: 98,
      voted: true,
    },
  ]);

  const handleVoteSubmission = (subId: string) => {
    setLeaderboard(
      leaderboard.map((sub) => {
        if (sub.id === subId) {
          const nextVoted = !sub.voted;
          return {
            ...sub,
            voted: nextVoted,
            votes: nextVoted ? sub.votes + 1 : sub.votes - 1,
          };
        }
        return sub;
      })
    );
    addXP(10, 'vote_challenge', `vote_${subId}`);
  };

  const handleNewSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !submissionCaption.trim()) return;

    const newSub = {
      id: `sub-${Date.now()}`,
      author: currentUser,
      caption: submissionCaption.trim(),
      image: submissionImage,
      votes: 1,
      voted: true,
    };

    setLeaderboard([newSub, ...leaderboard]);
    setShowSubmitModal(false);
    setSubmissionCaption('');
    addXP(50, 'challenge_submit', `chall_${activeChallenge.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 animate-fade-in">
      {/* Banner */}
      <div className="bg-gradient-to-br from-amber-500/10 via-card to-primary/10 border border-amber-500/30 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-amber-500 mb-2">
          <Trophy className="w-5 h-5 fill-amber-500/20" />
          <span className="text-xs font-bold uppercase tracking-wider">Еженедельный челлендж</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight mb-2 text-foreground">{activeChallenge.title}</h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 max-w-xl">
          {activeChallenge.prompt}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border/50 text-xs">
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-amber-500" /> Осталось 4 дня
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Medal className="w-4 h-4 text-primary" /> Награда: 200 XP
            </span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl shadow-md hover:opacity-90 transition text-xs active:scale-95"
          >
            Участвовать (+50 XP)
          </button>
        </div>
      </div>

      {/* Submissions & Leaderboard */}
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-bold flex items-center justify-between text-foreground">
          <span>Работы участников ({leaderboard.length})</span>
          <span className="text-xs text-muted-foreground font-normal">Рейтинг по голосам</span>
        </h2>

        {leaderboard.map((sub, idx) => (
          <div
            key={sub.id}
            className="bg-card border border-border/80 rounded-3xl overflow-hidden shadow-sm flex flex-col"
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 text-center font-black text-sm text-amber-500">
                  #{idx + 1}
                </span>
                <img
                  src={sub.author.avatar_url}
                  alt={sub.author.display_name}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-border"
                />
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-foreground">{sub.author.display_name}</span>
                  <BeltBadge xp={sub.author.xp} size="sm" showTitle={false} />
                </div>
              </div>

              <button
                onClick={() => handleVoteSubmission(sub.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition active:scale-95',
                  sub.voted
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                )}
              >
                <Heart className={cn('w-3.5 h-3.5', sub.voted && 'fill-white')} />
                <span>{sub.votes}</span>
              </button>
            </div>

            <div className="max-h-80 overflow-hidden bg-secondary/30 border-y border-border/60">
              <img src={sub.image} alt={sub.caption} className="w-full h-full object-cover" />
            </div>

            <div className="p-4">
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">{sub.caption}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-foreground">Отправить работу на челлендж</h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleNewSubmission} className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Описание работы
                </label>
                <textarea
                  value={submissionCaption}
                  onChange={(e) => setSubmissionCaption(e.target.value)}
                  placeholder="Опишите ваше решение или конфигурацию..."
                  rows={3}
                  className="w-full bg-secondary/50 border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Ссылка на изображение
                </label>
                <input
                  type="url"
                  value={submissionImage}
                  onChange={(e) => setSubmissionImage(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 text-xs bg-secondary text-foreground rounded-xl"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={!submissionCaption.trim()}
                  className="px-4 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-50 shadow-sm"
                >
                  Отправить (+50 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
