'use client';

import React, { useState } from 'react';
import { SEED_USERS } from '@/lib/seedData';
import { Radio, Users, Heart, MessageSquare, Send, StopCircle, Sparkles, AlertCircle } from 'lucide-react';
import { BeltBadge } from '@/components/shared/BeltBadge';

interface LiveMessage {
  id: string;
  sender: string;
  text: string;
  sparks?: number;
}

export default function LiveStreamingPage() {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [streamTitle, setStreamTitle] = useState('Architecting Agentic Feeds in 2026: Executive Session');
  const [viewerCount, setViewerCount] = useState(48);
  const [sparksCount, setSparksCount] = useState(124);
  const [chatMessages, setChatMessages] = useState<LiveMessage[]>([
    { id: '1', sender: 'maya_ai', text: 'Great point on the sharding layout!' },
    { id: '2', sender: 'alex_cyber', text: 'Audio and bitrate crystal clear from Tokyo 🔥' },
    { id: '3', sender: 'elena_sound', text: 'Sent 10 Free Sparks! ⚡', sparks: 10 },
  ]);
  const [inputChat, setInputChat] = useState('');

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputChat.trim()) return;
    setChatMessages([
      ...chatMessages,
      { id: String(Date.now()), sender: 'You', text: inputChat.trim() },
    ]);
    setInputChat('');
  };

  const handleSendFreeSpark = () => {
    setSparksCount((prev) => prev + 5);
    setChatMessages([
      ...chatMessages,
      { id: String(Date.now()), sender: 'You', text: 'Sent 5 Free Dojo Sparks! ✨', sparks: 5 },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      {/* Stream Banner */}
      <div className="bg-gradient-to-r from-rose-950/70 via-card to-cyan-950/60 border border-rose-500/30 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 mb-1">
            <Radio className="w-5 h-5 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">Live Broadcast Dojo</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">{streamTitle}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Low-latency LiveKit broadcast • Free virtual sparks enabled
          </p>
        </div>

        <button
          onClick={() => setIsBroadcasting(!isBroadcasting)}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-lg ${
            isBroadcasting
              ? 'bg-rose-600 hover:bg-rose-700 text-white'
              : 'bg-gradient-to-r from-rose-500 to-cyan-500 hover:opacity-95 text-white'
          }`}
        >
          {isBroadcasting ? (
            <>
              <StopCircle className="w-4 h-4" />
              <span>End Broadcast</span>
            </>
          ) : (
            <>
              <Radio className="w-4 h-4" />
              <span>Go Live Now</span>
            </>
          )}
        </button>
      </div>

      {/* Main Broadcast Stage + Realtime Live Chat Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Canvas Stage */}
        <div className="lg:col-span-2 bg-neutral-950 border border-border/80 rounded-3xl overflow-hidden shadow-lg flex flex-col relative aspect-video">
          <img
            src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80"
            alt="Live Stream Visual"
            className="w-full h-full object-cover opacity-90"
          />

          {/* Broadcast HUD overlay */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="bg-rose-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                LIVE
              </span>
              <span className="bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Users className="w-3 h-3 text-cyan-400" />
                <span>{viewerCount} Viewers</span>
              </span>
            </div>

            <button
              onClick={handleSendFreeSpark}
              className="pointer-events-auto bg-amber-500/90 hover:bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 fill-white" />
              <span>Send Spark ({sparksCount})</span>
            </button>
          </div>
        </div>

        {/* Live Chat Column */}
        <div className="bg-card border border-border/80 rounded-3xl p-4 shadow-sm flex flex-col h-[420px]">
          <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider">Stream Chat</h3>
            </div>
            <span className="text-[10px] text-muted-foreground">Moderation Active</span>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-1 text-xs">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-2 rounded-xl flex flex-col gap-0.5 ${
                  msg.sparks ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-secondary/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-primary text-[11px]">@{msg.sender}</span>
                  {msg.sparks && (
                    <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                      +{msg.sparks} Sparks ⚡
                    </span>
                  )}
                </div>
                <p className="text-foreground/90">{msg.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-border/60">
            <input
              type="text"
              placeholder="Chat constructively..."
              value={inputChat}
              onChange={(e) => setInputChat(e.target.value)}
              className="flex-1 bg-secondary border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none"
            />
            <button
              type="submit"
              className="p-2 bg-primary text-primary-foreground rounded-xl text-xs hover:opacity-90"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
