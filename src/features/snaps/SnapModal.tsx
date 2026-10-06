'use client';

import React, { useState } from 'react';
import { Camera, Send, X, Flame } from 'lucide-react';
import { User } from '@/types/models';
import { SEED_USERS } from '@/lib/seedData';

interface SnapModalProps {
  currentUser: User | null;
  onClose: () => void;
  onSendSnap: (recipientId: string, mediaUrl: string, caption: string) => void;
}

export const SnapModal: React.FC<SnapModalProps> = ({
  currentUser,
  onClose,
  onSendSnap,
}) => {
  const [selectedFriend, setSelectedFriend] = useState(SEED_USERS[1].id); // Maya default
  const [caption, setCaption] = useState('');
  const [mediaUrl, setMediaUrl] = useState('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80');
  const [sent, setSent] = useState(false);

  const friends = SEED_USERS.filter((u) => u.id !== currentUser?.id);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    onSendSnap(selectedFriend, mediaUrl, caption);
    setSent(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm bg-card border border-border rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Send Ephemeral Snap</h3>
              <p className="text-xs text-muted-foreground">Self-destructs after single viewing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close snap camera"
            className="p-1 rounded-full text-muted-foreground hover:bg-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {sent ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Flame className="w-7 h-7 fill-rose-500 animate-bounce" />
            </div>
            <h4 className="font-bold text-lg">Snap Delivered!</h4>
            <p className="text-xs text-muted-foreground">Streak increased! +20 XP awarded.</p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex flex-col gap-3.5">
            {/* Viewfinder Preview */}
            <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-border bg-black">
              <img src={mediaUrl} alt="Snap preview" className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 bg-black/50 text-[10px] text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                Single-View Only
              </div>
            </div>

            {/* Recipient Picker */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Send to Friend</label>
              <select
                value={selectedFriend}
                onChange={(e) => setSelectedFriend(e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
              >
                {friends.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.display_name} (@{f.username})
                  </option>
                ))}
              </select>
            </div>

            {/* Caption */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Quick Caption</label>
              <input
                type="text"
                placeholder="Say something quick..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/20 hover:opacity-95 transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Snap & Boost Streak</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
