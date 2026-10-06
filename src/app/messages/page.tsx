'use client';

import React, { useState } from 'react';
import { SEED_USERS } from '@/lib/seedData';
import { DirectMessage, User } from '@/types/models';
import { useAuth } from '@/features/auth/AuthContext';
import { BeltBadge } from '@/components/shared/BeltBadge';
import { Send, CheckCheck, Smile, Flame, Phone, Video, Play, Volume2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { VoiceVideoRecorder } from '@/features/chat/VoiceVideoRecorder';
import { CallModal } from '@/features/chat/CallModal';

export default function MessagesPage() {
  const { currentUser, addXP } = useAuth();
  const [selectedFriend, setSelectedFriend] = useState<User>(SEED_USERS[1]); // Maya Lin
  const [activeCall, setActiveCall] = useState<'voice' | 'video' | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([
    {
      id: 'msg-1',
      conversation_id: 'conv-1',
      sender_id: SEED_USERS[1].id,
      sender: SEED_USERS[1],
      content: 'Hey! Did you check out the new Story Chain prompt about Akihabara?',
      is_read: true,
      created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-2',
      conversation_id: 'conv-1',
      sender_id: currentUser?.id || 'user-demo',
      sender: currentUser || SEED_USERS[6],
      content: 'Yes! I just added my continuation node. We should do a study sprint soon too.',
      is_read: true,
      created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-3',
      conversation_id: 'conv-1',
      sender_id: SEED_USERS[1].id,
      sender: SEED_USERS[1],
      content: 'Awesome, count me in! Also sent you an ephemeral snap earlier today 🔥',
      is_read: true,
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser) return;

    const newMsg: DirectMessage = {
      id: `msg-${Date.now()}`,
      conversation_id: 'conv-1',
      sender_id: currentUser.id,
      sender: currentUser,
      content: inputText.trim(),
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setMessages([...messages, newMsg]);
    setInputText('');
    addXP(5);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)] bg-card border border-border/80 rounded-3xl overflow-hidden shadow-sm flex">
      {/* Conversation List Column */}
      <div className="w-1/3 border-r border-border/80 flex flex-col bg-secondary/20">
        <div className="p-4 border-b border-border/60">
          <h2 className="font-bold text-sm">Direct Messages</h2>
          <p className="text-[11px] text-muted-foreground">Encrypted peer communications</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          {SEED_USERS.filter((u) => u.id !== currentUser?.id).map((friend) => (
            <button
              key={friend.id}
              onClick={() => setSelectedFriend(friend)}
              className={`w-full p-2.5 rounded-2xl flex items-center gap-3 transition text-left ${
                selectedFriend.id === friend.id
                  ? 'bg-primary/10 border border-primary/30'
                  : 'hover:bg-secondary/60'
              }`}
            >
              <div className="relative">
                <img
                  src={friend.avatar_url}
                  alt={friend.display_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-card" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs truncate">{friend.display_name}</span>
                  <BeltBadge xp={friend.xp} size="sm" showTitle={false} />
                </div>
                <p className="text-[11px] text-muted-foreground truncate">{friend.status_line}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Chat Conversation Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={selectedFriend.avatar_url}
              alt={selectedFriend.display_name}
              className="w-9 h-9 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{selectedFriend.display_name}</span>
                <BeltBadge xp={selectedFriend.xp} size="sm" />
              </div>
              <span className="text-[11px] text-emerald-500 font-medium">Online • Active in Dojo</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveCall('voice')}
              className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground transition"
              title="Start voice call"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              onClick={() => setActiveCall('video')}
              className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground transition"
              title="Start HD video call"
            >
              <Video className="w-4 h-4 text-cyan-400" />
            </button>
            <div className="flex items-center gap-1.5 text-xs text-rose-500 font-bold bg-rose-500/10 px-2.5 py-1 rounded-full ml-2">
              <Flame className="w-3.5 h-3.5 fill-rose-500" />
              <span>12 Day Streak</span>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
          {messages.map((m) => {
            const isMe = m.sender_id === (currentUser?.id || 'user-demo');
            return (
              <div
                key={m.id}
                className={`flex flex-col max-w-[75%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
              >
                {/* Media renderers for Voice Notes and Circular Video messages */}
                {m.media_type === 'voice' ? (
                  <div
                    className={`p-3 rounded-2xl flex items-center gap-3 ${
                      isMe ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
                    }`}
                  >
                    <button className="p-2 bg-black/20 rounded-full">
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-semibold">Voice Message ({m.duration_sec || 5}s)</span>
                      {m.transcript && <span className="text-[10px] opacity-80 italic">{m.transcript}</span>}
                    </div>
                  </div>
                ) : m.media_type === 'video_circle' ? (
                  <div className="w-36 h-36 rounded-full overflow-hidden border-2 border-primary shadow-lg bg-black">
                    <video src={m.media_url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-secondary text-foreground rounded-bl-none border border-border/60'
                    }`}
                  >
                    {m.content}
                  </div>
                )}

                <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                  <span>{formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-cyan-400" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-border/80 flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-secondary/50 border border-border/80 rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <VoiceVideoRecorder
            onSendMedia={(type, url, durationSec, transcript) => {
              const newMsg: DirectMessage = {
                id: `msg-${Date.now()}`,
                conversation_id: 'conv-1',
                sender_id: currentUser?.id || 'user-demo',
                sender: currentUser || SEED_USERS[6],
                content: type === 'voice' ? 'Voice Message' : 'Video Circle',
                media_url: url,
                media_type: type,
                duration_sec: durationSec,
                transcript: transcript,
                is_read: false,
                created_at: new Date().toISOString(),
              };
              setMessages([...messages, newMsg]);
              addXP(10);
            }}
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-4 py-2.5 bg-primary text-primary-foreground rounded-2xl text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>

        {/* LiveKit Call Modal */}
        {activeCall && (
          <CallModal
            recipientName={selectedFriend.display_name}
            recipientAvatar={selectedFriend.avatar_url}
            callType={activeCall}
            onEndCall={() => setActiveCall(null)}
          />
        )}
      </div>
    </div>
  );
}
