'use client';

import React, { useState } from 'react';
import { SEED_CHALLENGES, SEED_USERS } from '@/lib/seedData';
import { WeeklyChallenge } from '@/types/models';
import { useAuth } from '@/features/auth/AuthContext';
import { BeltBadge } from '@/components/shared/BeltBadge';
import { Trophy, Flame, Send, Heart, Medal, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChallengesPage() {
  const { currentUser, addXP } = useAuth();
  const [activeChallenge] = useState<WeeklyChallenge>(SEED_CHALLENGES[0]);
  const [submissionCaption, setSubmissionCaption] = useState('');
  const [submissionImage, setSubmissionImage] = useState('https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const [leaderboard, setLeaderboard] = useState([
    {
      id: 'sub-1',
      author: SEED_USERS[0],
      caption: 'Triple 4K monitors on ergo-arms, custom Ferris split keyboard with Kailh choc switches, ambient backlighting.',
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
      votes: 142,
      voted: false,
    },
    {
      id: 'sub-2',
      author: SEED_USERS[2],
      caption: 'Lo-fi cozy studio with Roland analog synthesizer, acoustic wood paneling, and warm amber lamps.',
      image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80',
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
    addXP(10);
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
    addXP(50); // Challenge submission earns +50 XP
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-950/70 via-card to-rose-950/50 border border-amber-500/30 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-amber-400 mb-2">
          <Trophy className="w-5 h-5 fill-amber-400/20" />
          <span className="text-xs font-bold uppercase tracking-wider">Weekly Clan Challenge</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight mb-2">{activeChallenge.title}</h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 max-w-xl">
          {activeChallenge.prompt}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border/50 text-xs">
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-amber-500" /> 4 Days Left
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Medal className="w-4 h-4 text-cyan-400" /> Reward: 200 XP + Dojo Champion
            </span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold rounded-xl shadow-md hover:opacity-95 transition text-xs"
          >
            Submit Entry (+50 XP)
          </button>
        </div>
      </div>

      {/* Submissions & Leaderboard */}
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-bold flex items-center justify-between">
          <span>Community Submissions & Rankings</span>
          <span className="text-xs text-muted-foreground font-normal">{leaderboard.length} entries</span>
        </h2>

        {leaderboard.map((sub, idx) => (
          <div
            key={sub.id}
            className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm flex flex-col"
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 text-center font-black text-sm text-amber-500">
                  #{idx + 1}
                </span>
                <img
                  src={sub.author.avatar_url}
                  alt={sub.author.display_name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs">{sub.author.display_name}</span>
                  <BeltBadge xp={sub.author.xp} size="sm" showTitle={false} />
                </div>
              </div>

              <button
                onClick={() => handleVoteSubmission(sub.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition',
                  sub.voted
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                )}
              >
                <Heart className={cn('w-3.5 h-3.5', sub.voted && 'fill-white')} />
                <span>{sub.votes} Votes</span>
              </button>
            </div>

            <div className="h-64 bg-black overflow-hidden">
              <img src={sub.image} alt="Submission" className="w-full h-full object-cover" />
            </div>

            <div className="p-4 text-xs text-foreground/90 leading-relaxed bg-secondary/20">
              {sub.caption}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Entry Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4">
            <h3 className="font-bold text-base">Submit Challenge Entry</h3>
            <form onSubmit={handleNewSubmission} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Image URL</label>
                <input
                  type="text"
                  value={submissionImage}
                  onChange={(e) => setSubmissionImage(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Setup Description & Specs</label>
                <textarea
                  value={submissionCaption}
                  onChange={(e) => setSubmissionCaption(e.target.value)}
                  rows={3}
                  placeholder="Tell the clan about your setup details..."
                  className="w-full bg-secondary border border-border rounded-xl p-3 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-3 py-1.5 text-xs bg-secondary rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!submissionCaption.trim()}
                  className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-xl disabled:opacity-50"
                >
                  Submit (+50 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
