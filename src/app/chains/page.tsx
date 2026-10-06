'use client';

import React, { useState } from 'react';
import { SEED_CHAINS } from '@/lib/seedData';
import { StoryChain, StoryChainNode } from '@/types/models';
import { useAuth } from '@/features/auth/AuthContext';
import { BeltBadge } from '@/components/shared/BeltBadge';
import { Sparkles, ThumbsUp, PlusCircle, CheckCircle2, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StoryChainsPage() {
  const { currentUser, addXP } = useAuth();
  const [chains, setChains] = useState<StoryChain[]>(SEED_CHAINS);
  const [selectedChain, setSelectedChain] = useState<StoryChain>(SEED_CHAINS[0]);
  const [continuationText, setContinuationText] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const handleVote = (nodeId: string) => {
    const updatedNodes = selectedChain.nodes.map((n) => {
      if (n.id === nodeId) {
        const nextVoted = !n.has_voted;
        return {
          ...n,
          has_voted: nextVoted,
          votes_count: nextVoted ? n.votes_count + 1 : n.votes_count - 1,
        };
      }
      return n;
    });

    const updatedChain = { ...selectedChain, nodes: updatedNodes };
    setSelectedChain(updatedChain);
    setChains(chains.map((c) => (c.id === updatedChain.id ? updatedChain : c)));
    addXP(10);
  };

  const handleSubmitContinuation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!continuationText.trim() || !currentUser) return;

    const newNode: StoryChainNode = {
      id: `node-${Date.now()}`,
      chain_id: selectedChain.id,
      author_id: currentUser.id,
      author: currentUser,
      round_number: selectedChain.current_round,
      content: continuationText.trim(),
      votes_count: 1,
      has_voted: true,
      is_winner: false,
      created_at: new Date().toISOString(),
    };

    const updatedChain = {
      ...selectedChain,
      nodes: [...selectedChain.nodes, newNode],
    };

    setSelectedChain(updatedChain);
    setChains(chains.map((c) => (c.id === updatedChain.id ? updatedChain : c)));
    setContinuationText('');
    setShowSubmitModal(false);
    addXP(40); // Story chain continuation earns +40 XP
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900/60 via-card to-secondary/80 border border-purple-500/30 rounded-3xl p-6 relative overflow-hidden shadow-sm">
        <div className="flex items-center gap-2.5 text-purple-400 mb-2">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider">Original Feature</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight mb-2">Collaborative Story Chains</h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg">
          One ninja starts the story with an opening sentence. Community members propose the next branch.
          The clan votes on the top continuation each round to build an epic collaborative episode!
        </p>
      </div>

      {/* Active Story Episode Card */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div>
            <span className="text-[11px] font-bold text-rose-500 uppercase">
              Round {selectedChain.current_round} Voting
            </span>
            <h2 className="text-lg font-bold mt-0.5">{selectedChain.title}</h2>
          </div>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-3.5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Next Part (+40 XP)</span>
          </button>
        </div>

        {/* Established Story Chapters (Winning nodes) */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Storyline So Far:</span>
          </h3>

          <div className="p-4 bg-secondary/30 rounded-2xl border border-border/60 flex flex-col gap-3 font-serif text-sm sm:text-base leading-relaxed italic text-foreground/90">
            {selectedChain.nodes
              .filter((n) => n.is_winner)
              .map((winnerNode, idx) => (
                <div key={winnerNode.id} className="relative pl-4 border-l-2 border-primary/50">
                  <p>"{winnerNode.content}"</p>
                  <span className="block mt-1 text-[11px] font-sans not-italic text-muted-foreground">
                    — {winnerNode.author.display_name} (Round {winnerNode.round_number} Selected)
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Current Round Candidates to Vote On */}
        <div className="flex flex-col gap-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Current Round Candidates (Vote for the canon continuation):
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {selectedChain.nodes
              .filter((n) => n.round_number === selectedChain.current_round && !n.is_winner)
              .map((node) => (
                <div
                  key={node.id}
                  className="p-4 bg-secondary/40 border border-border/80 rounded-2xl flex flex-col justify-between gap-3 hover:border-primary/40 transition"
                >
                  <p className="text-sm font-medium leading-relaxed">"{node.content}"</p>
                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={node.author.avatar_url}
                        alt={node.author.display_name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="font-semibold">{node.author.display_name}</span>
                      <BeltBadge xp={node.author.xp} size="sm" showTitle={false} />
                    </div>

                    <button
                      onClick={() => handleVote(node.id)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition',
                        node.has_voted
                          ? 'bg-rose-500 text-white shadow-sm'
                          : 'bg-card hover:bg-secondary text-foreground border border-border'
                      )}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{node.votes_count} Votes</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Continuation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4">
            <h3 className="text-base font-bold">Write Your Story Continuation</h3>
            <p className="text-xs text-muted-foreground">
              Write 1 to 2 engaging sentences that advance the plot. If your entry earns the most votes, it becomes the next canon chapter!
            </p>
            <form onSubmit={handleSubmitContinuation} className="flex flex-col gap-3">
              <textarea
                value={continuationText}
                onChange={(e) => setContinuationText(e.target.value)}
                rows={3}
                placeholder="What happens next? Type the next plot twist..."
                className="w-full bg-secondary border border-border rounded-xl p-3 text-xs focus:outline-none"
              />
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
                  disabled={!continuationText.trim()}
                  className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-xl disabled:opacity-50"
                >
                  Submit Branch (+40 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
